import os
import time
import requests
import logging
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from typing import Dict, List
from dataclasses import dataclass
from github.PaginatedList import PaginatedList
from github import Github, RateLimitExceededException

# Initialize logger
logger = logging.getLogger(__name__)


@dataclass
class RepoMetadata:
    name: str
    full_name: str
    description: str
    stars: int
    created_at: datetime
    updated_at: datetime
    topics: List[str]
    url: str
    language: str


class GitHubFetcher:
    def __init__(self, api_client):
        self.github_client = api_client
        self.logger = logging.getLogger(__name__)

    def fetch_trending_repos(self, keywords=None, days=7):
        if keywords is None:
            keywords = [
                "artificial-intelligence",
                "machine-learning",
                "deep-learning",
                "neural-networks",
                "ai-agents",
                "llm",
                "transformers",
                "autonomous-agents"
            ]
        
        date_threshold = datetime.now(timezone.utc) - timedelta(days=days)
        date_query = date_threshold.strftime("created:>%Y-%m-%d")
        trending_repos = []
        
        for keyword in keywords:
            try:
                # Check rate limit before making request
                rate_limit = self.github_client.get_rate_limit()
                if rate_limit.core.remaining < 10:
                    reset_time = rate_limit.core.reset
                    wait_time = (reset_time - datetime.now(timezone.utc)).seconds + 60
                    self.logger.warning(f"Rate limit low. Waiting {wait_time} seconds...")
                    time.sleep(wait_time)

                query = f"{keyword} {date_query} stars:>10 language:python"
                self.logger.info(f"Fetching repositories for query: {query}")
                
                repos: PaginatedList = self.github_client.search_repositories(
                    query=query,
                    sort="stars",
                    order="desc"
                )
                
                # Process repositories with rate limit awareness
                current_repos = []
                for repo in repos:
                    if len(current_repos) >= 10:
                        break
                        
                    try:
                        time.sleep(2)  # Delay between requests
                        topics = repo.get_topics()  # This makes an additional API call
                        
                        metadata = RepoMetadata(
                            name=repo.name,
                            full_name=repo.full_name,
                            description=repo.description or "",
                            stars=repo.stargazers_count,
                            created_at=repo.created_at,
                            updated_at=repo.updated_at,
                            topics=topics,
                            url=repo.html_url,
                            language=repo.language or "Unknown"
                        )
                        current_repos.append(metadata)
                        self.logger.debug(f"Processed repo: {repo.full_name}")
                        
                    except RateLimitExceededException:
                        self.logger.warning("Rate limit exceeded, waiting for reset...")
                        time.sleep(3600)  # Wait an hour
                        break
                    except Exception as e:
                        self.logger.error(f"Error processing repo {repo.full_name}: {str(e)}")
                        continue
                
                trending_repos.extend(current_repos)
                
            except RateLimitExceededException:
                self.logger.warning("Rate limit exceeded, waiting for reset...")
                time.sleep(3600)  # Wait an hour
                continue
            except Exception as e:
                self.logger.error(f"Error fetching repos for keyword {keyword}: {str(e)}")
                continue

        if not trending_repos:
            self.logger.warning("No repositories found for any keywords")
            return []

        # Remove duplicates and sort
        unique_repos = list({repo.full_name: repo for repo in trending_repos}.values())
        return sorted(unique_repos, key=lambda x: x.stars, reverse=True)

    def fetch_new_repos(self, keywords):
        # Reuse fetch_trending_repos but with a shorter timeframe
        return self.fetch_trending_repos(keywords)[:20]  # Return top 20 newest repos


class HuggingFaceFetcher:
    def __init__(self, api_client):
        self.api_client = api_client

    def fetch_latest_models(self, limit=10):
        try:
            # Using list_models instead of get
            models = self.api_client.list_models(
                limit=limit,
                sort="lastModified",
                direction=-1
            )
            
            return [
                {
                    'id': model.modelId,
                    'name': model.modelId.split('/')[-1],
                    'details': self._get_model_details(model.modelId),
                    'last_modified': getattr(model, 'lastModified', ''),
                    'downloads': getattr(model, 'downloads', 0)
                }
                for model in models
            ]
        except Exception as e:
            raise Exception(f"Error fetching models: {str(e)}")

    def fetch_popular_models(self):
        try:
            models = self.api_client.list_models(
                sort="downloads",
                direction=-1,
                limit=10
            )
            return [model.modelId for model in models]
        except Exception as e:
            raise Exception(f"Error fetching popular models: {str(e)}")

    def _get_model_details(self, model_id):
        try:
            model_info = self.api_client.model_info(model_id)
            return {
                'model_card': self._extract_model_card(model_info),
                'tags': getattr(model_info, 'tags', [])
            }
        except Exception as e:
            return {'model_card': {}, 'tags': []}

    def _extract_model_card(self, model_info):
        return {
            'description': getattr(model_info, 'description', ''),
            'language': getattr(model_info, 'language', ''),
            'license': getattr(model_info, 'license', ''),
            'pipeline_tag': getattr(model_info, 'pipeline_tag', ''),
            'tasks': getattr(model_info, 'tags', [])
        }


class ArxivFetcher:
    def __init__(self, api_client=None):  # Make api_client optional
        self.base_url = "http://export.arxiv.org/api/query?"
        self.categories = ["cs.AI", "cs.LG", "cs.CL", "cs.CV", "stat.ML"]
        self.api_client = api_client  # Store but don't require api_client

    def fetch_latest_papers(self, categories=None):
        if categories:
            self.categories = categories
            
        papers = []
        for category in self.categories:
            query = f"search_query=cat:{category}&sortBy=submittedDate&sortOrder=descending&max_results=5"
            response = self._make_request(query)
            papers.extend(self._parse_response(response))
        return papers

    def _make_request(self, query):
        response = requests.get(self.base_url + query)
        response.raise_for_status()
        return response.text

    def _parse_response(self, response):
        root = ET.fromstring(response)
        papers = []
        for entry in root.findall("{http://www.w3.org/2005/Atom}entry"):
            title = entry.find("{http://www.w3.org/2005/Atom}title").text
            summary = entry.find("{http://www.w3.org/2005/Atom}summary").text
            
            # Extract paper ID and URL
            paper_id = None
            url = None
            
            # Find the id element which contains the arxiv ID
            id_element = entry.find("{http://www.w3.org/2005/Atom}id")
            if id_element is not None and id_element.text:
                # Extract the arxiv ID from the URL
                id_text = id_element.text
                if "arxiv.org/abs/" in id_text:
                    paper_id = id_text.split("arxiv.org/abs/")[-1]
                    url = f"https://arxiv.org/abs/{paper_id}"
            
            # Find the direct URL if available
            links = entry.findall("{http://www.w3.org/2005/Atom}link")
            for link in links:
                if link.get("rel") == "alternate" or link.get("title") == "pdf":
                    url = link.get("href")
                    break
            
            paper = {
                "title": title, 
                "summary": summary,
                "id": paper_id,
                "url": url
            }
            papers.append(paper)
        return papers