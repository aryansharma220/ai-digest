from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from dataclasses import dataclass
import logging
import os

# Add logger for better debugging
logger = logging.getLogger(__name__)

@dataclass
class Summary:
    title: str
    content: str
    source: str
    category: str
    date_created: datetime
    tags: List[str]
    metadata: Dict[str, Any]
    id: Optional[str] = None

class Storage:
    def __init__(self, db_connection):
        try:
            if isinstance(db_connection, str):
                logger.info(f"Connecting to MongoDB using connection string")
                self.client = MongoClient(db_connection)
                # Use environment variable for DB name instead of hardcoding
                db_name = os.getenv('DB_NAME', 'aidigest')
                self.db = self.client[db_name]
                logger.info(f"Connected to database: {db_name}")
            else:
                logger.info("Using provided database connection")
                self.db = db_connection
                
            self.summaries = self.db.summaries
            logger.info(f"Using collection: summaries")
            
            # Create index for better performance
            self.create_index("date_created")
            self.create_index("source")
            self.create_index("category")
            
            # Test the connection by performing a simple operation
            count = self.summaries.count_documents({})
            logger.info(f"Connected to summaries collection. Document count: {count}")
            
        except Exception as e:
            logger.error(f"Error initializing Storage: {str(e)}")
            raise

    def store_summary(self, summary_data: Dict[str, Any]) -> str:
        """Store a new summary in the database."""
        try:
            # Validate required fields
            required_fields = ['title', 'content', 'source', 'category']
            if not all(field in summary_data for field in required_fields):
                raise ValueError("Missing required fields in summary data")

            # Add timestamp using timezone-aware datetime
            summary_data['date_created'] = datetime.now(timezone.utc)
            
            # Insert document
            result = self.summaries.insert_one(summary_data)
            return str(result.inserted_id)
        
        except PyMongoError as e:
            raise Exception(f"Database error: {str(e)}")

    def retrieve_summary(self, query: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Retrieve summaries based on a query."""
        try:
            cursor = self.summaries.find(query)
            return list(cursor)
        
        except PyMongoError as e:
            raise Exception(f"Database error: {str(e)}")

    def delete_summary(self, summary_id: str) -> bool:
        """Delete a summary from the database."""
        try:
            from bson.objectid import ObjectId
            result = self.summaries.delete_one({"_id": ObjectId(summary_id)})
            return result.deleted_count > 0
        
        except PyMongoError as e:
            raise Exception(f"Database error: {str(e)}")

    def update_summary(self, summary_id: str, update_data: Dict[str, Any]) -> bool:
        """Update an existing summary."""
        try:
            from bson.objectid import ObjectId
            result = self.summaries.update_one(
                {"_id": ObjectId(summary_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        
        except PyMongoError as e:
            raise Exception(f"Database error: {str(e)}")

    def get_summaries_by_date_range(self, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Retrieve summaries within a date range."""
        try:
            query = {
                "date_created": {
                    "$gte": start_date,
                    "$lte": end_date
                }
            }
            return list(self.summaries.find(query).sort("date_created", -1))
        
        except PyMongoError as e:
            raise Exception(f"Database error: {str(e)}")

    def get_summaries_by_category(self, category: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Retrieve summaries for a specific category."""
        try:
            return list(self.summaries.find(
                {"category": category}
            ).sort("date_created", -1).limit(limit))
        
        except PyMongoError as e:
            raise Exception(f"Database error: {str(e)}")

    def create_index(self, field: str):
        """Create an index on a specific field."""
        try:
            self.summaries.create_index(field)
        except PyMongoError as e:
            raise Exception(f"Error creating index: {str(e)}")

    def close(self):
        """Close the database connection."""
        try:
            if hasattr(self, 'client'):
                self.client.close()
        except PyMongoError as e:
            raise Exception(f"Error closing connection: {str(e)}")