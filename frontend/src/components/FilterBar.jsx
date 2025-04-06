import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchCategories, fetchSources } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  
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
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={currentCategory}
            onChange={(e) => updateFilters('category', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
        
        {/* View Mode (Personalized/All) */}
        {currentUser && (
          <div>
            <label htmlFor="view" className="block text-sm font-medium text-gray-700 mb-1">
              View Mode
            </label>
            <select
              id="view"
              value={currentView}
              onChange={(e) => updateFilters('view', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Digests</option>
              <option value="personalized">Personalized</option>
            </select>
          </div>
        )}
        
        {/* Reset Filters Button */}
        <div className="flex items-end">
          <button
            onClick={() => setSearchParams(currentView !== 'all' ? { view: currentView } : {})}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
