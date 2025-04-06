import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bars3Icon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

function Navbar({ onMenuClick }) {
  const { currentUser, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  return (
    <nav className="bg-indigo-600 text-white shadow-md sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <button 
              className="inline-flex items-center justify-center p-2 rounded-md md:hidden"
              onClick={onMenuClick}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <div className="flex flex-shrink-0 items-center">
              <Link to="/" className="text-xl font-bold">AI Digest</Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex rounded-full bg-indigo-500 text-sm focus:outline-none"
                >
                  {currentUser?.photoURL ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={currentUser.photoURL}
                      alt="User avatar"
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8" />
                  )}
                </button>
              </div>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700">
                      {currentUser?.displayName || currentUser?.email}
                    </div>
                    
                    <Link
                      to="/preferences"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Preferences
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
