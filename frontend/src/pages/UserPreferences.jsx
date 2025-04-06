import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserProfile, updateUserPreferences, fetchCategories } from '../services/api';
import toast from 'react-hot-toast';

function UserPreferences() {
  const { userToken } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Form state
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [digestFrequency, setDigestFrequency] = useState('daily');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Fetch user profile and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch both profile and categories in parallel
        const [profileData, categoriesData] = await Promise.all([
          fetchUserProfile(userToken),
          fetchCategories()
        ]);
        
        setProfile(profileData);
        setCategories(categoriesData);
        
        // Initialize form state from profile
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
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const updatedPreferences = {
        categories: selectedCategories,
        digestFrequency,
        notificationsEnabled
      };
      
      await updateUserPreferences(updatedPreferences, userToken);
      toast.success('Preferences saved successfully!');
    } catch (err) {
      toast.error('Failed to save preferences');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Toggle category selection
  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          User Preferences
        </h1>
        <p className="mt-1 text-gray-500">
          Customize your AI digest experience
        </p>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Categories of Interest</h2>
            <p className="text-sm text-gray-500 mb-4">
              Select the categories you're interested in to personalize your digest.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.category} className="flex items-center">
                  <input
                    id={`category-${category.category}`}
                    type="checkbox"
                    checked={selectedCategories.includes(category.category)}
                    onChange={() => toggleCategory(category.category)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`category-${category.category}`} className="ml-2 block text-sm text-gray-900">
                    {category.category} ({category.count})
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Digest Frequency</h2>
            <select
              value={digestFrequency}
              onChange={(e) => setDigestFrequency(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Notifications</h2>
            <div className="flex items-center">
              <input
                id="notifications-enabled"
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="notifications-enabled" className="ml-2 block text-sm text-gray-900">
                Enable email notifications when new digests are available
              </label>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserPreferences;
