import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { propertyAPI } from '../services/api';
import PropertyList from '../components/PropertyList';
import { HiPlus, HiHome, HiPhotograph, HiUsers, HiOfficeBuilding } from 'react-icons/hi';

const Dashboard = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Separate filters for status and type
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'pg', 'room'
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pg: 0,
    room: 0,
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  // Apply filters whenever properties or filters change
  useEffect(() => {
    applyFilters();
  }, [properties, statusFilter, typeFilter]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getAll();
      setProperties(response.data);
      
      // Calculate stats
      const total = response.data.length;
      const active = response.data.filter(p => p.propertyStatus === 'active').length;
      const inactive = response.data.filter(p => p.propertyStatus === 'deactive' || p.propertyStatus === 'inactive').length;
      const pg = response.data.filter(p => p.propertyType?.toLowerCase() === 'pg').length;
      const room = response.data.filter(p => p.propertyType?.toLowerCase() === 'room').length;
      
      setStats({ total, active, inactive, pg, room });
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...properties];
    
    // Apply status filter (all, active, inactive)
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(p => p.propertyStatus === 'active');
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(p => p.propertyStatus === 'deactive' || p.propertyStatus === 'inactive');
      }
    }
    
    // Apply type filter (all, pg, room)
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.propertyType?.toLowerCase() === typeFilter);
    }
    
    setFilteredProperties(filtered);
  };

  const handleStatusFilter = (status) => {
    // Toggle: if same status clicked, set to 'all', otherwise set to that status
    setStatusFilter(prev => prev === status ? 'all' : status);
  };

  const handleTypeFilter = (type) => {
    // Toggle: if same type clicked, set to 'all', otherwise set to that type
    setTypeFilter(prev => prev === type ? 'all' : type);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await propertyAPI.delete(id);
      toast.success('Property deleted successfully');
      fetchProperties(); // Refresh list
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  const clearAllFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
  };

  const getFilterTitle = () => {
    const statusText = statusFilter === 'all' ? '' : `${statusFilter} ${typeFilter === 'all' ? 'Properties' : ''}`;
    const typeText = typeFilter === 'all' ? '' : `${typeFilter.toUpperCase()} Properties`;
    const connector = statusFilter !== 'all' && typeFilter !== 'all' ? ' ' : '';
    
    if (statusFilter !== 'all' && typeFilter !== 'all') {
      return `${statusFilter} ${typeFilter.toUpperCase()} Properties`;
    } else if (statusFilter !== 'all') {
      return `${statusFilter} Properties`;
    } else if (typeFilter !== 'all') {
      return `${typeFilter.toUpperCase()} Properties`;
    } else {
      return 'All Properties';
    }
  };

  const isFilterActive = statusFilter !== 'all' || typeFilter !== 'all';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Property Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your properties efficiently</p>
        </div>
        <Link
          to="/properties/add"
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg"
        >
          <HiPlus className="text-xl" />
          <span>Add New Property</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Status Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Properties - Always shows all */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Properties</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
              </div>
              <div className="bg-blue-500 p-4 rounded-full text-white">
                <HiHome className="text-2xl" />
              </div>
            </div>
          </div>

          {/* Active Properties - Clickable */}
          <button
            onClick={() => handleStatusFilter('active')}
            className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer w-full text-left ${
              statusFilter === 'active' ? 'ring-2 ring-green-500 ring-offset-2' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Properties</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.active}</p>
              </div>
              <div className="bg-green-500 p-4 rounded-full text-white">
                <HiPhotograph className="text-2xl" />
              </div>
            </div>
            {statusFilter === 'active' && (
              <div className="mt-2 text-xs text-green-600 font-semibold">
                ✓ Selected
              </div>
            )}
          </button>

          {/* Inactive Properties - Clickable */}
          <button
            onClick={() => handleStatusFilter('inactive')}
            className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer w-full text-left ${
              statusFilter === 'inactive' ? 'ring-2 ring-red-500 ring-offset-2' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Inactive Properties</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.inactive}</p>
              </div>
              <div className="bg-red-500 p-4 rounded-full text-white">
                <HiOfficeBuilding className="text-2xl" />
              </div>
            </div>
            {statusFilter === 'inactive' && (
              <div className="mt-2 text-xs text-red-600 font-semibold">
                ✓ Selected
              </div>
            )}
          </button>
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mt-6 mb-3">Type Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PG Properties - Clickable */}
          <button
            onClick={() => handleTypeFilter('pg')}
            className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer w-full text-left ${
              typeFilter === 'pg' ? 'ring-2 ring-purple-500 ring-offset-2' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">PG Properties</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pg}</p>
              </div>
              <div className="bg-purple-500 p-4 rounded-full text-white">
                <HiUsers className="text-2xl" />
              </div>
            </div>
            {typeFilter === 'pg' && (
              <div className="mt-2 text-xs text-purple-600 font-semibold">
                ✓ Selected
              </div>
            )}
          </button>

          {/* Room Properties - Clickable */}
          <button
            onClick={() => handleTypeFilter('room')}
            className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer w-full text-left ${
              typeFilter === 'room' ? 'ring-2 ring-orange-500 ring-offset-2' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Room Properties</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.room}</p>
              </div>
              <div className="bg-orange-500 p-4 rounded-full text-white">
                <HiHome className="text-2xl" />
              </div>
            </div>
            {typeFilter === 'room' && (
              <div className="mt-2 text-xs text-orange-600 font-semibold">
                ✓ Selected
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Properties List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{getFilterTitle()}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredProperties.length} of {properties.length} properties
            </p>
          </div>
          
          {/* Filter Chips */}
          <div className="flex gap-2">
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 flex items-center gap-1"
              >
                Status: {statusFilter}
                <span className="text-lg ml-1">&times;</span>
              </button>
            )}
            
            {typeFilter !== 'all' && (
              <button
                onClick={() => setTypeFilter('all')}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 flex items-center gap-1"
              >
                Type: {typeFilter.toUpperCase()}
                <span className="text-lg ml-1">&times;</span>
              </button>
            )}
            
            {isFilterActive && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200 flex items-center gap-1"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
        
        <PropertyList 
          properties={filteredProperties} 
          loading={loading} 
          onDelete={handleDelete}
          onRefresh={fetchProperties}
        />
      </div>
    </div>
  );
};

export default Dashboard;