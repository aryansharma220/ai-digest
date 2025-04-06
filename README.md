# AI Discovery Agent

## Overview
An intelligent agent system that automatically discovers, aggregates, and summarizes the latest developments in AI/ML from GitHub, Hugging Face, and ArXiv. Perfect for researchers, developers, and AI enthusiasts who want to stay updated with the fast-moving AI landscape.

## Features
- **Multi-Source Aggregation**: Collects data from multiple platforms including:
  - **GitHub**: Fetches trending and newly created repositories related to AI and ML.
  - **Hugging Face**: Retrieves new and popular models and datasets.
  - **ArXiv**: Queries for the latest AI-related research papers.

- **Workflow Nodes**: Implements a series of nodes to process and manage data:
  - **Fetchers**: Nodes to pull data from each source.
  - **Summarizer**: Summarizes content using advanced AI models.
  - **Tagger**: Classifies entries into relevant categories.
  - **Storage**: Saves summarized data into a database.
  - **Digest Generator**: Optionally creates summary digests for users.

- **User Query Agent**: Allows users to ask specific questions about the latest developments in AI.

## Requirements
- Python 3.8+
- MongoDB 4.4+
- Git
- API keys for:
  - GitHub
  - Hugging Face Hub
  - ArXiv (no key needed, but rate limits apply)

## Installation

### 1. Clone and Setup
```bash
git clone https://github.com/yourusername/ai-discovery-agent.git
cd ai-discovery-agent
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Unix/MacOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
# API Keys
GITHUB_TOKEN=your_github_token
HUGGINGFACE_TOKEN=your_huggingface_token

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/
DB_NAME=ai_discovery

# Agent Configuration
MAX_REPOS_PER_QUERY=10
MAX_MODELS_PER_QUERY=20
MAX_PAPERS_PER_CATEGORY=5
SUMMARY_MAX_LENGTH=250

# Update Frequency (in minutes)
UPDATE_INTERVAL=60
```

## Usage

### 1. Running the Agent
```bash
# Start the agent
python src/main.py

# Run in background mode
python src/main.py --daemon

# Run with custom config
python src/main.py --config custom_config.yaml
```

### 2. Query Examples
```python
from src.agents.query_agent import QueryAgent
from src.nodes.storage import Storage

# Initialize
storage = Storage("mongodb://localhost:27017/")
agent = QueryAgent(storage)

# Get latest LLM developments
llms = agent.get_top_llms(week=1)

# Get NLP research updates
nlp_updates = agent.get_new_in_nlp()

# Get trending topics
trends = agent.get_trending_topics()
```

### 3. Custom Data Collection
```python
from src.nodes.fetchers import GitHubFetcher, HuggingFaceFetcher, ArxivFetcher

# Setup fetchers
github_fetcher = GitHubFetcher(github_token)
hf_fetcher = HuggingFaceFetcher(hf_token)
arxiv_fetcher = ArxivFetcher()

# Fetch custom data
repos = github_fetcher.fetch_trending_repos(keywords=["reinforcement-learning"])
models = hf_fetcher.fetch_latest_models(limit=5)
papers = arxiv_fetcher.fetch_latest_papers(categories=["cs.AI", "cs.LG"])
```

## Data Pipeline
1. **Collection**: Fetchers gather data from multiple sources
2. **Processing**: 
   - Summarizer creates concise summaries
   - Tagger categorizes and labels content
3. **Storage**: Processed data is stored in MongoDB
4. **Query**: QueryAgent provides easy access to stored data

## Customization

### 1. Adding New Sources
Create a new fetcher in `src/nodes/fetchers.py`:
```python
class CustomSourceFetcher:
    def __init__(self, api_client):
        self.api_client = api_client

    def fetch_data(self):
        # Implement fetching logic
        pass
```

### 2. Custom Tagging Rules
Modify `src/nodes/tagger.py` category keywords:
```python
self.category_keywords = {
    'your_category': {'keyword1', 'keyword2'},
    # Add more categories...
}
```

## Monitoring & Maintenance

### Health Checks
```bash
# Check agent status
python scripts/health_check.py

# View error logs
python scripts/view_logs.py
```

### Database Maintenance
```bash
# Backup data
python scripts/backup_db.py

# Clean old entries
python scripts/cleanup_old_data.py --days 30
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Submit a pull request

## Troubleshooting

### Common Issues
1. **API Rate Limits**: Implement exponential backoff
2. **MongoDB Connection**: Check MongoDB service status
3. **Memory Usage**: Adjust batch sizes in config

### Debug Mode
```bash
python src/main.py --debug
```

## License
MIT License - See LICENSE file for details

## Support
- Create an issue for bugs/features
- Check [Discussions](https://github.com/yourusername/ai-discovery-agent/discussions) for questions
- Read the [Wiki](https://github.com/yourusername/ai-discovery-agent/wiki) for advanced topics