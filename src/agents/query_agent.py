from typing import List, Dict, Any
from datetime import datetime, timedelta

class QueryAgent:
    def __init__(self, data_store):
        self.data_store = data_store
        self.query_types = ['llm', 'nlp', 'trends', 'recommendations']

    def get_top_llms(self, week: int) -> List[Dict[str, Any]]:
        try:
            if not isinstance(week, int) or week < 1:
                raise ValueError("Week must be a positive integer")
            
            # Calculate date range for the specified week
            end_date = datetime.now()
            start_date = end_date - timedelta(weeks=week)
            
            # Query data store for top LLMs
            llms = self.data_store.query(
                collection="llms",
                filters={
                    "date": {"$gte": start_date, "$lte": end_date}
                },
                sort_by="metrics.popularity",
                limit=5
            )
            return llms
        except Exception as e:
            raise Exception(f"Error retrieving top LLMs: {str(e)}")

    def get_new_in_nlp(self) -> List[Dict[str, Any]]:
        try:
            # Get latest NLP updates from last 30 days
            last_month = datetime.now() - timedelta(days=30)
            
            updates = self.data_store.query(
                collection="nlp_updates",
                filters={
                    "date": {"$gte": last_month},
                    "type": "research_paper"
                },
                sort_by="date",
                limit=10
            )
            return updates
        except Exception as e:
            raise Exception(f"Error retrieving NLP updates: {str(e)}")

    def handle_query(self, query: str) -> Dict[str, Any]:
        try:
            query_type = self._classify_query(query)
            
            if query_type == "llm":
                return self.get_top_llms(1)
            elif query_type == "nlp":
                return self.get_new_in_nlp()
            elif query_type == "trends":
                return self.get_trending_topics()
            elif query_type == "recommendations":
                return self.get_recommendations(query)
            else:
                raise ValueError("Invalid query type")
        except Exception as e:
            raise Exception(f"Error handling query: {str(e)}")

    def get_trending_topics(self) -> List[str]:
        try:
            # Get trending AI topics from the last week
            last_week = datetime.now() - timedelta(days=7)
            
            trends = self.data_store.query(
                collection="trends",
                filters={"date": {"$gte": last_week}},
                sort_by="mention_count",
                limit=5
            )
            return trends
        except Exception as e:
            raise Exception(f"Error retrieving trending topics: {str(e)}")

    def get_recommendations(self, query: str) -> List[Dict[str, Any]]:
        try:
            # Analyze query and return personalized recommendations
            keywords = self._extract_keywords(query)
            
            recommendations = self.data_store.query(
                collection="ai_resources",
                filters={"keywords": {"$in": keywords}},
                sort_by="relevance",
                limit=3
            )
            return recommendations
        except Exception as e:
            raise Exception(f"Error getting recommendations: {str(e)}")

    def _classify_query(self, query: str) -> str:
        # Simple keyword-based classification
        query = query.lower()
        if any(word in query for word in ["llm", "language model"]):
            return "llm"
        elif any(word in query for word in ["nlp", "natural language"]):
            return "nlp"
        elif any(word in query for word in ["trend", "popular"]):
            return "trends"
        else:
            return "recommendations"

    def _extract_keywords(self, query: str) -> List[str]:
        # Simple keyword extraction (could be improved with NLP)
        stop_words = ["what", "how", "is", "are", "the", "in", "on", "at"]
        return [word.lower() for word in query.split() if word.lower() not in stop_words]