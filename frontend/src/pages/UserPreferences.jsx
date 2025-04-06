import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserProfile, updateUserPreferences, fetchCategories } from '../services/api';
import toast from 'react-hot-toast';
import { CheckIcon, AdjustmentsHorizontalIcon, BellIcon, ClockIcon, TagIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// Remove the problematic import and create our own switch component
function CustomSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      className={`${
        checked ? 'bg-indigo-600' : 'bg-gray-200'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`${
          checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
      />
    </button>
  );
}

function UserPreferences() {
  const { userToken } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [digestFrequency, setDigestFrequency] = useState('daily');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [activeTab, setActiveTab] = useState('categories');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [profileData, categoriesData] = await Promise.all([
          fetchUserProfile(userToken),
          fetchCategories()
        ]);
        
        setProfile(profileData);
        setCategories(categoriesData);
        
        if (profileData.preferences) {
          setSelectedCategories(profileData.preferences.categories || []);
          setDigestFrequency(profileData.preferences.digestFrequency || 'daily');
          setNotificationsEnabled(profileData.preferences.notificationsEnabled !== false);
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to load user preferences');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (userToken) {
      fetchData();
    }
  }, [userToken]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setSaveSuccess(false);
      
      const updatedPreferences = {
        categories: selectedCategories,
        digestFrequency,
        notificationsEnabled
      };
      
      await updateUserPreferences(updatedPreferences, userToken);
      setSaveSuccess(true);
      toast.success('Preferences saved successfully!');
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      toast.error('Failed to save preferences');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-t-4 border-l-4 border-indigo-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-indigo-600 font-medium animate-pulse">Loading your preferences...</p>
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
            <h3 className="text-lg font-medium text-red-800 mb-2">Error loading preferences</h3>
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
      <div className="absolute top-20 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-3000"></div>
      <div className="absolute bottom-20 -left-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-1000"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.07]"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-12 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <AdjustmentsHorizontalIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                User Preferences
              </h1>
              <p className="mt-1 text-gray-600">
                Customize your AI digest experience and get personalized content
              </p>
            </div>
          </div>
          
          {profile && (
            <div className="bg-white/70 backdrop-blur-sm shadow-sm rounded-xl p-4 border border-gray-100 flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                {profile.name?.[0] || profile.email?.[0] || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{profile.name || 'User'}</p>
                <p className="text-xs text-gray-500">{profile.email}</p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {profile.preferences?.digestFrequency || 'Daily'} digest
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white/80 backdrop-filter backdrop-blur-sm shadow-xl rounded-2xl border border-gray-100 overflow-hidden animate-slideInUp">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-4 text-sm font-medium flex items-center ${
                activeTab === 'categories' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
              }`}
            >
              <TagIcon className="h-5 w-5 mr-2" />
              Categories
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-4 text-sm font-medium flex items-center ${
                activeTab === 'notifications' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
              }`}
            >
              <BellIcon className="h-5 w-5 mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('frequency')}
              className={`px-6 py-4 text-sm font-medium flex items-center ${
                activeTab === 'frequency' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
              }`}
            >
              <ClockIcon className="h-5 w-5 mr-2" />
              Frequency
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className={activeTab === 'categories' ? 'block' : 'hidden'}>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <TagIcon className="h-5 w-5 mr-2 text-indigo-600" />
                    Categories of Interest
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Select the categories you're interested in to personalize your digest.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categories.map((category) => (
                      <div
                        key={category.category}
                        onClick={() => toggleCategory(category.category)}
                        className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer ${
                          selectedCategories.includes(category.category)
                            ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`flex-shrink-0 h-5 w-5 rounded flex items-center justify-center mr-3 ${
                          selectedCategories.includes(category.category)
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300'
                        }`}>
                          {selectedCategories.includes(category.category) && (
                            <CheckIcon className="h-3 w-3" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <span className="text-sm font-medium">{category.category}</span>
                        </div>
                        <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
                          {category.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className={activeTab === 'notifications' ? 'block' : 'hidden'}>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <BellIcon className="h-5 w-5 mr-2 text-indigo-600" />
                    Notification Preferences
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Control how and when you want to receive notifications about new digests.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-xs text-gray-500">Receive digest updates in your inbox</p>
                      </div>
                      <CustomSwitch
                        checked={notificationsEnabled}
                        onChange={setNotificationsEnabled}
                      />
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between opacity-50">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                        <p className="text-xs text-gray-500">Receive alerts on your browser</p>
                      </div>
                      <div className="px-2 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full">
                        Coming soon
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between opacity-50">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
                        <p className="text-xs text-gray-500">Get text messages for important updates</p>
                      </div>
                      <div className="px-2 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full">
                        Coming soon
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={activeTab === 'frequency' ? 'block' : 'hidden'}>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2 text-indigo-600" />
                    Digest Frequency
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose how often you want to receive your personalized AI digest.
                  </p>
                  
                  <div className="space-y-3">
                    <div
                      onClick={() => setDigestFrequency('daily')}
                      className={`relative rounded-lg border px-5 py-4 cursor-pointer transition-all ${
                        digestFrequency === 'daily'
                          ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-4 w-4 rounded-full border flex items-center justify-center ${
                            digestFrequency === 'daily'
                              ? 'bg-indigo-600 border-transparent'
                              : 'border-gray-300'
                          }`}>
                            {digestFrequency === 'daily' && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-900">Daily Digest</h3>
                            <p className="text-xs text-gray-500">Receive updates every day</p>
                          </div>
                        </div>
                        <ChevronRightIcon className={`h-5 w-5 ${
                          digestFrequency === 'daily' ? 'text-indigo-600' : 'text-gray-400'
                        }`} />
                      </div>
                    </div>
                    
                    <div
                      onClick={() => setDigestFrequency('weekly')}
                      className={`relative rounded-lg border px-5 py-4 cursor-pointer transition-all ${
                        digestFrequency === 'weekly'
                          ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-4 w-4 rounded-full border flex items-center justify-center ${
                            digestFrequency === 'weekly'
                              ? 'bg-indigo-600 border-transparent'
                              : 'border-gray-300'
                          }`}>
                            {digestFrequency === 'weekly' && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-900">Weekly Digest</h3>
                            <p className="text-xs text-gray-500">Receive a summary once a week</p>
                          </div>
                        </div>
                        <ChevronRightIcon className={`h-5 w-5 ${
                          digestFrequency === 'weekly' ? 'text-indigo-600' : 'text-gray-400'
                        }`} />
                      </div>
                    </div>
                    
                    <div
                      className="relative rounded-lg border px-5 py-4 bg-gray-50 border-gray-200 opacity-60"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-4 w-4 rounded-full border border-gray-300">
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-900">Monthly Digest</h3>
                            <p className="text-xs text-gray-500">Receive a monthly summary</p>
                          </div>
                        </div>
                        <div className="px-2 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full">
                          Coming soon
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <div className={`transition-all duration-300 ${saveSuccess ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center text-green-600">
                  <CheckIcon className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">Preferences saved!</span>
                </div>
              </div>
              
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
                  'Save Preferences'
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn animation-delay-300">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-2">About Personalized Digests</h3>
            <p className="text-xs text-gray-500">
              Our AI uses your category preferences to tailor content specifically to your interests.
              The more categories you select, the more diverse your digest will be.
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Digest Privacy</h3>
            <p className="text-xs text-gray-500">
              Your preference data is only used to personalize your content. We never share your
              personal information with third parties.
            </p>
          </div>
        </div>
      </div>

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
        
        .animation-delay-300 {
          animation-delay: 0.3s;
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

export default UserPreferences;
