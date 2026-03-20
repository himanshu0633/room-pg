import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import PropertyDetails from './pages/PropertyDetails';
import SectorManagement from './pages/SectorManagement';
import UserProperties from './pages/UserProperties';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import MyBookings from './pages/MyBookings';
import SavedProperties from './pages/SavedProperties';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar - Shows on all pages except landing page? */}
        {/* <Navbar /> */}
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
        
        <Routes>
          {/* Public Routes - Everyone can see */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/properties" element={<UserProperties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          
          {/* Admin Only Routes */}
          <Route path="/admindashboard" element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <Dashboard />
            </RoleBasedRoute>
          } />
          
          <Route path="/properties/add" element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AddProperty />
            </RoleBasedRoute>
          } />
          
          <Route path="/properties/edit/:id" element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <EditProperty />
            </RoleBasedRoute>
          } />
          
          <Route path="/sectors" element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <SectorManagement />
            </RoleBasedRoute>
          } />
          
          {/* User Only Routes */}
          <Route path="/my-bookings" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <MyBookings />
            </RoleBasedRoute>
          } />
          
          <Route path="/saved-properties" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <SavedProperties />
            </RoleBasedRoute>
          } />
          
          {/* Catch all - Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;