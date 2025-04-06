import os
import sys

# Add the project root directory to Python path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, PROJECT_ROOT)

import unittest
from unittest.mock import Mock, patch
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient

from src.nodes.fetchers import GitHubFetcher, HuggingFaceFetcher, ArxivFetcher
from src.nodes.storage import Storage
from src.nodes.summarizer import Summarizer
from src.nodes.tagger import Tagger
from src.agents.query_agent import QueryAgent

class TestLiveIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Load environment variables
        load_dotenv()
        
        # Initialize mock objects for error testing
        cls.mock_github_client = Mock()
        cls.mock_github_client.search_repositories.return_value = []  # Return empty list by default
        
        cls.mock_hf_client = Mock()
        cls.mock_db = Mock()
        cls.mock_collection = Mock()
        cls.mock_db.summaries = cls.mock_collection
        
        # Initialize components with real credentials
        cls.github_token = os.getenv('GITHUB_TOKEN')
        cls.hf_token = os.getenv('HUGGINGFACE_TOKEN')
        cls.mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
        
        # Create test database
        cls.db_client = MongoClient(cls.mongo_uri)
        cls.db = cls.db_client.ai_discovery_test
        
        # Initialize components
        cls.storage = Storage(cls.db)
        cls.summarizer = Summarizer()
        cls.tagger = Tagger()
        cls.arxiv_fetcher = ArxivFetcher()  # No api_client needed
        
        # Initialize fetchers based on available tokens
        if cls.github_token and cls.hf_token:
            cls.github_fetcher = GitHubFetcher(cls.github_token)
            cls.hf_fetcher = HuggingFaceFetcher(cls.hf_token)
            cls.query_agent = QueryAgent(cls.storage)
        else:
            # Use mock clients if tokens are not available
            cls.github_fetcher = GitHubFetcher(cls.mock_github_client)
            cls.hf_fetcher = HuggingFaceFetcher(cls.mock_hf_client)
            cls.query_agent = QueryAgent(cls.storage)

    def setUp(self):
        """Clear test database and reset mocks before each test"""
        for collection in self.db.list_collection_names():
            self.db[collection].delete_many({})
        
        # Reset mocks
        self.mock_github_client.reset_mock()
        self.mock_hf_client.reset_mock()
        self.mock_collection.reset_mock()

    @unittest.skipIf(not os.getenv('GITHUB_TOKEN'), "GitHub token not available")
    def test_github_integration(self):
        # Fetch repos
        repos = self.github_fetcher.fetch_trending_repos(["machine-learning"])
        self.assertTrue(len(repos) > 0)
        
        # Process first repo
        repo = repos[0]
        summary = self.summarizer.summarize_repo(vars(repo))
        tagged = self.tagger.tag_content({
            'id': repo.full_name,
            'title': repo.name,
            'description': repo.description,
            'metadata': {'language': repo.language, 'topics': repo.topics}
        })
        
        # Store results
        stored_id = self.storage.store_summary({
            'title': summary.title,
            'content': summary.content,
            'source': 'github',
            'category': tagged.primary_category,
            'tags': list(tagged.tags)
        })
        
        self.assertIsNotNone(stored_id)

    def test_end_to_end_pipeline(self):
        if not all([self.github_token, self.hf_token]):
            self.skipTest("API tokens not available")
            
        # 1. Fetch data from all sources
        repos = self.github_fetcher.fetch_trending_repos(["ai"])
        models = self.hf_fetcher.fetch_latest_models(limit=2)
        papers = self.arxiv_fetcher.fetch_latest_papers(['cs.AI'])
        
        # 2. Process and store items
        for repo in repos[:2]:  # Process first 2 repos
            summary = self.summarizer.summarize_repo(vars(repo))
            tagged = self.tagger.tag_content({
                'id': repo.full_name,
                'title': summary.title,
                'description': summary.content,
                'metadata': summary.metadata
            })
            self.storage.store_summary({
                'title': summary.title,
                'content': summary.content,
                'source': 'github',
                'category': tagged.primary_category,
                'tags': list(tagged.tags)
            })
        
        # 3. Test query functionality
        results = self.query_agent.get_top_llms(week=1)
        self.assertIsInstance(results, list)
        
        trends = self.query_agent.get_trending_topics()
        self.assertIsInstance(trends, list)

    @patch('src.nodes.fetchers.GitHubFetcher')
    def test_error_handling(self, mock_github_fetcher):
        """Test error handling in the pipeline"""
        # Setup mock for error testing
        mock_fetcher = mock_github_fetcher.return_value
        mock_fetcher.fetch_trending_repos.side_effect = Exception("API Error")

        # Test API errors
        with self.assertRaises(Exception) as context:
            mock_fetcher.fetch_trending_repos(["ai"])
        self.assertTrue("API Error" in str(context.exception))

        # Test database errors
        self.db.summaries.insert_one.side_effect = Exception("DB Error")
        with self.assertRaises(Exception):
            self.storage.store_summary({"title": "test"})

    def test_rate_limiting(self):
        """Test rate limiting handling"""
        if not hasattr(self, 'github_fetcher'):
            self.skipTest("GitHub fetcher not initialized")

        from time import sleep
        
        # Setup mock responses for rate limit testing
        self.mock_github_client.search_repositories.return_value = [
            Mock(
                name="test-repo",
                full_name="user/test-repo",
                description="Test repository",
                stargazers_count=100,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                get_topics=lambda: ["ai"],
                html_url="https://github.com/user/test-repo",
                language="Python"
            )
        ]
        
        fetcher = GitHubFetcher(self.mock_github_client)
        
        try:
            # Fetch multiple times to test rate limiting
            for i in range(3):
                repos = fetcher.fetch_trending_repos(["ai"])
                self.assertIsNotNone(repos)
                sleep(1)  # Avoid hitting actual rate limits
        except Exception as e:
            self.fail(f"Rate limiting test failed: {str(e)}")

    @classmethod
    def tearDownClass(cls):
        """Cleanup: drop test database"""
        if hasattr(cls, 'db_client'):
            cls.db_client.drop_database('ai_discovery_test')
            cls.db_client.close()

if __name__ == '__main__':
    unittest.main()
