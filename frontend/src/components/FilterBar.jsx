import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchCategories, fetchSources } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FunnelIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';

function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get current filters from URL
  const currentCategory = searchParams.get('category') || '';
  const currentSource = searchParams.get('source') || '';
  const currentView = searchParams.get('view') || 'all';
  
  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true);
        
        const [categoriesData, sourcesData] = await Promise.all([
          fetchCategories(),
          fetchSources()
        ]);
        
        setCategories(categoriesData);
        setSources(sourcesData);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilterOptions();
  }, []);
  
  // Update filters
  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    // Reset to page 1 when filters change
    newParams.delete('page');
    
    setSearchParams(newParams);
  };
  
  // Filter applied?
  const isFilterApplied = currentCategory || currentSource || searchTerm;
  
  // Reset all filters
  const resetAllFilters = () => {
    const newParams = new URLSearchParams();
    if (currentView !== 'all') {
      newParams.set('view', currentView);
    }
    setSearchParams(newParams);
    setSearchTerm('');
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300">
      <div className="p-4 flex justify-between items-center">
        <h3 className="font-medium text-gray-900 flex items-center">
          <FunnelIcon className="h-5 w-5 mr-2 text-indigo-600" />
          Filter Digests
          {isFilterApplied && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full">
              Filters applied
            </span>
          )}
        </h3>
        
        <div className="flex items-center space-x-2">
          {isFilterApplied && (
            <button
              onClick={resetAllFilters}
              className="text-sm text-gray-600 hover:text-indigo-600 flex items-center transition-colors"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Clear all
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t border-gray-100 space-y-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search digests..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          
            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={currentCategory}
                onChange={(e) => updateFilters('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                disabled={loading}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.category} value={category.category}>
                    {category.category} ({category.count})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Source Filter */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                id="source"
                value={currentSource}
                onChange={(e) => updateFilters('source', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                disabled={loading}
              >
                <option value="">All Sources</option>
                {sources.map((source) => (
                  <option key={source.source} value={source.source}>
                    {source.source} ({source.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (searchTerm) {
                  updateFilters('search', searchTerm);
                }
                setIsExpanded(false);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow hover:shadow-md"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterBar;
