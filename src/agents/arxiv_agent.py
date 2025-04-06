class ArxivAgent:
    def __init__(self, categories=None):
        self.base_url = "http://export.arxiv.org/api/query?"
        self.categories = categories or ["cs.AI", "cs.LG", "cs.CL", "cs.CV", "stat.ML"]

    def fetch_latest_papers(self):
        papers = []
        for category in self.categories:
            query = f"search_query=cat:{category}&sortBy=submittedDate&sortOrder=descending&max_results=5"
            response = self._make_request(query)
            papers.extend(self._parse_response(response))
        return papers

    def _make_request(self, query):
        import requests
        response = requests.get(self.base_url + query)
        response.raise_for_status()
        return response.text

    def _parse_response(self, response):
        import xml.etree.ElementTree as ET
        root = ET.fromstring(response)
        papers = []
        for entry in root.findall("{http://www.w3.org/2005/Atom}entry"):
            title = entry.find("{http://www.w3.org/2005/Atom}title").text
            summary = entry.find("{http://www.w3.org/2005/Atom}summary").text
            papers.append({"title": title, "summary": summary})
        return papers