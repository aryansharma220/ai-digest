import pytest
from pymongo import MongoClient
from dotenv import load_dotenv
import os

@pytest.fixture(scope="session")
def test_db():
    """Provide test database connection"""
    load_dotenv(".env.test")
    client = MongoClient(os.getenv("MONGODB_URI"))
    db = client[os.getenv("DB_NAME", "ai_discovery_test")]
    yield db
    client.drop_database(db.name)
    client.close()

@pytest.fixture(scope="function")
def clean_db(test_db):
    """Provide clean database for each test"""
    for collection in test_db.list_collection_names():
        test_db[collection].delete_many({})
    return test_db
