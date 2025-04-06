# AI Digest

AI Digest is a modern platform that automatically collects, summarizes, and categorizes the latest developments in artificial intelligence from multiple sources including GitHub, Hugging Face, and ArXiv. Stay ahead of the AI revolution with personalized content delivered in a digestible format.

![image](https://github.com/user-attachments/assets/94bb8858-4d49-4e20-9b3f-179d41720eac)


## Table of Contents
- [Features](#features)
- [Demo](#demo)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Future Improvements and Implementations](#future-improvements-and-implementations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Multi-Source Aggregation**: Collect the latest AI developments from GitHub, Hugging Face, and ArXiv in one place
- **AI-Powered Summaries**: Advanced AI models generate concise summaries of complex research papers and repositories
- **Smart Categorization**: Automatic tagging and categorization for easy navigation (LLMs, computer vision, NLP, etc.)
- **Personalized Digest**: Set your preferences to receive content tailored to your interests
- **Dark/Light Mode**: Modern UI with theme support for comfortable reading in any environment
- **User Authentication**: Secure sign-in options including Google OAuth
- **Responsive Design**: Fully responsive interface works on all devices

## Demo

[![AI Digest Demo Video](./screenshots/demo-thumbnail.png)](https://youtu.be/your-demo-link)
*[Video placeholder: Demo video thumbnail linking to YouTube]*

## Architecture

AI Digest follows a modern web application architecture:

- **Frontend**: React-based single-page application using React Router for navigation
- **Backend**: Node.js server handling data processing and authentication
- **AI Processing**: Python-based agents for fetching, summarizing, and categorizing content
- **Database**: MongoDB for storing user data and content digests
- **Authentication**: Firebase Authentication for secure user management

![image](https://github.com/user-attachments/assets/d0507ee7-a448-44df-94de-614cf23f0e4d)


## Technology Stack

### Frontend
- React 18+ with functional components and hooks
- React Router for navigation
- Tailwind CSS for styling
- Heroicons for UI icons
- React Hot Toast for notifications
- Firebase SDK for authentication

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Firebase Admin SDK

### AI Processing
- Python 3.9+
- Natural Language Processing libraries
- GitHub, Hugging Face, and ArXiv APIs

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- Python 3.9 or higher
- MongoDB
- Firebase project
- API keys for GitHub, Hugging Face, and ArXiv (if applicable)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-digest.git
cd ai-digest
```

2. Set up the backend
```bash
cd backend
npm install
cp .env.example .env  # Edit .env with your configuration
npm run setup
```

3. Set up the AI processing components
```bash
cd ../src
python -m venv venv
source venv/bin/activate  # On Windows, use venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Edit .env with your API keys
```

4. Set up the frontend
```bash
cd ../frontend
npm install
cp .env.example .env  # Edit .env with your Firebase configuration
```

5. Run the application in development mode
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - AI Processing (if running separately)
cd src
python main.py
```

## Usage

### User Registration and Login

1. Create a new account using email or Google authentication
2. Set up your preferences for content types (LLMs, computer vision, etc.)
3. Choose your digest frequency (daily or weekly)

### Browsing Digests

1. View the latest AI developments on the main dashboard
2. Filter by categories or sources
3. Search for specific topics
4. Bookmark interesting digests for later reading

### User Preferences

1. Update your profile information
2. Modify content preferences
3. Change notification settings
4. Toggle between dark and light mode

## Screenshots

### Landing Page
![image](https://github.com/user-attachments/assets/8b0c385f-3b6d-431e-80a5-30770a6359cd)


### User Dashboard
![image](https://github.com/user-attachments/assets/cc181759-49ab-49a4-972a-467523cb66fe)
![image](https://github.com/user-attachments/assets/8a5a1a21-4688-4d49-bb29-50d48db73a61)



### Digest Detail View
![image](https://github.com/user-attachments/assets/0916676d-c7fd-49ea-9513-0fe142b95fa8)


### Dark Mode
![image](https://github.com/user-attachments/assets/9bdb14e1-d1af-496a-8aa5-51c25f1f4c61)
![image](https://github.com/user-attachments/assets/52959ff8-d731-4761-9638-3bceae1c0a71)



## Future Improvements and Implementations

### Technical Enhancements
- **Performance Optimization**: Implement server-side rendering (SSR) or static site generation (SSG) for improved performance and SEO
- **Caching Strategy**: Advanced caching system to reduce API calls and improve load times
- **AI Model Upgrades**: Integration with newer large language models for improved summarization quality
- **GraphQL Migration**: Transition from REST APIs to GraphQL for more efficient data fetching
- **Microservices Architecture**: Break down the monolithic backend into specialized microservices for improved scalability

### User Experience Improvements
- **Content Recommendation Engine**: Machine learning-powered recommendation system based on user reading habits
- **Interactive Visualizations**: Data visualization tools for AI research trends and statistics
- **Customizable Dashboard**: Drag-and-drop interface for personalizing content layout
- **Offline Support**: Progressive Web App (PWA) features for offline reading capability
- **Translation Support**: Multi-language support for international users
est)
### New Features
- **User Collaboration**: Shared collections and team workspaces for collaborative research
- **Content Creation Tools**: Allow users to create and publish their own AI digests
- **Browser Extension**: Quick access to bookmarking and saving content from any website
- **Email Digest Integration**: Scheduled email delivery of personalized content
- **Voice Interaction**: Voice-based navigation and content consumption

### Integration Opportunities
- **Academic Platforms**: Integration with academic databases like Semantic Scholar and Google Scholar
- **Developer Tools**: GitHub integration for repository tracking and GitHub Actions support
- **Learning Platforms**: Connections with online courses and learning resources related to AI topics
- **Conference Trackers**: Automated summaries of AI conference proceedings and presentations

## Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced filtering and search capabilities
- [ ] Community features (comments, discussions)
- [ ] API access for developers
- [ ] Integration with additional AI sources
- [ ] Enhanced recommendation system


## Contact

Project Link: [https://github.com/aryansharma220/ai-digest](https://github.com/aryansharma220/ai-digest)

---

<p align="center">Made with ❤️ by Cyber Corsair</p>
