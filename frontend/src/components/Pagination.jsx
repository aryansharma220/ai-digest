import { useSearchParams } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

function Pagination({ currentPage, totalPages, totalItems }) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Change page handler
  const changePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    
    // Scroll to top with smooth animation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    // Add current page and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }
    
    // Always show last page for totalPages > 1
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    // Add ellipses where needed
    const result = [];
    let prev = 0;
    
    for (const page of pages) {
      if (page - prev > 1) {
        result.push('...');
      }
      result.push(page);
      prev = page;
    }
    
    return result;
  };
  
  if (totalPages <= 1) return null;
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-indigo-600">{Math.min(1 + (currentPage - 1) * 10, totalItems)}</span> to{' '}
            <span className="font-medium text-indigo-600">{Math.min(currentPage * 10, totalItems)}</span> of{' '}
            <span className="font-medium text-indigo-600">{totalItems}</span> results
          </p>
        </div>
        
        <div>
          <nav className="inline-flex shadow-sm rounded-lg overflow-hidden" aria-label="Pagination">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 text-gray-600 bg-white hover:bg-indigo-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => changePage(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'text-gray-700 bg-white hover:bg-indigo-50'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
            
            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-3 py-2 text-gray-600 bg-white hover:bg-indigo-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
