import os
import sys
import logging
from datetime import datetime
from dotenv import load_dotenv

# Add project root to Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, project_root)

from src.utils.db_config import get_db_config
from src.nodes.digest_summarizer import DigestSummarizer

# Ensure logs directory exists
logs_dir = os.path.join(project_root, 'logs')
if not os.path.exists(logs_dir):
    os.makedirs(logs_dir)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join(logs_dir, 'digest_generation.log'))
    ]
)
logger = logging.getLogger(__name__)

def main():
    """Run the digest generation process."""
    try:
        # Load environment variables
        load_dotenv()
        
        # Load API key
        gemini_api_key = os.getenv('GEMINI_API_KEY')
        if not gemini_api_key:
            logger.error("GEMINI_API_KEY not found in environment variables")
            return
        
        # Get database connections
        db_config = get_db_config()
        source_db = db_config.db
        
        # Connect to digest database
        from pymongo import MongoClient
        mongodb_uri = os.getenv('MONGODB_URI')
        client = MongoClient(mongodb_uri)
        digest_db = client.ai_discovery_digest  # This database stores frontend-ready summaries
        
        # Initialize summarizer
        summarizer = DigestSummarizer(source_db, digest_db)
        
        # Get hours to look back
        try:
            hours_back = int(os.getenv('DIGEST_HOURS_BACK', '24'))
        except ValueError:
            hours_back = 24
        
        # Process new entries
        logger.info(f"Starting digest generation (looking back {hours_back} hours)")
        stats = summarizer.process_new_entries(hours_back)
        
        # Log results
        logger.info(f"Digest generation completed")
        logger.info(f"Total entries: {stats.get('total', 0)}")
        logger.info(f"Processed: {stats.get('processed', 0)}")
        logger.info(f"Failed: {stats.get('failed', 0)}")
        logger.info(f"Skipped (already exists): {stats.get('skipped', 0)}")
        
    except Exception as e:
        logger.error(f"Error in digest generation: {str(e)}")

if __name__ == "__main__":
    main()
