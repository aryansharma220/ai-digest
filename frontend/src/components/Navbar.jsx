import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchCategories } from '../services/api';
import { 
  SparklesIcon, 
  HomeIcon, 
  AdjustmentsHorizontalIcon, 
  Bars3Icon, 
  XMarkIcon, 
  ChevronDownIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  
  const categoryDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Fetch categories
  useEffect(() => {
    const getCategories = async () => {
      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    getCategories();
  }, []);

  // Handle scroll events for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setIsUserDropdownOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // You would implement actual dark mode toggle functionality here
    // document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/90 backdrop-blur-md shadow-md py-2' 
        : 'bg-white py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-600 rounded-full blur-md opacity-30 group-hover:opacity-70 transition-opacity"></div>
                <SparklesIcon className="h-8 w-8 text-indigo-600 relative z-10 animate-pulse" />
              </div>
              <span className="font-bold text-xl text-indigo-800">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                  AI Digest
                </span>
              </span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">

            
            {/* Categories dropdown */}
            <div className="relative" ref={categoryDropdownRef}>
              
              {isCategoryDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 max-h-[60vh] overflow-y-auto backdrop-blur-sm border border-gray-100">
                  <div className="py-2 px-1" role="none">
                    {categories.map((category) => (
                      <NavLink
                        key={category.category}
                        to={`/?category=${category.category}`}
                        className={({ isActive }) => 
                          `block px-4 py-2 text-sm rounded-lg ${
                            isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                          }`
                        }
                        onClick={() => setIsCategoryDropdownOpen(false)}
                      >
                        <div className="flex justify-between items-center">
                          <span>{category.category}</span>
                          <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{category.count}</span>
                        </div>
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <NavLink
              to="/preferences"
              className={({ isActive }) => 
                `px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive 
                    ? 'text-white bg-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`
              }
            >
              <span className="flex items-center">
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-1.5" />
                Preferences
              </span>
            </NavLink>
            
            <button 
              className="px-3 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
            
            
            {/* User menu */}
            {currentUser ? (
              <div className="ml-2 relative" ref={userDropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 bg-white rounded-full pl-2 pr-3 py-1 shadow-sm border border-gray-200 hover:shadow transition-all"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                    {currentUser?.displayName?.[0] || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{currentUser?.displayName || 'User'}</span>
                  <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none backdrop-blur-sm border border-gray-100">
                    <div className="py-1" role="none">
                      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                        Signed in as <span className="font-medium text-gray-900">{currentUser?.email}</span>
                      </div>
                                            
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-4 flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            {currentUser && (
              <div className="mr-2 relative">
                <button className="p-2 rounded-full bg-white text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all relative">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
                </button>
              </div>
            )}
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isMenuOpen ? 'max-h-[80vh] opacity-100 border-t border-gray-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="bg-white px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-lg">
          <NavLink 
            to="/"
            end
            className={({ isActive }) => 
              `block px-3 py-2 rounded-lg text-base font-medium ${
                isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
              }`
            }
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="flex items-center">
              <HomeIcon className="h-5 w-5 mr-2" />
              Dashboard
            </span>
          </NavLink>
          
          <NavLink
            to="/preferences"
            className={({ isActive }) => 
              `block px-3 py-2 rounded-lg text-base font-medium ${
                isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
              }`
            }
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="flex items-center">
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              Preferences
            </span>
          </NavLink>
          
          <div className="px-3 py-2">
            <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">Categories</h3>
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
              {categories.map((category) => (
                <NavLink
                  key={category.category}
                  to={`/?category=${category.category}`}
                  className={({ isActive }) => 
                    `block px-3 py-2 rounded-lg text-sm ${
                      isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex justify-between items-center">
                    <span>{category.category}</span>
                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{category.count}</span>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
          
          {/* Mobile display mode toggle */}
          <div className="px-3 py-2 flex justify-between items-center">
            <span className="text-gray-700 font-medium">Dark Mode</span>
            <button 
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          
          {/* Mobile user menu */}
          {currentUser ? (
            <div className="px-3 py-2 border-t border-gray-100 mt-2">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                  {currentUser?.displayName?.[0] || 'U'}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{currentUser?.displayName || 'User'}</div>
                  <div className="text-xs text-gray-500">{currentUser?.email}</div>
                </div>
              </div>
              
              <Link
                to="/profile"
                className="block w-full px-3 py-2 rounded-lg text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <UserCircleIcon className="h-5 w-5 mr-2" />
                Your Profile
              </Link>
              
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full px-3 py-2 rounded-lg text-left text-sm font-medium text-red-600 hover:bg-red-50 mt-1 flex items-center"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Sign out
              </button>
            </div>
          ) : (
            <div className="px-3 py-2 border-t border-gray-100 mt-2 space-y-2">
              <Link 
                to="/login" 
                className="block w-full px-4 py-2 rounded-lg text-base font-medium text-center text-gray-700 bg-gray-100 hover:bg-gray-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="block w-full px-4 py-2 rounded-lg text-base font-medium text-center text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
