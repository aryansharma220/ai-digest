from typing import Dict, List, Any, Optional
from datetime import datetime
import re
from dataclasses import dataclass

@dataclass
class SummaryItem:
    title: str
    content: str
    source_type: str
    source_url: Optional[str]
    date: datetime
    metadata: Dict[str, Any]

class Summarizer:
    def __init__(self):
        self.max_summary_length = 250

    def summarize_paper(self, paper: Dict[str, Any]) -> SummaryItem:
        """Summarize an academic paper."""
        try:
            # Extract key information
            title = paper.get('title', '').replace('\n', ' ').strip()
            abstract = paper.get('summary', '')
            
            # Clean and format the abstract
            clean_abstract = self._clean_text(abstract)
            summary = self._extract_key_points(clean_abstract)

            return SummaryItem(
                title=title,
                content=summary,
                source_type='research_paper',
                source_url=paper.get('url'),
                date=datetime.now(),
                metadata={
                    'authors': paper.get('authors', []),
                    'categories': paper.get('categories', []),
                    'journal': paper.get('journal')
                }
            )
        except Exception as e:
            raise Exception(f"Error summarizing paper: {str(e)}")

    def summarize_repo(self, repo: Dict[str, Any]) -> SummaryItem:
        """Summarize a GitHub repository."""
        try:
            description = repo.get('description', '')
            readme = repo.get('readme', '')
            
            # Combine description and key points from README
            summary = description + '\n\n' if description else ''
            if readme:
                summary += self._extract_key_points(readme)

            return SummaryItem(
                title=repo.get('name', ''),
                content=self._truncate_text(summary),
                source_type='github_repo',
                source_url=repo.get('url'),
                date=datetime.now(),
                metadata={
                    'stars': repo.get('stars', 0),
                    'language': repo.get('language'),
                    'topics': repo.get('topics', []),
                    'last_updated': repo.get('updated_at')
                }
            )
        except Exception as e:
            raise Exception(f"Error summarizing repository: {str(e)}")

    def summarize_model(self, model: Dict[str, Any]) -> SummaryItem:
        """Summarize an AI model."""
        try:
            model_card = model.get('model_card', {})
            description = model_card.get('description', '')
            
            summary = self._extract_key_points(description)

            return SummaryItem(
                title=model.get('name', ''),
                content=self._truncate_text(summary),
                source_type='ai_model',
                source_url=model.get('url'),
                date=datetime.now(),
                metadata={
                    'downloads': model.get('downloads', 0),
                    'tasks': model_card.get('tasks', []),
                    'language': model_card.get('language'),
                    'license': model_card.get('license'),
                    'tags': model.get('tags', [])
                }
            )
        except Exception as e:
            raise Exception(f"Error summarizing model: {str(e)}")

    def _clean_text(self, text: str) -> str:
        """Clean and normalize text content."""
        # Remove extra whitespace and newlines
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters
        text = re.sub(r'[^\w\s.,;?!-]', '', text)
        return text.strip()

    def _extract_key_points(self, text: str) -> str:
        """Extract key points from longer text."""
        # Split into sentences
        sentences = re.split(r'[.!?]+', text)
        
        # Select important sentences (first few sentences)
        key_sentences = sentences[:3]
        
        # Combine and truncate
        summary = '. '.join(s.strip() for s in key_sentences if s.strip())
        return self._truncate_text(summary)

    def _truncate_text(self, text: str) -> str:
        """Truncate text to maximum length while keeping whole sentences."""
        if len(text) <= self.max_summary_length:
            return text
            
        # Find the last sentence break before max length
        truncated = text[:self.max_summary_length]
        last_break = max(
            truncated.rfind('.'),
            truncated.rfind('!'),
            truncated.rfind('?')
        )
        
        if last_break > 0:
            return text[:last_break + 1]
        return truncated + '...'