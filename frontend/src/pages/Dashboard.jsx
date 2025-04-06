import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchDigests, fetchPersonalizedDigests } from '../services/api';
import DigestCard from '../components/DigestCard';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';

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
  
  // Get filters from URL
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {viewMode === 'personalized' ? 'Your Personalized AI Digest' : 'Latest AI Developments'}
        </h1>
        <p className="mt-1 text-gray-500">
          Stay updated with the latest in AI research, tools, and models
        </p>
      </div>
      
      <FilterBar />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      ) : digests.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">No digests found with the current filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {digests.map((digest) => (
            <DigestCard key={digest._id} digest={digest} />
          ))}
        </div>
      )}
      
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        totalItems={pagination.total}
      />
    </div>
  );
}

export default Dashboard;
