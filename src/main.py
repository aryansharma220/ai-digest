import os
import time
import logging
from datetime import datetime, timezone
from dotenv import load_dotenv
from github import Github
from huggingface_hub import HfApi
from pymongo import MongoClient

from nodes.fetchers import GitHubFetcher, HuggingFaceFetcher, ArxivFetcher
from nodes.summarizer import Summarizer
from nodes.tagger import Tagger
from nodes.storage import Storage
from utils.db_config import get_db_config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def validate_tokens():
    """Validate API tokens before starting the agent."""
    # Check environment variables
    github_token = os.getenv('GITHUB_TOKEN')
    hf_token = os.getenv('HUGGINGFACE_TOKEN')
    mongodb_uri = os.getenv('MONGODB_URI')
    db_name = os.getenv('DB_NAME')
    
    # Validate required configurations
    if not github_token:
        raise ValueError("GitHub token not found. Set GITHUB_TOKEN in .env file")
    if not hf_token:
        raise ValueError("HuggingFace token not found. Set HUGGINGFACE_TOKEN in .env file")
    if not mongodb_uri:
        raise ValueError("MongoDB URI not found. Set MONGODB_URI in .env file")
    if not db_name:
        raise ValueError("Database name not found. Set DB_NAME in .env file")
    
    # Validate token formats
    if not github_token.startswith('ghp_'):
        raise ValueError("Invalid GitHub token format. Should start with 'ghp_'")
    if not hf_token.startswith('hf_'):
        raise ValueError("Invalid HuggingFace token format. Should start with 'hf_'")
    
    return github_token, hf_token

class AIDiscoveryAgent:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        
        # Validate tokens
        self.github_token, self.hf_token = validate_tokens()
        
        # Initialize API clients with better configuration
        try:
            self.github_client = Github(
                self.github_token,
                per_page=10,
                retry=5,
                timeout=15,
                user_agent="AI-Discovery-Agent/1.0"
            )
            # Test GitHub authentication
            self.github_client.get_user().login
            logger.info("Successfully authenticated with GitHub")
        except Exception as e:
            raise ValueError(f"GitHub authentication failed: {str(e)}")

        # Initialize HuggingFace client
        try:
            self.hf_client = HfApi(token=self.hf_token)
            # Test HuggingFace authentication
            self.hf_client.whoami()
            logger.info("Successfully authenticated with Hugging Face")
        except Exception as e:
            raise ValueError(f"Hugging Face authentication failed: {str(e)}")

        # Initialize MongoDB using the config
        db_config = get_db_config()
        self.db = db_config.db
        
        # Initialize components
        self.storage = Storage(self.db)
        self.summarizer = Summarizer()
        self.tagger = Tagger()
        
        # Initialize fetchers
        self.github_fetcher = GitHubFetcher(self.github_client)
        self.hf_fetcher = HuggingFaceFetcher(self.hf_client)
        self.arxiv_fetcher = ArxivFetcher()

    def run_discovery_cycle(self):
        """Run one complete discovery cycle."""
        try:
            # Check GitHub rate limit before starting
            rate_limit = self.github_client.get_rate_limit()
            if rate_limit.core.remaining < 50:  # Ensure enough quota
                reset_time = rate_limit.core.reset
                wait_time = (reset_time - datetime.now(timezone.utc)).seconds + 60
                logger.warning(f"Rate limit too low. Waiting {wait_time} seconds...")
                time.sleep(wait_time)

            # 1. Fetch data from all sources
            logger.info("Fetching data from sources...")
            
            repos = self.github_fetcher.fetch_trending_repos()
            models = self.hf_fetcher.fetch_latest_models(limit=10)
            papers = self.arxiv_fetcher.fetch_latest_papers()
            
            # 2. Process GitHub repositories
            logger.info("Processing GitHub repositories...")
            for repo in repos:
                try:
                    # Create summary
                    summary = self.summarizer.summarize_repo(vars(repo))
                    
                    # Tag content
                    tagged = self.tagger.tag_content({
                        'id': repo.full_name,
                        'title': repo.name,
                        'description': repo.description,
                        'metadata': {
                            'language': repo.language,
                            'topics': repo.topics,
                            'stars': repo.stars
                        }
                    })
                    
                    # Store in database
                    self.storage.store_summary({
                        'title': summary.title,
                        'content': summary.content,
                        'source': 'github',
                        'category': tagged.primary_category,
                        'tags': list(tagged.tags),
                        'url': repo.url,
                        'metadata': tagged.metadata
                    })
                except Exception as e:
                    logger.error(f"Error processing repo {repo.full_name}: {str(e)}")

            # 3. Process Hugging Face models
            logger.info("Processing Hugging Face models...")
            for model in models:
                try:
                    summary = self.summarizer.summarize_model(model)
                    tagged = self.tagger.tag_content({
                        'id': model['id'],
                        'title': model['name'],
                        'description': model['details']['model_card'].get('description', ''),
                        'metadata': model['details']
                    })
                    
                    self.storage.store_summary({
                        'title': summary.title,
                        'content': summary.content,
                        'source': 'huggingface',
                        'category': tagged.primary_category,
                        'tags': list(tagged.tags),
                        'metadata': tagged.metadata
                    })
                except Exception as e:
                    logger.error(f"Error processing model {model.get('id')}: {str(e)}")

            # 4. Process ArXiv papers
            logger.info("Processing ArXiv papers...")
            for paper in papers:
                try:
                    summary = self.summarizer.summarize_paper(paper)
                    tagged = self.tagger.tag_content({
                        'id': paper['title'],
                        'title': paper['title'],
                        'description': paper['summary'],
                        'metadata': {'source': 'arxiv'}
                    })
                    
                    self.storage.store_summary({
                        'title': summary.title,
                        'content': summary.content,
                        'source': 'arxiv',
                        'category': tagged.primary_category,
                        'tags': list(tagged.tags),
                        'metadata': tagged.metadata
                    })
                except Exception as e:
                    logger.error(f"Error processing paper {paper['title']}: {str(e)}")

            logger.info("Discovery cycle completed successfully")
            
        except Exception as e:
            logger.error(f"Error in discovery cycle: {str(e)}")
            if "rate limit exceeded" in str(e).lower():
                logger.info("Rate limit exceeded, waiting 1 hour...")
                time.sleep(3600)  # Wait an hour before retry

    def run(self, interval_minutes=60):
        """Run the agent continuously with specified interval."""
        logger.info(f"Starting AI Discovery Agent with {interval_minutes} minute interval")
        
        while True:
            try:
                self.run_discovery_cycle()
            except Exception as e:
                logger.error(f"Error in discovery cycle: {str(e)}")
                logger.info("Waiting 5 minutes before retry...")
                time.sleep(300)  # Wait 5 minutes before retrying
                continue
                
            logger.info(f"Sleeping for {interval_minutes} minutes...")
            time.sleep(interval_minutes * 60)

    def cleanup(self):
        """Cleanup resources."""
        self.storage.close()
        self.github_client.close()

def main():
    agent = None
    try:
        agent = AIDiscoveryAgent()
        agent.run()
    except KeyboardInterrupt:
        logger.info("Shutting down gracefully...")
    finally:
        if agent:
            agent.cleanup()

if __name__ == "__main__":
    main()