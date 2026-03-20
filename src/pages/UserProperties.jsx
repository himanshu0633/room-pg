import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiHeart, HiCalendar, HiHome, HiBookmark, HiExclamationCircle } from 'react-icons/hi';
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
  const [activeTab, setActiveTab] = useState('all');
  const [savedProperties, setSavedProperties] = useState([]);
  const [bookedProperties, setBookedProperties] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [sectors, setSectors] = useState([]);
  const [cities, setCities] = useState(['Delhi', 'Jaipur', 'Gurgaon', 'Noida']);
  const [states, setStates] = useState(['Rajasthan', 'Haryana', 'Uttar Pradesh', 'Delhi']);
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

      // Only fetch saved and booked if user is logged in
      if (isLoggedIn()) {
        await fetchSavedProperties();
        await fetchBookedProperties();
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedProperties = async () => {
    try {
      const response = await userAPI.getMySavedProperties();
      const activeSaved = response.data.filter(item => item.property?.propertyStatus === 'active');
      setSavedProperties(activeSaved);
      const ids = new Set(activeSaved.map(item => item.property._id));
      setSavedIds(ids);
    } catch (error) {
      console.error('Error fetching saved properties:', error);
    }
  };

  const fetchBookedProperties = async () => {
    try {
      const response = await userAPI.getMyBookings();
      const activeBooked = response.data.filter(item => item.property?.propertyStatus === 'active');
      setBookedProperties(activeBooked);
    } catch (error) {
      console.error('Error fetching booked properties:', error);
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
    await fetchSavedProperties();
  };

  const handleBookProperty = async (propertyId) => {
    // Check login status
    if (!isLoggedIn()) {
      handleLoginRequired('book', propertyId);
      return;
    }

    // This will be handled by UserPropertyCard component
    return true;
  };

  const getDisplayProperties = () => {
    switch(activeTab) {
      case 'saved':
        return savedProperties.map(item => item.property);
      case 'booked':
        return bookedProperties.map(item => item.property);
      default:
        return filteredProperties;
    }
  };

  const displayProperties = getDisplayProperties();

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 user-properties-page">
        {/* Header */}
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Find Your Perfect Property</h1>
          <p className="text-gray-600 mt-2">Browse and book properties that match your preferences</p>
        </div>

        {/* Tabs - Only show saved/booked if logged in */}
        <div className="flex gap-4 mb-6 border-b flex-wrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-4 flex items-center gap-2 transition-colors ${
              activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <HiHome className="text-lg" />
            All Properties ({properties.length})
          </button>
          
          {isLoggedIn() && (
            <>
              <button
                onClick={() => setActiveTab('saved')}
                className={`pb-3 px-4 flex items-center gap-2 transition-colors ${
                  activeTab === 'saved'
                    ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <HiHeart className="text-lg" />
                Saved ({savedProperties.length})
              </button>
              <button
                onClick={() => setActiveTab('booked')}
                className={`pb-3 px-4 flex items-center gap-2 transition-colors ${
                  activeTab === 'booked'
                    ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <HiCalendar className="text-lg" />
                Booked ({bookedProperties.length})
              </button>
            </>
          )}
        </div>

        {/* Filters - Only show on All Properties tab */}
        {activeTab === 'all' && (
          <PropertyFilter
            onFilterChange={handleFilterChange}
            sectors={sectors}
            cities={cities}
            states={states}
          />
        )}

        {/* Login Required Message for Saved/Booked tabs when not logged in */}
        {!isLoggedIn() && (activeTab === 'saved' || activeTab === 'booked') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center mb-6">
            <HiExclamationCircle className="text-4xl text-yellow-600 mx-auto mb-3" />
            <p className="text-gray-700 text-lg mb-2">Login Required</p>
            <p className="text-gray-500 mb-4">Please login to view your saved and booked properties</p>
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login Now
            </button>
          </div>
        )}

        {/* Properties Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : displayProperties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg mb-4">
              {activeTab === 'saved' 
                ? "You haven't saved any properties yet" 
                : activeTab === 'booked'
                ? "You haven't booked any properties yet"
                : 'No properties match your filters'}
            </p>
            {activeTab !== 'all' && isLoggedIn() && (
              <button
                onClick={() => setActiveTab('all')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Browse Properties
              </button>
            )}
            {!isLoggedIn() && activeTab === 'all' && displayProperties.length === 0 && (
              <Link
                to="/auth"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
              >
                Login to Save Properties
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProperties.map(property => (
              <UserPropertyCard
                key={property._id}
                property={property}
                isSaved={savedIds.has(property._id)}
                onSaveToggle={handleSaveToggle}
                onBookProperty={handleBookProperty}
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
                    You need to be logged in to {pendingAction?.action === 'save' ? 'save properties' : 'book properties'}.
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
          .user-properties-page{
          margin-top: 80px;
          }
      `}</style>
    </>
  );
};

export default UserProperties;