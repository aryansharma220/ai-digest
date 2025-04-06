import logging
import time
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from pymongo.database import Database
from pymongo.collection import Collection

from src.utils.gemini_client import GeminiClient
from src.nodes.digest_storage import DigestStorage

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DigestSummarizer:
    def __init__(self, source_db: Database, digest_db: Database):
        """
        Initialize the digest summarizer.
        
        Args:
            source_db: MongoDB database with raw entries
            digest_db: MongoDB database for storing digests
        """
        self.source_collection = source_db.summaries
        self.digest_storage = DigestStorage(digest_db)
        self.gemini_client = GeminiClient()
        
        # Configure batch processing
        self.batch_size = 10
        self.delay_between_batches = 30  # seconds
        
        logger.info("Digest summarizer initialized")
        
    def process_new_entries(self, hours_back: int = 24) -> Dict[str, int]:
        """
        Process new entries from the source database and generate digests.
        
        Args:
            hours_back: Process entries from the last N hours
            
        Returns:
            Statistics about processed entries
        """
        try:
            # Calculate time threshold
            time_threshold = datetime.now() - timedelta(hours=hours_back)
            
            # Query for new entries
            query = {"date_created": {"$gte": time_threshold}}
            
            # Get new entries
            new_entries = list(self.source_collection.find(query))
            logger.info(f"Found {len(new_entries)} new entries to process")
            
            stats = {
                "total": len(new_entries),
                "processed": 0,
                "failed": 0,
                "skipped": 0
            }
            
            # Process entries in batches
            for i in range(0, len(new_entries), self.batch_size):
                batch = new_entries[i:i+self.batch_size]
                logger.info(f"Processing batch {i//self.batch_size + 1} of {(len(new_entries) + self.batch_size - 1)//self.batch_size} ({len(batch)} entries)")
                
                batch_stats = self._process_batch(batch)
                
                # Update stats
                stats["processed"] += batch_stats["processed"]
                stats["failed"] += batch_stats["failed"]
                stats["skipped"] += batch_stats["skipped"]
                
                # Sleep between batches to avoid rate limiting
                if i + self.batch_size < len(new_entries):
                    logger.info(f"Waiting {self.delay_between_batches} seconds before next batch...")
                    time.sleep(self.delay_between_batches)
            
            return stats
            
        except Exception as e:
            logger.error(f"Error in process_new_entries: {str(e)}")
            return {"error": str(e), "total": 0, "processed": 0, "failed": 0, "skipped": 0}
    
    def _process_batch(self, entries: List[Dict[str, Any]]) -> Dict[str, int]:
        """Process a batch of entries."""
        batch_stats = {
            "processed": 0,
            "failed": 0,
            "skipped": 0
        }
        
        for entry in entries:
            try:
                # Skip if digest already exists
                content_id = str(entry.get("_id"))
                existing_digest = self.digest_storage.get_digest_by_content_id(content_id)
                
                if existing_digest:
                    batch_stats["skipped"] += 1
                    continue
                
                # Store immediately with basic content first
                title = entry.get("title", "Untitled")
                content = entry.get("content", "")
                
                # Create basic summary from existing content
                if content and len(content) > 200:
                    basic_summary = content[:200] + "..."
                else:
                    basic_summary = content
                
                # Create initial digest with basic summary
                initial_digest = {
                    "content_id": content_id,
                    "title": title,
                    "summary": f"[Basic summary] {basic_summary}",
                    "category": entry.get("category", "Uncategorized"),
                    "source": entry.get("source", "unknown"),
                    "tags": entry.get("tags", []),
                    "url": entry.get("url"),
                    "original_date": entry.get("date_created"),
                    "metadata": entry.get("metadata", {}),
                    "is_enhanced": False
                }
                
                # Store immediately
                initial_id = self.digest_storage.store_digest(initial_digest)
                logger.info(f"Stored initial digest for '{title}'")
                
                # Try to generate enhanced summary asynchronously
                try:
                    summary = self.gemini_client.generate_summary(entry)
                    
                    if summary:
                        # Try to enhance categorization
                        enhanced_category = self.gemini_client.categorize_entry(entry)
                        
                        # Update with enhanced summary
                        self.digest_storage.digests.update_one(
                            {"content_id": content_id},
                            {"$set": {
                                "summary": summary,
                                "category": enhanced_category or entry.get("category", "Uncategorized"),
                                "is_enhanced": True,
                                "enhanced_at": datetime.now()
                            }}
                        )
                        logger.info(f"Updated with enhanced summary for '{title}'")
                except Exception as e:
                    logger.error(f"Error enhancing summary for {content_id}: {str(e)}")
                    # The basic summary is already stored, so we can continue
                
                batch_stats["processed"] += 1
                    
            except Exception as e:
                logger.error(f"Error processing entry {entry.get('_id')}: {str(e)}")
                batch_stats["failed"] += 1
        
        return batch_stats
    
    def regenerate_digest(self, content_id: str) -> Optional[str]:
        """
        Regenerate a digest for a specific entry.
        
        Args:
            content_id: ID of the source content
            
        Returns:
            ID of the new digest or None if regeneration failed
        """
        try:
            # Get original entry
            from bson.objectid import ObjectId
            entry = self.source_collection.find_one({"_id": ObjectId(content_id)})
            
            if not entry:
                logger.error(f"Entry not found: {content_id}")
                return None
            
            # Create basic summary first
            title = entry.get("title", "Untitled")
            content = entry.get("content", "")
            
            if content and len(content) > 200:
                basic_summary = content[:200] + "..."
            else:
                basic_summary = content
                
            # Create digest with basic summary
            digest = {
                "content_id": content_id,
                "title": title,
                "summary": f"[Regenerated] {basic_summary}",
                "category": entry.get("category", "Uncategorized"),
                "source": entry.get("source", "unknown"),
                "tags": entry.get("tags", []),
                "url": entry.get("url"),
                "original_date": entry.get("date_created"),
                "metadata": entry.get("metadata", {}),
                "regenerated": True,
                "is_enhanced": False
            }
            
            # Delete existing digest if any
            self.digest_storage.digests.delete_one({"content_id": content_id})
            
            # Store new digest
            result = self.digest_storage.store_digest(digest)
            
            # Try to generate enhanced summary
            try:
                summary = self.gemini_client.generate_summary(entry)
                
                if summary:
                    # Try to enhance categorization
                    enhanced_category = self.gemini_client.categorize_entry(entry)
                    
                    # Update with enhanced summary
                    self.digest_storage.digests.update_one(
                        {"content_id": content_id},
                        {"$set": {
                            "summary": summary,
                            "category": enhanced_category or entry.get("category", "Uncategorized"),
                            "is_enhanced": True,
                            "enhanced_at": datetime.now()
                        }}
                    )
            except Exception as e:
                logger.error(f"Error generating enhanced summary: {str(e)}")
                # The basic summary is already stored, so we can continue
            
            return result
            
        except Exception as e:
            logger.error(f"Error regenerating digest: {str(e)}")
            return None
