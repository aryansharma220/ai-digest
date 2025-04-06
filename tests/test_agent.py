import os
import sys

# Add the project root directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
from unittest.mock import Mock, patch
from datetime import datetime, timedelta
import json
from typing import Dict, List

from src.nodes.fetchers import GitHubFetcher, HuggingFaceFetcher, ArxivFetcher
from src.nodes.storage import Storage
from src.nodes.summarizer import Summarizer
from src.nodes.tagger import Tagger

class MockResponse:
    def __init__(self, json_data):
        self.json_data = json_data

    def json(self):
        return self.json_data

class TestGitHubFetcher(unittest.TestCase):
    def setUp(self):
        self.mock_github_client = Mock()
        self.fetcher = GitHubFetcher(self.mock_github_client)

    def test_fetch_trending_repos(self):
        # Mock repository data
        mock_repo = Mock()
        mock_repo.name = "test-repo"
        mock_repo.full_name = "user/test-repo"
        mock_repo.description = "Test repository"
        mock_repo.stargazers_count = 100
        mock_repo.created_at = datetime.now()
        mock_repo.updated_at = datetime.now()
        mock_repo.get_topics.return_value = ["ai", "machine-learning"]
        mock_repo.html_url = "https://github.com/user/test-repo"
        mock_repo.language = "Python"

        self.mock_github_client.search_repositories.return_value = [mock_repo]
        repos = self.fetcher.fetch_trending_repos(["ai"])
        
        self.assertEqual(len(repos), 1)
        self.assertEqual(repos[0].name, "test-repo")

class TestHuggingFaceFetcher(unittest.TestCase):
    def setUp(self):
        self.mock_api_client = Mock()
        self.fetcher = HuggingFaceFetcher(self.mock_api_client)

    def test_fetch_latest_models(self):
        # Mock the model list response
        mock_models_list = [{
            'id': 'test-model',
            'name': 'Test Model',
            'lastModified': '2023-01-01',
            'downloads': 1000
        }]
        
        # Mock the model details response
        mock_model_details = {
            'id': 'test-model',
            'description': 'Test description',
            'language': 'en',
            'license': 'MIT',
            'pipeline_tag': 'text-generation',
            'tasks': ['text-generation'],
            'tags': ['nlp']
        }

        # Setup mock responses
        self.mock_api_client.get.side_effect = [
            MockResponse(mock_models_list),  # First call for model list
            MockResponse(mock_model_details)  # Second call for model details
        ]
        
        models = self.fetcher.fetch_latest_models(limit=1)
        self.assertEqual(len(models), 1)
        self.assertEqual(models[0]['name'], 'Test Model')
        self.assertIn('model_card', models[0]['details'])

class TestArxivFetcher(unittest.TestCase):
    @patch('requests.get')
    def test_fetch_latest_papers(self, mock_get):
        mock_xml = """<?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
            <entry>
                <title>Test Paper</title>
                <summary>Test Summary</summary>
            </entry>
        </feed>
        """
        mock_get.return_value.text = mock_xml
        mock_get.return_value.raise_for_status = Mock()
        
        fetcher = ArxivFetcher(None)
        papers = fetcher.fetch_latest_papers(['cs.AI'])
        
        self.assertEqual(len(papers), 1)
        self.assertEqual(papers[0]['title'], 'Test Paper')

class TestStorage(unittest.TestCase):
    def setUp(self):
        self.mock_db = Mock()
        self.storage = Storage(self.mock_db)

    def test_store_summary(self):
        test_summary = {
            'title': 'Test Summary',
            'content': 'Test content',
            'source': 'test',
            'category': 'research'
        }
        
        self.mock_db.summaries.insert_one.return_value.inserted_id = 'test_id'
        result = self.storage.store_summary(test_summary)
        self.assertEqual(result, 'test_id')

class TestSummarizer(unittest.TestCase):
    def setUp(self):
        self.summarizer = Summarizer()

    def test_summarize_paper(self):
        paper = {
            'title': 'Test Paper',
            'summary': 'This is a test paper about AI. It contains important findings. The results are significant.',
            'authors': ['Author 1'],
            'categories': ['cs.AI']
        }
        
        summary = self.summarizer.summarize_paper(paper)
        self.assertEqual(summary.title, 'Test Paper')
        self.assertTrue(len(summary.content) <= self.summarizer.max_summary_length)

class TestTagger(unittest.TestCase):
    def setUp(self):
        self.tagger = Tagger()

    def test_tag_content(self):
        content = {
            'id': 'test_id',
            'title': 'Test GPT Model',
            'description': 'A new language model using transformer architecture',
            'metadata': {
                'topics': ['nlp', 'transformers'],
                'language': 'python'
            }
        }
        
        tagged = self.tagger.tag_content(content)
        self.assertEqual(tagged.primary_category, 'llm')
        self.assertTrue('transformers' in tagged.tags)

class TestIntegration(unittest.TestCase):
    def setUp(self):
        self.mock_github_client = Mock()
        self.mock_hf_client = Mock()
        self.mock_db = Mock()
        
        self.github_fetcher = GitHubFetcher(self.mock_github_client)
        self.hf_fetcher = HuggingFaceFetcher(self.mock_hf_client)
        self.arxiv_fetcher = ArxivFetcher(None)
        self.storage = Storage(self.mock_db)
        self.summarizer = Summarizer()
        self.tagger = Tagger()

    def test_full_pipeline(self):
        # Mock GitHub data
        mock_repo = self._create_mock_repo()
        self.mock_github_client.search_repositories.return_value = [mock_repo]

        # Mock HuggingFace data
        mock_model = self._create_mock_model()
        self.mock_hf_client.get.return_value = MockResponse([mock_model])

        # Test pipeline
        # 1. Fetch data
        repos = self.github_fetcher.fetch_trending_repos(["ai"])
        models = self.hf_fetcher.fetch_latest_models(limit=1)

        # 2. Summarize
        repo_summary = self.summarizer.summarize_repo(vars(repos[0]))
        model_summary = self.summarizer.summarize_model(models[0])

        # 3. Tag content
        tagged_repo = self.tagger.tag_content({
            'id': '1',
            'title': repo_summary.title,
            'description': repo_summary.content,
            'metadata': repo_summary.metadata
        })

        # 4. Store results
        self.mock_db.summaries.insert_one.return_value.inserted_id = 'test_id'
        stored_id = self.storage.store_summary({
            'title': tagged_repo.content_id,
            'content': repo_summary.content,
            'source': 'github',
            'category': tagged_repo.primary_category
        })

        self.assertIsNotNone(stored_id)
        self.assertEqual(tagged_repo.primary_category, 'llm')

    def _create_mock_repo(self):
        mock_repo = Mock()
        mock_repo.name = "test-llm"
        mock_repo.full_name = "user/test-llm"
        mock_repo.description = "A new language model implementation"
        mock_repo.stargazers_count = 100
        mock_repo.created_at = datetime.now()
        mock_repo.updated_at = datetime.now()
        mock_repo.get_topics.return_value = ["ai", "nlp"]
        mock_repo.html_url = "https://github.com/user/test-llm"
        mock_repo.language = "Python"
        return mock_repo

    def _create_mock_model(self):
        return {
            'id': 'test-model',
            'name': 'Test Model',
            'lastModified': '2023-01-01',
            'downloads': 1000,
            'description': 'A test language model',
            'language': 'en',
            'license': 'MIT',
            'tasks': ['text-generation'],
            'tags': ['nlp']
        }

if __name__ == '__main__':
    unittest.main()
