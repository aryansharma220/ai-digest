import unittest
from src.nodes.fetchers import GitHubFetcher, HuggingFaceFetcher, ArxivFetcher
from src.nodes.summarizer import Summarizer
from src.nodes.tagger import Tagger
from src.nodes.storage import Storage

class TestNodes(unittest.TestCase):

    def setUp(self):
        self.github_fetcher = GitHubFetcher()
        self.huggingface_fetcher = HuggingFaceFetcher()
        self.arxiv_fetcher = ArxivFetcher()
        self.summarizer = Summarizer()
        self.tagger = Tagger()
        self.storage = Storage()

    def test_github_fetcher(self):
        result = self.github_fetcher.fetch_trending_repos()
        self.assertIsInstance(result, list)

    def test_huggingface_fetcher(self):
        result = self.huggingface_fetcher.fetch_new_models()
        self.assertIsInstance(result, list)

    def test_arxiv_fetcher(self):
        result = self.arxiv_fetcher.fetch_latest_papers()
        self.assertIsInstance(result, list)

    def test_summarizer(self):
        sample_readme = "This is a sample README for testing."
        summary = self.summarizer.summarize_github_readme(sample_readme)
        self.assertIsInstance(summary, str)

    def test_tagger(self):
        sample_entry = {"title": "New NLP Model", "description": "A model for natural language processing."}
        tags = self.tagger.auto_classify(sample_entry)
        self.assertIsInstance(tags, list)

    def test_storage(self):
        sample_data = {"title": "Sample Data"}
        result = self.storage.store_data(sample_data)
        self.assertTrue(result)

if __name__ == '__main__':
    unittest.main()