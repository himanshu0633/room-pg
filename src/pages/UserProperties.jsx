import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiHeart, HiCalendar, HiHome, HiBookmark } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { userAPI } from '../services/api';
import { sectorAPI } from '../services/api';
import UserPropertyCard from '../components/UserPropertyCard';
import PropertyFilter from '../components/PropertyFilter';

const UserProperties = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'saved', 'booked'
  const [savedProperties, setSavedProperties] = useState([]);
  const [bookedProperties, setBookedProperties] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [sectors, setSectors] = useState([]);
  const [cities, setCities] = useState(['Delhi', 'Jaipur', 'Gurgaon', 'Noida']);
  const [states, setStates] = useState(['Rajasthan', 'Haryana', 'Uttar Pradesh', 'Delhi']);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all properties
      const propertiesRes = await userAPI.getAllProperties();
      
      // ✅ Filter out inactive properties
      const activeProperties = propertiesRes.data.filter(p => p.propertyStatus === 'active');
      setProperties(activeProperties);
      setFilteredProperties(activeProperties);

      // Fetch sectors for filter
      const sectorsRes = await sectorAPI.getAll();
      setSectors(sectorsRes.data);

      // Fetch saved properties
      await fetchSavedProperties();
      
      // Fetch booked properties
      await fetchBookedProperties();
      
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
      
      // ✅ Filter out inactive properties from saved list
      const activeSaved = response.data.filter(item => item.property?.propertyStatus === 'active');
      setSavedProperties(activeSaved);
      
      // Create set of saved property IDs
      const ids = new Set(activeSaved.map(item => item.property._id));
      setSavedIds(ids);
    } catch (error) {
      console.error('Error fetching saved properties:', error);
    }
  };

  const fetchBookedProperties = async () => {
    try {
      const response = await userAPI.getMyBookings();
      
      // ✅ Filter out inactive properties from booked list
      const activeBooked = response.data.filter(item => item.property?.propertyStatus === 'active');
      setBookedProperties(activeBooked);
    } catch (error) {
      console.error('Error fetching booked properties:', error);
    }
  };

  const handleFilterChange = (filters) => {
    let filtered = [...properties];

    // Apply search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.address?.toLowerCase().includes(searchLower) ||
        p.city?.toLowerCase().includes(searchLower) ||
        p.state?.toLowerCase().includes(searchLower) ||
        p.sector?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply property type filter
    if (filters.propertyType) {
      filtered = filtered.filter(p => p.propertyType === filters.propertyType);
    }

    // Apply city filter
    if (filters.city) {
      filtered = filtered.filter(p => p.city === filters.city);
    }

    // Apply state filter
    if (filters.state) {
      filtered = filtered.filter(p => p.state === filters.state);
    }

    // Apply sector filter
    if (filters.sector) {
      filtered = filtered.filter(p => p.sector === filters.sector || p.sector?._id === filters.sector);
    }

    // Apply price range
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.mrp >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.mrp <= Number(filters.maxPrice));
    }

    setFilteredProperties(filtered);
  };

  const handleSaveToggle = (propertyId, saved) => {
    if (saved) {
      setSavedIds(prev => new Set([...prev, propertyId]));
    } else {
      setSavedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
    }
    // Refresh saved properties
    fetchSavedProperties();
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Find Your Perfect Property</h1>
        <p className="text-gray-600 mt-2">Browse and book properties that match your preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
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
          {activeTab !== 'all' && (
            <button
              onClick={() => setActiveTab('all')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Properties
            </button>
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProperties;