import os
from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ServerSelectionTimeoutError, PyMongoError
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

class DatabaseConfig:
    _instance: Optional['DatabaseConfig'] = None
    _client: Optional[MongoClient] = None
    _db: Optional[Database] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConfig, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, 'initialized'):
            load_dotenv()
            self.initialized = True
            self.mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
            self.db_name = os.getenv('DB_NAME', 'ai_discovery')
            self.connect()

    def connect(self) -> None:
        """Establish connection to MongoDB."""
        try:
            if self._client is None:  # Changed from 'if not self._client'
                self._client = MongoClient(
                    self.mongo_uri,
                    serverSelectionTimeoutMS=5000,
                    connectTimeoutMS=5000,
                    maxPoolSize=50
                )
                self._db = self._client[self.db_name]
                # Test connection
                self._client.server_info()
                logger.info(f"Successfully connected to MongoDB: {self.db_name}")
        except (PyMongoError, ServerSelectionTimeoutError) as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise

    @property
    def db(self) -> Database:
        """Get database instance."""
        if self._db is None:  # Changed from 'if not self._db'
            self.connect()
        return self._db

    @property
    def client(self) -> MongoClient:
        """Get MongoDB client instance."""
        if self._client is None:  # Changed from 'if not self._client'
            self.connect()
        return self._client

    def close(self) -> None:
        """Close database connection."""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            logger.info("Closed MongoDB connection")

    def create_indexes(self) -> None:
        """Create necessary indexes for collections."""
        try:
            # Summaries collection indexes
            self.db.summaries.create_index([("date_created", -1)])
            self.db.summaries.create_index([("category", 1)])
            self.db.summaries.create_index([("tags", 1)])
            self.db.summaries.create_index([("source", 1)])
            
            # Add more indexes as needed
            logger.info("Successfully created database indexes")
        except Exception as e:
            logger.error(f"Error creating indexes: {str(e)}")
            raise

    def get_collection_stats(self) -> dict:
        """Get statistics about database collections."""
        try:
            stats = {
                'summaries': self.db.summaries.count_documents({}),
                'indexes': len(self.db.summaries.list_indexes()),
                'size': self.db.command("dbstats")["dataSize"]
            }
            return stats
        except Exception as e:
            logger.error(f"Error getting database stats: {str(e)}")
            return {}

def get_db_config() -> DatabaseConfig:
    """Get singleton instance of DatabaseConfig."""
    return DatabaseConfig()
