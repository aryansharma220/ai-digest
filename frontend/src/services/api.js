import { useAuth } from '../contexts/AuthContext';

// Fix the API_URL to include /api path
const API_URL = `${import.meta.env.VITE_API_URL}/api`;

// Helper to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred');
  }
  return response.json();
};

// Fetch digests with optional filters
export const fetchDigests = async (filters = {}, token) => {
  const queryParams = new URLSearchParams();
  
  // Add all filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}/digests?${queryParams.toString()}`, {
    method: 'GET',
    headers
  });
  
  return handleResponse(response);
};

// Fetch personalized digests (requires auth)
export const fetchPersonalizedDigests = async (filters = {}, token) => {
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  const response = await fetch(`${API_URL}/digests/personalized?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  return handleResponse(response);
};

// Fetch a single digest by ID
export const fetchDigestById = async (id) => {
  console.log('API call to fetch digest with ID:', id);
  console.log('Endpoint:', `${API_URL}/digests/${id}`);
  
  try {
    const response = await fetch(`${API_URL}/digests/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error response:', errorData);
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API response data:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchDigestById:', error);
    throw error;
  }
};

// Fetch categories
export const fetchCategories = async () => {
  const response = await fetch(`${API_URL}/digests/categories/list`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  return handleResponse(response);
};

// Fetch sources
export const fetchSources = async () => {
  const response = await fetch(`${API_URL}/digests/sources/list`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  return handleResponse(response);
};

// Fetch user profile (requires auth)
export const fetchUserProfile = async (token) => {
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${API_URL}/user/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  return handleResponse(response);
};

// Update user preferences (requires auth)
export const updateUserPreferences = async (preferences, token) => {
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${API_URL}/user/preferences`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(preferences)
  });
  
  return handleResponse(response);
};

// Add digest to read history (requires auth)
export const addToReadHistory = async (digestId, token) => {
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${API_URL}/user/history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ digestId })
  });
  
  return handleResponse(response);
};
