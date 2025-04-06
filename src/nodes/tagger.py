from typing import Dict, List, Set, Any
import re
from dataclasses import dataclass
from collections import defaultdict

@dataclass
class TaggedContent:
    content_id: str
    primary_category: str
    tags: Set[str]
    relevance_scores: Dict[str, float]
    metadata: Dict[str, Any]

class Tagger:
    def __init__(self):
        # Define category keywords
        self.category_keywords = {
            'llm': {'language model', 'transformer', 'gpt', 'bert', 'llama', 'nlp'},
            'computer_vision': {'vision', 'image', 'object detection', 'segmentation', 'cnn'},
            'reinforcement_learning': {'rl', 'reinforcement', 'agent', 'policy', 'reward'},
            'mlops': {'deployment', 'pipeline', 'monitoring', 'optimization', 'infrastructure'},
            'research': {'paper', 'study', 'analysis', 'novel', 'methodology'}
        }

        # Define common AI/ML tags
        self.common_tags = {
            'techniques': {'deep learning', 'neural network', 'transfer learning', 'fine-tuning'},
            'applications': {'healthcare', 'finance', 'robotics', 'autonomous', 'recommendation'},
            'frameworks': {'pytorch', 'tensorflow', 'jax', 'keras', 'hugging face'},
            'topics': {'ethics', 'performance', 'efficiency', 'scalability', 'interpretability'}
        }

    def tag_content(self, content: Dict[str, Any]) -> TaggedContent:
        """Tag and categorize content based on its text and metadata."""
        try:
            # Extract text content
            text = self._extract_text_content(content)
            
            # Get primary category
            primary_category = self._determine_primary_category(text)
            
            # Generate tags
            tags = self._generate_tags(text, content.get('metadata', {}))
            
            # Calculate relevance scores
            relevance_scores = self._calculate_relevance_scores(text)
            
            return TaggedContent(
                content_id=content.get('id', ''),
                primary_category=primary_category,
                tags=tags,
                relevance_scores=relevance_scores,
                metadata=content.get('metadata', {})
            )
        except Exception as e:
            raise Exception(f"Error in content tagging: {str(e)}")

    def _extract_text_content(self, content: Dict[str, Any]) -> str:
        """Extract searchable text from content."""
        text_fields = [
            content.get('title', ''),
            content.get('description', ''),
            content.get('summary', ''),
            content.get('readme', '')
        ]
        return ' '.join(str(field).lower() for field in text_fields if field)

    def _determine_primary_category(self, text: str) -> str:
        """Determine the primary category based on keyword matches."""
        category_scores = defaultdict(int)
        
        for category, keywords in self.category_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    category_scores[category] += 1
        
        if not category_scores:
            return 'uncategorized'
        
        return max(category_scores.items(), key=lambda x: x[1])[0]

    def _generate_tags(self, text: str, metadata: Dict[str, Any]) -> Set[str]:
        """Generate tags based on content analysis and metadata."""
        tags = set()
        
        # Add tags based on common tag categories
        for category, keywords in self.common_tags.items():
            for keyword in keywords:
                if keyword in text:
                    tags.add(keyword)
        
        # Add tags from metadata
        if 'topics' in metadata:
            tags.update(set(metadata['topics']))
        if 'language' in metadata:
            tags.add(f"lang:{metadata['language']}")
            
        return tags

    def _calculate_relevance_scores(self, text: str) -> Dict[str, float]:
        """Calculate relevance scores for different aspects."""
        scores = {}
        total_words = len(text.split())
        
        # Calculate scores for each category
        for category, keywords in self.category_keywords.items():
            category_matches = sum(1 for keyword in keywords if keyword in text)
            scores[category] = min(1.0, category_matches / len(keywords))
        
        # Add content quality score based on length and keyword density
        scores['content_quality'] = min(1.0, total_words / 1000)  # Normalize by 1000 words
        
        return scores

    def analyze_trends(self, tagged_items: List[TaggedContent]) -> Dict[str, Any]:
        """Analyze trends in tagged content."""
        trend_analysis = {
            'popular_categories': defaultdict(int),
            'trending_tags': defaultdict(int),
            'emerging_topics': set()
        }
        
        for item in tagged_items:
            trend_analysis['popular_categories'][item.primary_category] += 1
            for tag in item.tags:
                trend_analysis['trending_tags'][tag] += 1
        
        return {
            'popular_categories': dict(trend_analysis['popular_categories']),
            'trending_tags': dict(trend_analysis['trending_tags']),
            'emerging_topics': list(trend_analysis['emerging_topics'])
        }