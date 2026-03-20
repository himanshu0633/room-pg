import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import { 
  HiRefresh, HiHome, HiOfficeBuilding, HiOutlineSearch, 
  HiSortAscending, HiSortDescending, HiFilter, HiX 
} from 'react-icons/hi';

const PropertyList = ({ properties, loading, onDelete, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    status: ''
  });

  // Filter properties based on search and filters
  const filteredProperties = properties.filter(property => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        property.address?.toLowerCase().includes(searchLower) ||
        property.city?.toLowerCase().includes(searchLower) ||
        property.state?.toLowerCase().includes(searchLower) ||
        property.sector?.name?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Property type filter
    if (filters.propertyType && property.propertyType !== filters.propertyType) {
      return false;
    }

    // Price range filter
    if (filters.minPrice && property.mrp < Number(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && property.mrp > Number(filters.maxPrice)) {
      return false;
    }

    // Status filter
    if (filters.status && property.propertyStatus !== filters.status) {
      return false;
    }

    return true;
  });

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'price-high':
        return b.mrp - a.mrp;
      case 'price-low':
        return a.mrp - b.mrp;
      default:
        return 0;
    }
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      status: ''
    });
    setSearchTerm('');
  };

  const hasActiveFilters = searchTerm || 
    filters.propertyType || 
    filters.minPrice || 
    filters.maxPrice || 
    filters.status;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-600 mb-4"></div>
        <p className="text-gray-500">Loading properties...</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HiHome className="text-4xl text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg mb-4">No properties found</p>
        <p className="text-gray-400 mb-6">Get started by adding your first property</p>
        <Link
          to="/properties/add"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-md"
        >
          <HiHome className="text-xl" />
          Add Your First Property
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header with Search and Filters */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <HiOfficeBuilding className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-700">
                Showing <span className="font-semibold text-blue-600">{sortedProperties.length}</span> 
                {' '}of <span className="font-semibold">{properties.length}</span> properties
              </p>
              {hasActiveFilters && (
                <p className="text-xs text-gray-500 mt-1">
                  Filtered results
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 lg:w-64">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by address, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <HiX className="text-sm" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
            </select>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                hasActiveFilters 
                  ? 'bg-blue-600 text-white' 
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <HiFilter className="text-lg" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-white text-blue-600 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {Object.values(filters).filter(f => f).length + (searchTerm ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:text-blue-600 hover:border-blue-600 transition-all"
              title="Refresh properties"
            >
              <HiRefresh className="text-xl" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Property Type Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Property Type
                </label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="pg">PG</option>
                  <option value="room">Room</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="deactive">Inactive</option>
                </select>
              </div>

              {/* Min Price Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="Min price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Max Price Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="Max price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Filter Actions */}
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  <HiX className="text-lg" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Properties Grid */}
      {sortedProperties.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineSearch className="text-3xl text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg mb-2">No matching properties</p>
          <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {sortedProperties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyList;