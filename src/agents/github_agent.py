import os
from datetime import datetime, timedelta
from typing import Dict, List
from github import Github
from dataclasses import dataclass

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
    def __init__(self, github_token: str = None):
        self.github_token = github_token or os.getenv("GITHUB_TOKEN")
        if not self.github_token:
            raise ValueError("GitHub token is required")
        self.github_client = Github(self.github_token)

    def fetch_trending_ai_repos(self, days_ago: int = 7) -> List[RepoMetadata]:
        """Fetch trending AI-related repositories from the last N days."""
        
        # AI-related search keywords
        ai_keywords = [
            "artificial-intelligence",
            "machine-learning",
            "deep-learning",
            "neural-networks",
            "ai-agents",
            "llm",
            "transformers",
            "autonomous-agents"
        ]

        # Calculate date threshold
        date_threshold = datetime.now() - timedelta(days=days_ago)
        date_query = date_threshold.strftime("created:>%Y-%m-%d")

        trending_repos = []
        
        for keyword in ai_keywords:
            # Search query
            query = f"{keyword} {date_query} stars:>10 language:python"
            
            try:
                repos = self.github_client.search_repositories(
                    query=query,
                    sort="stars",
                    order="desc"
                )

                # Process each repository
                for repo in repos[:10]:  # Get top 10 repos for each keyword
                    metadata = RepoMetadata(
                        name=repo.name,
                        full_name=repo.full_name,
                        description=repo.description or "",
                        stars=repo.stargazers_count,
                        created_at=repo.created_at,
                        updated_at=repo.updated_at,
                        topics=repo.get_topics(),
                        url=repo.html_url,
                        language=repo.language or "Unknown"
                    )
                    trending_repos.append(metadata)

            except Exception as e:
                print(f"Error fetching repos for keyword {keyword}: {str(e)}")
                continue

        # Remove duplicates based on full_name
        unique_repos = list({repo.full_name: repo for repo in trending_repos}.values())
        
        # Sort by stars
        return sorted(unique_repos, key=lambda x: x.stars, reverse=True)

    def get_repo_details(self, repo_name: str) -> Dict:
        """Get detailed information about a specific repository."""
        try:
            repo = self.github_client.get_repo(repo_name)
            return {
                "name": repo.name,
                "full_name": repo.full_name,
                "description": repo.description,
                "stars": repo.stargazers_count,
                "forks": repo.forks_count,
                "created_at": repo.created_at,
                "updated_at": repo.updated_at,
                "topics": repo.get_topics(),
                "url": repo.html_url,
                "readme": self._get_readme_content(repo),
                "language": repo.language
            }
        except Exception as e:
            print(f"Error fetching repo details for {repo_name}: {str(e)}")
            return {}

    def _get_readme_content(self, repo) -> str:
        """Get README content from repository."""
        try:
            readme = repo.get_readme()
            return readme.decoded_content.decode('utf-8')
        except:
            return ""

# Usage example:
if __name__ == "__main__":
    fetcher = GitHubFetcher()
    trending_repos = fetcher.fetch_trending_ai_repos(days_ago=7)
    
    for repo in trending_repos[:5]:  # Display top 5 trending repos
        print(f"\nRepository: {repo.full_name}")
        print(f"Description: {repo.description}")
        print(f"Stars: {repo.stars}")
        print(f"Topics: {', '.join(repo.topics)}")
        print(f"URL: {repo.url}")
        print("-" * 80)