import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchDigests, fetchPersonalizedDigests } from '../services/api';
import DigestCard from '../components/DigestCard';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import { SparklesIcon, RocketLaunchIcon, BookOpenIcon } from '@heroicons/react/24/outline';

function Dashboard() {
  const [searchParams] = useSearchParams();
  const { userToken } = useAuth();
  
  const [digests, setDigests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  const category = searchParams.get('category');
  const source = searchParams.get('source');
  const page = parseInt(searchParams.get('page') || '1');
  const viewMode = searchParams.get('view') || 'all'; 
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        let result;
        if (viewMode === 'personalized' && userToken) {
          result = await fetchPersonalizedDigests({ 
            category, 
            source, 
            page,
            limit: pagination.limit 
          }, userToken);
        } else {
          result = await fetchDigests({ 
            category, 
            source, 
            page,
            limit: pagination.limit 
          }, userToken);
        }
        
        setDigests(result.digests);
        setPagination(result.pagination);
        setError(null);
      } catch (err) {
        setError('Failed to fetch digests');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [category, source, page, viewMode, userToken, pagination.limit]);
  
  return (
    <div className="pb-12">
      {/* Header section with improved styling and icons */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500 text-white p-8 rounded-xl shadow-lg mb-8 transform transition-all hover:scale-[1.01] hover:shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
            {viewMode === 'personalized' ? (
              <SparklesIcon className="h-10 w-10 text-yellow-300 animate-pulse" />
            ) : (
              <RocketLaunchIcon className="h-10 w-10 text-yellow-300" />
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {viewMode === 'personalized' ? 'Your Personalized AI Digest' : 'Latest AI Developments'}
          </h1>
        </div>
        <p className="mt-4 text-indigo-100 max-w-2xl text-lg leading-relaxed">
          Stay updated with the latest in AI research, tools, and models. Our AI-powered system collects and summarizes the most relevant developments in the field.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button 
            className={`px-4 py-2 rounded-full border border-white/30 backdrop-blur-sm text-sm font-medium transition-all hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none ${viewMode === 'all' ? 'bg-white/20' : 'bg-transparent'}`}
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set('view', 'all');
              newParams.delete('page');
              window.history.pushState({}, '', `?${newParams.toString()}`);
              window.location.reload();
            }}
          >
            All Digests
          </button>
          <button 
            className={`px-4 py-2 rounded-full border border-white/30 backdrop-blur-sm text-sm font-medium transition-all hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none ${viewMode === 'personalized' ? 'bg-white/20' : 'bg-transparent'}`}
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set('view', 'personalized');
              newParams.delete('page');
              window.history.pushState({}, '', `?${newParams.toString()}`);
              window.location.reload();
            }}
          >
            Personalized Feed
          </button>
        </div>
      </div>
      
      {/* Filter section with improved styling */}
      <div className="mb-8">
        <FilterBar />
      </div>
      
      {/* Loading state with improved animation */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="relative w-20 h-20">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-t-4 border-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-indigo-600 font-medium animate-pulse">Loading your digests...</p>
        </div>
      ) : error ? (
        <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-md mb-8">
          <h3 className="text-lg font-medium text-red-800 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Error loading digests
          </h3>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-full hover:from-red-600 hover:to-red-800 transition-all duration-300 shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Try Again
          </button>
        </div>
      ) : digests.length === 0 ? (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-10 rounded-xl border border-gray-200 shadow-md text-center">
          <div className="bg-white p-4 w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center shadow-inner">
            <BookOpenIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No digests found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            We couldn't find any digests matching your current filters. Try adjusting your filter criteria or check back later.
          </p>
          <button 
            onClick={() => {
              const newParams = new URLSearchParams();
              newParams.set('view', viewMode);
              window.history.pushState({}, '', `?${newParams.toString()}`);
              window.location.reload();
            }}
            className="mt-6 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {/* Stats summary */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap justify-between">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-indigo-600">{pagination.total}</span> digests found
            </div>
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-indigo-600">
                {Math.min(1 + (pagination.page - 1) * pagination.limit, pagination.total)}
              </span> to <span className="font-medium text-indigo-600">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span> of <span className="font-medium text-indigo-600">{pagination.total}</span>
            </div>
          </div>
          
          {/* Grid with improved spacing and responsiveness */}
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {digests.map((digest) => (
              <DigestCard key={digest._id} digest={digest} />
            ))}
          </div>
        </>
      )}
      
      {/* Pagination with improved spacing */}
      <div className="mt-10">
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
        />
      </div>
    </div>
  );
}

export default Dashboard;
