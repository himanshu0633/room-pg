import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiHome, HiExclamationCircle, HiSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { userAPI } from '../services/api';
import { sectorAPI } from '../services/api';
import UserPropertyCard from '../components/UserPropertyCard';
import PropertyFilter from '../components/PropertyFilter';
import Navbar from '../components/Navbar';

const UserProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectors, setSectors] = useState([]);
  const [cities, setCities] = useState(['Delhi', 'Jaipur', 'Gurgaon', 'Noida']);
  const [states, setStates] = useState(['Rajasthan', 'Haryana', 'Uttar Pradesh', 'Delhi']);
  const [savedIds, setSavedIds] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Check if user is logged in
  const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user;
  };

  const handleLoginRequired = (action, propertyId = null) => {
    setPendingAction({ action, propertyId });
    setShowLoginModal(true);
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate('/auth');
  };

  const handleCancel = () => {
    setShowLoginModal(false);
    setPendingAction(null);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const propertiesRes = await userAPI.getAllProperties();
      const activeProperties = propertiesRes.data.filter(p => p.propertyStatus === 'active');
      setProperties(activeProperties);
      setFilteredProperties(activeProperties);

      const sectorsRes = await sectorAPI.getAll();
      setSectors(sectorsRes.data);

      // Fetch saved IDs if user is logged in
      if (isLoggedIn()) {
        await fetchSavedIds();
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedIds = async () => {
    try {
      const response = await userAPI.getMySavedProperties();
      const activeSaved = response.data.filter(item => item.property?.propertyStatus === 'active');
      const ids = new Set(activeSaved.map(item => item.property._id));
      setSavedIds(ids);
    } catch (error) {
      console.error('Error fetching saved properties:', error);
    }
  };

  const handleFilterChange = (filters) => {
    let filtered = [...properties];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.address?.toLowerCase().includes(searchLower) ||
        p.city?.toLowerCase().includes(searchLower) ||
        p.state?.toLowerCase().includes(searchLower) ||
        p.sector?.name?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.propertyType) {
      filtered = filtered.filter(p => p.propertyType === filters.propertyType);
    }

    if (filters.city) {
      filtered = filtered.filter(p => p.city === filters.city);
    }

    if (filters.state) {
      filtered = filtered.filter(p => p.state === filters.state);
    }

    if (filters.sector) {
      filtered = filtered.filter(p => p.sector === filters.sector || p.sector?._id === filters.sector);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(p => p.mrp >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.mrp <= Number(filters.maxPrice));
    }

    setFilteredProperties(filtered);
  };

  const handleSaveToggle = async (propertyId, saved) => {
    // Check login status
    if (!isLoggedIn()) {
      handleLoginRequired('save', propertyId);
      return;
    }

    if (saved) {
      setSavedIds(prev => new Set([...prev, propertyId]));
    } else {
      setSavedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
    }
    // Refresh saved IDs
    await fetchSavedIds();
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 user-properties-page">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Find Your Perfect Property
          </h1>
          <p className="text-gray-600 mt-2">Browse and book properties that match your preferences</p>
        </div>

        {/* Simple Header with Count */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <HiHome className="text-blue-600 text-xl" />
            <h2 className="text-xl font-semibold text-gray-800">All Properties</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
              {filteredProperties.length} properties
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">Discover the best properties available for rent</p>
        </div>

        {/* Filters */}
        <PropertyFilter
          onFilterChange={handleFilterChange}
          sectors={sectors}
          cities={cities}
          states={states}
        />

        {/* Properties Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading properties...</p>
            </div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiSearch className="text-3xl text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">No properties found</p>
            <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                // Clear filters logic would go here
                window.location.reload();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map(property => (
              <UserPropertyCard
                key={property._id}
                property={property}
                isSaved={savedIds.has(property._id)}
                onSaveToggle={handleSaveToggle}
                isLoggedIn={isLoggedIn()}
                onLoginRequired={handleLoginRequired}
              />
            ))}
          </div>
        )}
      </div>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={handleCancel} />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-fadeInUp">
              <div className="p-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiExclamationCircle className="text-4xl text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h3>
                  <p className="text-gray-600 mb-6">
                    You need to be logged in to {pendingAction?.action === 'save' ? 'save this property' : 'book this property'}.
                    Please login to continue.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLoginRedirect}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Login Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        .user-properties-page {
          margin-top: 80px;
        }
      `}</style>
    </>
  );
};

export default UserProperties;