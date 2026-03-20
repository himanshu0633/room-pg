import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import PropertyDetails from './pages/PropertyDetails';
import SectorManagement from './pages/SectorManagement';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/admindashboard" element={<Dashboard />} />
          <Route path="/properties/add" element={<AddProperty />} />
          <Route path="/properties/edit/:id" element={<EditProperty />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/sectors" element={<SectorManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;