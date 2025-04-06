from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from pymongo import MongoClient, DESCENDING
from pymongo.database import Database
from pymongo.errors import PyMongoError
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DigestStorage:
    def __init__(self, db_connection):
        """
        Initialize the digest storage with a database connection.
        
        Args:
            db_connection: MongoDB database connection
        """
        if isinstance(db_connection, str):
            self.client = MongoClient(db_connection)
            self.db = self.client.ai_discovery_digest
        else:
            self.db = db_connection
            
        # Create collection for digests
        self.digests = self.db.digests
        
        # Create indexes for efficient querying
        try:
            self.digests.create_index([("date_created", DESCENDING)])
            self.digests.create_index([("category", 1)])
            self.digests.create_index([("source", 1)])
            self.digests.create_index([("content_id", 1)], unique=True)
            logger.info("Digest storage initialized with indexes")
        except Exception as e:
            logger.error(f"Error creating indexes: {str(e)}")
    
    def store_digest(self, digest_data: Dict[str, Any]) -> Optional[str]:
        """
        Store a new digest in the database.
        
        Args:
            digest_data: Dictionary with digest information
            
        Returns:
            ID of the stored digest or None if storage failed
        """
        try:
            # Validate required fields
            required_fields = ['title', 'summary', 'category', 'source', 'content_id']
            if not all(field in digest_data for field in required_fields):
                logger.error(f"Missing required fields in digest data: {digest_data.keys()}")
                return None
                
            # Add timestamp
            digest_data['date_created'] = datetime.now(timezone.utc)
            
            # Check if digest already exists for this content
            existing = self.digests.find_one({"content_id": digest_data['content_id']})
            if existing:
                logger.info(f"Digest already exists for content ID: {digest_data['content_id']}")
                return str(existing['_id'])
                
            # Insert document
            result = self.digests.insert_one(digest_data)
            logger.info(f"Stored digest for '{digest_data['title']}'")
            return str(result.inserted_id)
            
        except PyMongoError as e:
            logger.error(f"Database error storing digest: {str(e)}")
            return None
    
    def get_digests(self, 
                    category: Optional[str] = None, 
                    source: Optional[str] = None, 
                    limit: int = 50) -> List[Dict[str, Any]]:
        """
        Retrieve digests based on filters.
        
        Args:
            category: Optional category filter
            source: Optional source filter
            limit: Maximum number of digests to return
            
        Returns:
            List of digest documents
        """
        try:
            # Build query
            query = {}
            if category:
                query["category"] = category
            if source:
                query["source"] = source
                
            # Execute query
            cursor = self.digests.find(query).sort("date_created", DESCENDING).limit(limit)
            return list(cursor)
            
        except PyMongoError as e:
            logger.error(f"Database error retrieving digests: {str(e)}")
            return []
    
    def get_digest_by_content_id(self, content_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a digest by its content ID.
        
        Args:
            content_id: The ID of the original content
            
        Returns:
            Digest document or None if not found
        """
        try:
            return self.digests.find_one({"content_id": content_id})
        except PyMongoError as e:
            logger.error(f"Database error retrieving digest: {str(e)}")
            return None
    
    def get_digest_stats(self) -> Dict[str, Any]:
        """Get statistics about digests in database."""
        try:
            stats = {
                "total": self.digests.count_documents({}),
                "by_category": {},
                "by_source": {}
            }
            
            # Get counts by category
            pipeline = [
                {"$group": {"_id": "$category", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ]
            for result in self.digests.aggregate(pipeline):
                stats["by_category"][result["_id"]] = result["count"]
                
            # Get counts by source
            pipeline = [
                {"$group": {"_id": "$source", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ]
            for result in self.digests.aggregate(pipeline):
                stats["by_source"][result["_id"]] = result["count"]
                
            return stats
            
        except PyMongoError as e:
            logger.error(f"Database error getting digest stats: {str(e)}")
            return {"error": str(e)}
