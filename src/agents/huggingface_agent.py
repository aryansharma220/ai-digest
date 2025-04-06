class HuggingFaceAgent:
    def __init__(self, api_client):
        self.api_client = api_client

    def fetch_new_models(self):
        # Fetch new models from Hugging Face Hub API
        response = self.api_client.get('/models?sort=lastModified')
        return response.json()

    def fetch_popular_models(self):
        # Fetch popular models from Hugging Face Hub API
        response = self.api_client.get('/models?sort=downloads')
        return response.json()

    def get_model_details(self, model_id):
        """Fetch detailed information about a specific model."""
        response = self.api_client.get(f'/models/{model_id}')
        data = response.json()
        return {
            'model_card': self._extract_model_card(data),
            'tags': data.get('tags', [])
        }

    def fetch_latest_models(self, limit=10):
        """Fetch latest models with their cards and tags."""
        response = self.api_client.get(f'/models?sort=lastModified&limit={limit}')
        models = response.json()
        
        return [
            {
                'id': model['id'],
                'name': model.get('name', ''),
                'details': self.get_model_details(model['id']),
                'last_modified': model.get('lastModified', ''),
                'downloads': model.get('downloads', 0)
            }
            for model in models
        ]

    def _extract_model_card(self, model_data):
        """Extract relevant information from the model card."""
        return {
            'description': model_data.get('description', ''),
            'language': model_data.get('language', ''),
            'license': model_data.get('license', ''),
            'pipeline_tag': model_data.get('pipeline_tag', ''),
            'tasks': model_data.get('tasks', [])
        }