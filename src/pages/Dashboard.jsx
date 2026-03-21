import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { propertyAPI } from '../services/api';
import PropertyList from '../components/PropertyList';
import Navbar from '../components/Navbar';
import { 
  HiPlus, HiHome, HiPhotograph, HiUsers, HiOfficeBuilding,
  HiChartBar, HiTrendingUp, HiTrendingDown, HiRefresh,
  HiOutlineSearch, HiFilter, HiX
} from 'react-icons/hi';

const Dashboard = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
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
  }, [properties, statusFilter, typeFilter, searchTerm]);

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
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.address?.toLowerCase().includes(searchLower) ||
        p.city?.toLowerCase().includes(searchLower) ||
        p.state?.toLowerCase().includes(searchLower) ||
        p.sector?.name?.toLowerCase().includes(searchLower)
      );
    }
    
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
    setStatusFilter(prev => prev === status ? 'all' : status);
  };

  const handleTypeFilter = (type) => {
    setTypeFilter(prev => prev === type ? 'all' : type);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await propertyAPI.delete(id);
      toast.success('Property deleted successfully');
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  const clearAllFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setSearchTerm('');
  };

  const getFilterTitle = () => {
    const statusText = statusFilter === 'all' ? '' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`;
    const typeText = typeFilter === 'all' ? '' : `${typeFilter.toUpperCase()}`;
    
    if (searchTerm) {
      return `Search Results for "${searchTerm}"`;
    } else if (statusFilter !== 'all' && typeFilter !== 'all') {
      return `${statusText} ${typeText} Properties`;
    } else if (statusFilter !== 'all') {
      return `${statusText} Properties`;
    } else if (typeFilter !== 'all') {
      return `${typeText} Properties`;
    } else {
      return 'All Properties';
    }
  };

  const isFilterActive = statusFilter !== 'all' || typeFilter !== 'all' || searchTerm !== '';

  const activePercentage = stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(0) : 0;

  return (<>
    <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dashboard-page">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Property Dashboard
            </h1>
            <p className="text-gray-600 text-sm md:text-base mt-1">Manage your properties efficiently</p>
          </div>
          <Link
            to="/properties/add"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
          >
            <HiPlus className="text-lg md:text-xl" />
            <span>Add New Property</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-full md:max-w-md">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm md:text-base" />
            <input
              type="text"
              placeholder="Search by address, city, state, sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-8 md:pr-10 py-2 md:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-sm md:text-base"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <HiX className="text-base md:text-lg" />
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="mb-8">
          {/* Summary Stats - Responsive grid with 2 columns on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-3 md:p-5 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs md:text-sm">Total Properties</p>
                  <p className="text-xl md:text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 md:p-3 rounded-xl">
                  <HiHome className="text-lg md:text-2xl text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-3 md:p-5 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs md:text-sm">Active Properties</p>
                  <p className="text-xl md:text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 md:p-3 rounded-xl">
                  <HiTrendingUp className="text-lg md:text-2xl text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-3 md:p-5 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs md:text-sm">Inactive Properties</p>
                  <p className="text-xl md:text-3xl font-bold text-red-600 mt-1">{stats.inactive}</p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 md:p-3 rounded-xl">
                  <HiTrendingDown className="text-lg md:text-2xl text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-3 md:p-5 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs md:text-sm">Occupancy Rate</p>
                  <p className="text-xl md:text-3xl font-bold text-purple-600 mt-1">{activePercentage}%</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 md:p-3 rounded-xl">
                  <HiChartBar className="text-lg md:text-2xl text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Status Filters - Responsive Grid */}
          <div className="mb-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <HiFilter className="text-blue-600 text-sm md:text-base" />
              Status Filters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {/* Total Properties - Always shows all */}
              <div className={`bg-white rounded-xl shadow-md p-3 md:p-5 transition-all cursor-pointer hover:shadow-lg ${
                statusFilter === 'all' && !typeFilter !== 'all' ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleStatusFilter('all')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm">All Properties</p>
                    <p className="text-lg md:text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
                  </div>
                  <div className="bg-gray-500 p-2 md:p-3 rounded-xl">
                    <HiHome className="text-base md:text-xl text-white" />
                  </div>
                </div>
                {statusFilter === 'all' && (
                  <div className="mt-1 md:mt-2 text-xs text-blue-600 font-semibold">✓ Current Filter</div>
                )}
              </div>

              {/* Active Properties - Clickable */}
              <div
                onClick={() => handleStatusFilter('active')}
                className={`bg-white rounded-xl shadow-md p-3 md:p-5 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ${
                  statusFilter === 'active' ? 'ring-2 ring-green-500 shadow-lg' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm">Active Properties</p>
                    <p className="text-lg md:text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 md:p-3 rounded-xl">
                    <HiPhotograph className="text-base md:text-xl text-white" />
                  </div>
                </div>
                {statusFilter === 'active' && (
                  <div className="mt-1 md:mt-2 text-xs text-green-600 font-semibold">✓ Selected</div>
                )}
              </div>

              {/* Inactive Properties - Clickable */}
              <div
                onClick={() => handleStatusFilter('inactive')}
                className={`bg-white rounded-xl shadow-md p-3 md:p-5 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ${
                  statusFilter === 'inactive' ? 'ring-2 ring-red-500 shadow-lg' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm">Inactive Properties</p>
                    <p className="text-lg md:text-2xl font-bold text-red-600 mt-1">{stats.inactive}</p>
                  </div>
                  <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 md:p-3 rounded-xl">
                    <HiOfficeBuilding className="text-base md:text-xl text-white" />
                  </div>
                </div>
                {statusFilter === 'inactive' && (
                  <div className="mt-1 md:mt-2 text-xs text-red-600 font-semibold">✓ Selected</div>
                )}
              </div>
            </div>
          </div>

          {/* Type Filters - Responsive Grid */}
          <div>
            <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <HiOfficeBuilding className="text-blue-600 text-sm md:text-base" />
              Property Type Filters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {/* PG Properties - Clickable */}
              <div
                onClick={() => handleTypeFilter('pg')}
                className={`bg-white rounded-xl shadow-md p-3 md:p-5 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ${
                  typeFilter === 'pg' ? 'ring-2 ring-purple-500 shadow-lg' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm">PG Properties</p>
                    <p className="text-lg md:text-2xl font-bold text-purple-600 mt-1">{stats.pg}</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 md:p-3 rounded-xl">
                    <HiUsers className="text-base md:text-xl text-white" />
                  </div>
                </div>
                {typeFilter === 'pg' && (
                  <div className="mt-1 md:mt-2 text-xs text-purple-600 font-semibold">✓ Selected</div>
                )}
              </div>

              {/* Room Properties - Clickable */}
              <div
                onClick={() => handleTypeFilter('room')}
                className={`bg-white rounded-xl shadow-md p-3 md:p-5 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ${
                  typeFilter === 'room' ? 'ring-2 ring-orange-500 shadow-lg' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm">Room Properties</p>
                    <p className="text-lg md:text-2xl font-bold text-orange-600 mt-1">{stats.room}</p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 md:p-3 rounded-xl">
                    <HiHome className="text-base md:text-xl text-white" />
                  </div>
                </div>
                {typeFilter === 'room' && (
                  <div className="mt-1 md:mt-2 text-xs text-orange-600 font-semibold">✓ Selected</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Properties List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800">{getFilterTitle()}</h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Showing {filteredProperties.length} of {properties.length} properties
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
            </div>
            
            {/* Filter Chips - Responsive wrapping */}
            <div className="flex flex-wrap gap-2">
              {statusFilter !== 'all' && (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="px-2 md:px-3 py-1 md:py-1.5 bg-green-50 text-green-600 rounded-full text-xs md:text-sm hover:bg-green-100 flex items-center gap-1 transition-all"
                >
                  <span>Status: {statusFilter}</span>
                  <span className="text-base md:text-lg ml-1">&times;</span>
                </button>
              )}
              
              {typeFilter !== 'all' && (
                <button
                  onClick={() => setTypeFilter('all')}
                  className="px-2 md:px-3 py-1 md:py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs md:text-sm hover:bg-purple-100 flex items-center gap-1 transition-all"
                >
                  <span>Type: {typeFilter.toUpperCase()}</span>
                  <span className="text-base md:text-lg ml-1">&times;</span>
                </button>
              )}
              
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-2 md:px-3 py-1 md:py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs md:text-sm hover:bg-blue-100 flex items-center gap-1 transition-all"
                >
                  <span>Search: {searchTerm}</span>
                  <span className="text-base md:text-lg ml-1">&times;</span>
                </button>
              )}
              
              {isFilterActive && (
                <button
                  onClick={clearAllFilters}
                  className="px-2 md:px-3 py-1 md:py-1.5 bg-red-50 text-red-600 rounded-full text-xs md:text-sm hover:bg-red-100 flex items-center gap-1 transition-all"
                >
                  <HiX className="text-xs md:text-sm" />
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
    </div>
    </>
  );
};

export default Dashboard;