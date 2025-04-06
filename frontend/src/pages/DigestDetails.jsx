import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CalendarIcon, TagIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { fetchDigestById, addToReadHistory } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

function DigestDetails() {
  const { id } = useParams();
  const { userToken } = useAuth();
  
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDigest = async () => {
      try {
        setLoading(true);
        const data = await fetchDigestById(id);
        setDigest(data);
        
        // Add to read history if logged in
        if (userToken) {
          await addToReadHistory(id, userToken).catch(console.error);
        }
      } catch (err) {
        setError('Failed to fetch digest details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDigest();
  }, [id, userToken]);
  
  // Get tag colors based on source
  const getSourceColor = (source) => {
    switch (source?.toLowerCase()) {
      case 'github': return 'bg-blue-100 text-blue-800';
      case 'huggingface': return 'bg-yellow-100 text-yellow-800';
      case 'arxiv': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get tag colors based on category
  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'llm': return 'bg-purple-100 text-purple-800';
      case 'computer_vision': return 'bg-green-100 text-green-800';
      case 'reinforcement_learning': return 'bg-blue-100 text-blue-800';
      case 'nlp': return 'bg-indigo-100 text-indigo-800';
      case 'mlops': return 'bg-gray-100 text-gray-800';
      case 'multimodal': return 'bg-pink-100 text-pink-800';
      case 'research': return 'bg-red-100 text-red-800';
      case 'ai_tools': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error || !digest) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error || 'Digest not found'}</p>
        <Link to="/" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  const { title, summary, category, source, tags, date_created, url } = digest;
  
  // Format date
  const formattedDate = date_created 
    ? formatDistanceToNow(new Date(date_created), { addSuffix: true })
    : 'Unknown date';
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
      <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-500 mb-4">
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`text-xs px-2 py-1 rounded ${getSourceColor(source)}`}>
          {source}
        </span>
        <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(category)}`}>
          {category}
        </span>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      
      <div className="flex items-center text-gray-500 text-sm space-x-4 mb-6">
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 mr-1" />
          {formattedDate}
        </div>
        
        {tags && tags.length > 0 && (
          <div className="flex items-center">
            <TagIcon className="h-4 w-4 mr-1" />
            <span>{tags.join(', ')}</span>
          </div>
        )}
      </div>
      
      <div className="prose max-w-none mb-6">
        <p className="text-gray-700 whitespace-pre-line">{summary}</p>
      </div>
      
      {url && (
        <div className="mt-8">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Visit Source
          </a>
        </div>
      )}
    </div>
  );
}

export default DigestDetails;
