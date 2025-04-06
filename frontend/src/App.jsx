import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DigestDetails from './pages/DigestDetails';
import UserPreferences from './pages/UserPreferences';
import NotFound from './pages/NotFound';

function App() {
  const { currentUser } = useAuth();
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <>
          <Toaster position="top-right" />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              currentUser ? <Navigate to="/dashboard" /> : <Landing />
            } />
            <Route path="/login" element={
              currentUser ? <Navigate to="/dashboard" /> : <Login />
            } />
            <Route path="/signup" element={
              currentUser ? <Navigate to="/dashboard" /> : <Signup />
            } />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route index element={<Dashboard />} />
            </Route>
            
            {/* Fix: Make digest/:id a direct child of the Layout route */}
            <Route path="/digest/:id" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route index element={<DigestDetails />} />
            </Route>
            
            <Route path="/preferences" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route index element={<UserPreferences />} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
