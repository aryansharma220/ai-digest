import { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { app } from '../firebase';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userToken, setUserToken] = useState(null);
  
  // Initialize Firebase Auth with error handling
  let auth;
  try {
    auth = getAuth(app);
  } catch (err) {
    console.error("Firebase Auth initialization error:", err);
    setError("Failed to initialize authentication. Please check your Firebase configuration.");
    setLoading(false);
    // Return early with error UI if auth cannot be initialized
    return (
      <AuthContext.Provider value={{ currentUser: null, loading: false, error: err.message }}>
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h2>
            <p className="text-gray-700 mb-4">
              There was a problem initializing Firebase Authentication. Please check your configuration.
            </p>
            <p className="text-sm text-gray-500">Error: {err.message}</p>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }
  
  // Signup function
  const signup = async (email, password, displayName) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Get ID token for API calls
      const token = await userCredential.user.getIdToken();
      setUserToken(token);
      
      // Create user profile in our backend
      await createUserProfile(userCredential.user, token);
      
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get ID token for API calls
      const token = await userCredential.user.getIdToken();
      setUserToken(token);
      
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  // Google sign in
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Get ID token for API calls
      const token = await userCredential.user.getIdToken();
      setUserToken(token);
      
      // Create user profile in our backend
      await createUserProfile(userCredential.user, token);
      
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  // Logout function
  const logout = () => {
    setUserToken(null);
    return signOut(auth);
  };
  
  // Create user profile in our backend
  const createUserProfile = async (user, token) => {
    try {
      // Make sure we're using the correct API path
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          displayName: user.displayName,
          photoURL: user.photoURL,
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user profile');
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error creating user profile:', err);
    }
  };
  
  // Effect for auth state changes
  useEffect(() => {
    if (!auth) return; // Skip if auth not initialized
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get fresh token
          const token = await user.getIdToken();
          setUserToken(token);
        } catch (err) {
          console.error('Error getting user token:', err);
        }
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, [auth]);
  
  const value = {
    currentUser,
    userToken,
    loading,
    error,
    signup,
    login,
    signInWithGoogle,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}
