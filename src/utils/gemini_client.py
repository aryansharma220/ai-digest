import os
import logging
import time
import random
from typing import Dict, Any, Optional
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, GoogleAPIError
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiClient:
    def __init__(self):
        """Initialize the Gemini API client."""
        load_dotenv()
        
        # Get API key from environment variables
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        # Configure the Gemini API
        genai.configure(api_key=api_key)
        
        # Get the generative model
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Configure rate limiting and retries
        self.max_retries = 5
        self.initial_backoff = 2  # seconds
        self.max_backoff = 60     # seconds
        
        logger.info("Gemini API client initialized successfully")

    def _backoff_and_retry(self, func, *args, **kwargs):
        """
        Execute function with exponential backoff for rate limiting.
        
        Args:
            func: Function to execute
            *args, **kwargs: Arguments to pass to the function
            
        Returns:
            The function result or None on failure
        """
        retries = 0
        backoff = self.initial_backoff
        
        while retries <= self.max_retries:
            try:
                return func(*args, **kwargs)
            except ResourceExhausted as e:
                # Check if we should retry
                if retries == self.max_retries:
                    logger.error(f"Maximum retries exceeded: {str(e)}")
                    return None
                
                # Extract retry delay if available
                retry_seconds = backoff
                if hasattr(e, 'retry_delay') and e.retry_delay:
                    retry_seconds = e.retry_delay.seconds + 1
                
                # Add jitter to avoid thundering herd
                jitter = random.uniform(0, 1)
                sleep_time = retry_seconds + jitter
                
                logger.warning(f"Rate limit exceeded. Retrying in {sleep_time:.2f} seconds...")
                time.sleep(sleep_time)
                
                # Increase backoff for next attempt
                retries += 1
                backoff = min(backoff * 2, self.max_backoff)
            except Exception as e:
                logger.error(f"Error in API call: {str(e)}")
                return None
    
    def generate_summary(self, entry: Dict[str, Any], max_tokens: int = 300) -> Optional[str]:
        """
        Generate a summary for an entry using Gemini API.
        
        Args:
            entry: The entry containing title, content, source, etc.
            max_tokens: Maximum length of the generated summary
            
        Returns:
            A summary string or None if generation failed
        """
        try:
            # Extract relevant information from the entry
            title = entry.get('title', '')
            content = entry.get('content', '')
            source = entry.get('source', '')
            category = entry.get('category', '')
            tags = ', '.join(entry.get('tags', []))
            
            # Create prompt for Gemini
            prompt = f"""
            Please provide a concise and informative summary of the following {source} entry:
            
            Title: {title}
            
            Content: {content}
            
            Category: {category}
            
            Tags: {tags}
            
            Your summary should be well-structured, factual, and highlight the key points of this {source} entry.
            The summary should be easily digestible for AI practitioners and researchers.
            Include what makes this notable and any practical applications if relevant.
            Keep the summary to maximum 3 short paragraphs.
            """
            
            # Generate response with backoff and retry
            def _generate():
                response = self.model.generate_content(prompt)
                if hasattr(response, 'text'):
                    return response.text.strip()
                return None
            
            summary = self._backoff_and_retry(_generate)
            
            if summary:
                logger.info(f"Successfully generated summary for '{title}'")
                return summary
            else:
                logger.warning(f"Failed to generate summary for '{title}'")
                return None
                
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            return None
            
    def categorize_entry(self, entry: Dict[str, Any]) -> Optional[str]:
        """
        Categorize an entry into a more specific category using Gemini API.
        
        Args:
            entry: The entry to categorize
            
        Returns:
            A category string or None if categorization failed
        """
        try:
            # Extract relevant information from the entry
            title = entry.get('title', '')
            content = entry.get('content', '')
            existing_category = entry.get('category', '')
            tags = ', '.join(entry.get('tags', []))
            
            # Create prompt for Gemini
            prompt = f"""
            Based on the following information, classify this AI-related content into ONE of these categories:
            - Large Language Models (LLM)
            - Computer Vision (CV)
            - Reinforcement Learning (RL)
            - Natural Language Processing (NLP)
            - MLOps
            - Multimodal Models
            - Research Paper
            - AI Tools
            
            Title: {title}
            
            Content: {content}
            
            Current category: {existing_category}
            
            Tags: {tags}
            
            Respond with ONLY the category name, nothing else.
            """
            
            # Generate response with backoff and retry
            def _generate():
                response = self.model.generate_content(prompt)
                if hasattr(response, 'text'):
                    return response.text.strip()
                return None
            
            category = self._backoff_and_retry(_generate)
            
            if category:
                logger.info(f"Categorized '{title}' as '{category}'")
                return category
            else:
                logger.warning(f"Failed to categorize '{title}', using existing category")
                return existing_category
                
        except Exception as e:
            logger.error(f"Error categorizing entry: {str(e)}")
            return existing_category
