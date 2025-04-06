import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserProfile, updateUserProfile } from '../services/api';
import toast from 'react-hot-toast';
import { UserCircleIcon, PencilIcon, KeyIcon, CheckIcon, XMarkIcon, CogIcon, BookmarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

function UserProfile() {
  const { currentUser, userToken, updateUserEmail } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  
  // Stats for display
  const [stats, setStats] = useState({
    digests: 0,
    bookmarks: 0,
    daysSinceJoined: 0
  });
  
  // Fetch user profile
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const profileData = await fetchUserProfile(userToken);
        setProfile(profileData);
        
        // Initialize form state
        setName(profileData.name || '');
        setEmail(profileData.email || '');
        setBio(profileData.bio || '');
        
        // Calculate stats
        const joinDate = profileData.dateJoined ? new Date(profileData.dateJoined) : new Date();
        const daysSince = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));
        
        setStats({
          digests: profileData.digestsRead || 0,
          bookmarks: profileData.bookmarks?.length || 0,
          daysSinceJoined: daysSince
        });
        
        setError(null);
      } catch (err) {
        setError('Failed to load user profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (userToken) {
      fetchData();
    }
  }, [userToken]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const updatedProfile = {
        name,
        email,
        bio
      };
      
      await updateUserProfile(updatedProfile, userToken);
      
      // If email was changed, update auth
      if (email !== profile.email) {
        await updateUserEmail(email);
      }
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        ...updatedProfile
      }));
      
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle cancel edit
  const handleCancel = () => {
    setName(profile.name || '');
    setEmail(profile.email || '');
    setBio(profile.bio || '');
    setIsEditing(false);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-t-4 border-l-4 border-indigo-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-indigo-600 font-medium animate-pulse">Loading your profile...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error loading profile</h3>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white relative overflow-hidden pb-12">
      {/* Background decoration */}
      <div className="absolute top-20 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-3000"></div>
      <div className="absolute bottom-20 -left-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-1000"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.07]"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Profile header */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-12 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <UserCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                User Profile
              </h1>
              <p className="mt-1 text-gray-600">
                View and update your account information
              </p>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Profile card */}
          <div className="md:col-span-1">
            <div className="bg-white/80 backdrop-filter backdrop-blur-sm shadow-xl rounded-2xl border border-gray-100 overflow-hidden animate-slideInUp">
              {/* Profile image */}
              <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-center items-end">
                <div className="h-24 w-24 rounded-full bg-white p-1 mb-[-3rem]">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
                    {profile?.name?.[0] || profile?.email?.[0] || 'U'}
                  </div>
                </div>
              </div>
              
              {/* Profile info */}
              <div className="pt-14 px-6 pb-6 text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {profile?.name || 'User'}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {profile?.email}
                </p>
                
                {profile?.bio && (
                  <p className="text-sm text-gray-700 border-t border-gray-100 pt-4 mb-4">
                    {profile.bio}
                  </p>
                )}
                
                {/* User stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <div className="text-xl font-bold text-indigo-600">{stats.digests}</div>
                    <div className="text-xs text-gray-500">Digests Read</div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <div className="text-xl font-bold text-indigo-600">{stats.bookmarks}</div>
                    <div className="text-xs text-gray-500">Bookmarks</div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <div className="text-xl font-bold text-indigo-600">{stats.daysSinceJoined}</div>
                    <div className="text-xs text-gray-500">Days Active</div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to="/preferences"
                    className="flex-1 px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-1 shadow-sm hover:shadow transition-all"
                  >
                    <CogIcon className="h-4 w-4" />
                    <span>Preferences</span>
                  </Link>
                  <button
                    onClick={() => setIsEditing(true)}
                    disabled={isEditing}
                    className="flex-1 px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-1 shadow-sm hover:shadow transition-all disabled:opacity-50"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Recent activity card */}
            <div className="mt-6 bg-white/80 backdrop-filter backdrop-blur-sm shadow-xl rounded-2xl border border-gray-100 overflow-hidden animate-slideInUp animation-delay-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-1">
                      <DocumentTextIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Read digest "New LLM Achieves State-of-the-Art Results"</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mt-1">
                      <BookmarkIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Bookmarked "Multimodal Architecture for Vision-Language Tasks"</p>
                      <p className="text-xs text-gray-500">5 days ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mt-1">
                      <CogIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Updated preferences</p>
                      <p className="text-xs text-gray-500">1 week ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Profile edit form or details */}
          <div className="md:col-span-2">
            <div className="bg-white/80 backdrop-filter backdrop-blur-sm shadow-xl rounded-2xl border border-gray-100 overflow-hidden animate-slideInUp animation-delay-300">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Edit Profile' : 'Account Information'}
                </h3>
                {isEditing && (
                  <button 
                    onClick={handleCancel}
                    className="text-gray-500 hover:text-red-500"
                    disabled={saving}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              {isEditing ? (
                // Edit form
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
                        placeholder="Your name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        Bio <span className="text-gray-400 text-xs">(optional)</span>
                      </label>
                      <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
                        placeholder="Tell us a bit about yourself..."
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        {saving ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                // Profile details
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-500 mb-1">Full Name</div>
                        <div className="text-base font-medium text-gray-900">{profile?.name || 'Not provided'}</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-500 mb-1">Email Address</div>
                        <div className="text-base font-medium text-gray-900">{profile?.email}</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">Bio</div>
                      <div className="text-base text-gray-900">{profile?.bio || 'No bio provided'}</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">Account Created</div>
                      <div className="text-base font-medium text-gray-900">
                        {profile?.dateJoined 
                          ? new Date(profile.dateJoined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : 'Unknown'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Account security card */}
            <div className="mt-6 bg-white/80 backdrop-filter backdrop-blur-sm shadow-xl rounded-2xl border border-gray-100 overflow-hidden animate-slideInUp animation-delay-400">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-4">
                      <KeyIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-base font-medium text-gray-900">Password</div>
                      <div className="text-sm text-gray-500">Last changed: Never</div>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                    Change Password
                  </button>
                </div>
                
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-base font-medium text-gray-900">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-500">Add an extra layer of security to your account</div>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                    Setup 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 40px) scale(1.05); }
        }
        
        .animate-blob {
          animation: blob 15s infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
}

export default UserProfile;
