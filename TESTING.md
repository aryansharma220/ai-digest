# Testing Guide for AI Discovery Agent

## Setup Testing Environment

1. Create a test environment and install dependencies:
```bash
python -m venv test_env
source test_env/bin/activate  # or test_env\Scripts\activate on Windows
pip install -r requirements.txt
pip install pytest pytest-cov pytest-mock
```

2. Create a `.env.test` file:
```env
GITHUB_TOKEN=your_test_github_token
HUGGINGFACE_TOKEN=your_test_hf_token
MONGODB_URI=mongodb://localhost:27017/
DB_NAME=ai_discovery_test
```

## Running Tests

### 1. Unit Tests
```bash
# Run all unit tests
pytest tests/test_agent.py -v

# Run specific test class
pytest tests/test_agent.py::TestGitHubFetcher -v

# Run with coverage
pytest --cov=src tests/
```

### 2. Integration Tests
```bash
# Run integration tests
pytest tests/test_integration.py -v

# Skip tests requiring API tokens
pytest tests/test_integration.py -v -k "not test_github_integration"
```

### 3. Component Testing

Test individual components:
```bash
# Test fetchers
pytest tests/test_agent.py::TestGitHubFetcher
pytest tests/test_agent.py::TestHuggingFaceFetcher
pytest tests/test_agent.py::TestArxivFetcher

# Test storage
pytest tests/test_agent.py::TestStorage

# Test processing
pytest tests/test_agent.py::TestSummarizer
pytest tests/test_agent.py::TestTagger
```

## Adding New Tests

1. Create test classes in appropriate files
2. Use meaningful test names
3. Follow the AAA pattern (Arrange, Act, Assert)
4. Mock external dependencies
5. Clean up test data

Example:
```python
def test_new_feature():
    # Arrange
    component = Component()
    test_data = {...}
    
    # Act
    result = component.process(test_data)
    
    # Assert
    assert result.status == 'success'
```

## Test Data Management

1. Use fixtures for common test data
2. Clean up test database after tests
3. Use separate test database
4. Never commit real API tokens

## Common Testing Scenarios

1. API failure handling
2. Rate limit handling
3. Invalid data handling
4. Database connection issues
5. Data processing edge cases
