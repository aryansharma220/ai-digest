import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DigestDetails from './pages/DigestDetails';
import UserPreferences from './pages/UserPreferences';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="digest/:id" element={<DigestDetails />} />
          <Route path="preferences" element={<UserPreferences />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
