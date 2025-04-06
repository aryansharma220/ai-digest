from agents.github_agent import GitHubAgent
from agents.huggingface_agent import HuggingFaceAgent
from agents.arxiv_agent import ArxivAgent
from nodes.fetchers import GitHubFetcher, HuggingFaceFetcher, ArxivFetcher
from nodes.summarizer import Summarizer
from nodes.tagger import Tagger
from nodes.storage import Storage

class Workflow:
    def __init__(self):
        self.github_agent = GitHubAgent()
        self.huggingface_agent = HuggingFaceAgent()
        self.arxiv_agent = ArxivAgent()
        
        self.github_fetcher = GitHubFetcher()
        self.huggingface_fetcher = HuggingFaceFetcher()
        self.arxiv_fetcher = ArxivFetcher()
        
        self.summarizer = Summarizer()
        self.tagger = Tagger()
        self.storage = Storage()

    def run(self):
        # Fetch data from sources
        github_data = self.github_fetcher.fetch()
        huggingface_data = self.huggingface_fetcher.fetch()
        arxiv_data = self.arxiv_fetcher.fetch()

        # Summarize the fetched data
        summarized_github = self.summarizer.summarize_github(github_data)
        summarized_huggingface = self.summarizer.summarize_huggingface(huggingface_data)
        summarized_arxiv = self.summarizer.summarize_arxiv(arxiv_data)

        # Tag the summarized data
        tagged_github = self.tagger.tag(summarized_github)
        tagged_huggingface = self.tagger.tag(summarized_huggingface)
        tagged_arxiv = self.tagger.tag(summarized_arxiv)

        # Store the tagged data
        self.storage.store(tagged_github)
        self.storage.store(tagged_huggingface)
        self.storage.store(tagged_arxiv)

if __name__ == "__main__":
    workflow = Workflow()
    workflow.run()