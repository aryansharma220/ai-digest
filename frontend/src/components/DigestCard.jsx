import { Link } from 'react-router-dom';
import { CalendarIcon, TagIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

function DigestCard({ digest }) {
  const { _id, title, summary, category, source, tags, date_created } = digest;
  
  // Format date
  const formattedDate = date_created 
    ? formatDistanceToNow(new Date(date_created), { addSuffix: true })
    : 'Unknown date';
  
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
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex space-x-2">
            <span className={`text-xs px-2 py-1 rounded ${getSourceColor(source)}`}>
              {source}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(category)}`}>
              {category}
            </span>
          </div>
        </div>
        
        <Link to={`/digest/${_id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-indigo-600">
            {title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {summary}
        </p>
        
        <div className="flex items-center text-gray-500 text-xs space-x-4">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {formattedDate}
          </div>
          
          {tags && tags.length > 0 && (
            <div className="flex items-center">
              <TagIcon className="h-4 w-4 mr-1" />
              <span className="truncate max-w-[150px]">
                {tags.slice(0, 2).join(', ')}
                {tags.length > 2 && '...'}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <Link
          to={`/digest/${_id}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Read more →
        </Link>
      </div>
    </div>
  );
}

export default DigestCard;
