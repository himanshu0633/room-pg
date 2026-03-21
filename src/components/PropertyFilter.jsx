import React, { useState, useEffect } from 'react';
import { 
  HiSearch, HiX, HiFilter, HiChevronDown, HiChevronUp,
  HiCurrencyRupee, HiLocationMarker, HiOfficeBuilding,
  HiHome, HiRefresh
} from 'react-icons/hi';
import { sectorAPI } from '../services/api';
import toast from 'react-hot-toast';

const PropertyFilter = ({ onFilterChange, sectors: propSectors = [], cities = [], states = [] }) => {
  const [filters, setFilters] = useState({
    propertyType: '',
    sector: '',
    city: '',
    state: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const [sectors, setSectors] = useState(propSectors);
  const [loadingSectors, setLoadingSectors] = useState(false);

  // Fetch sectors from API if not provided via props
  useEffect(() => {
    if (propSectors.length === 0) {
      fetchSectors();
    } else {
      setSectors(propSectors);
    }
  }, [propSectors]);

  const fetchSectors = async () => {
    try {
      setLoadingSectors(true);
      const response = await sectorAPI.getAll();
      // Only show active sectors
      const activeSectors = response.data.filter(s => s.status === 'active');
      setSectors(activeSectors);
    } catch (error) {
      console.error('Error fetching sectors:', error);
      toast.error('Failed to load sectors');
    } finally {
      setLoadingSectors(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleClear = () => {
    setFilters({
      propertyType: '',
      sector: '',
      city: '',
      state: '',
      minPrice: '',
      maxPrice: '',
      search: ''
    });
    onFilterChange({});
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(v => v !== '').length;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
      {/* Header */}
      {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b">
        <div className="flex items-center gap-2">
          <HiFilter className="text-blue-600 text-lg" />
          <h3 className="text-lg font-semibold text-gray-800">Find Properties</h3>
        </div>
        <p className="text-sm text-gray-500 mt-1">Search and filter properties to find your perfect match</p>
      </div> */}

      {/* Search Bar */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Search by address, city, state, or sector..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2 font-medium"
            >
              <HiFilter className="text-lg" />
              <span>Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                  {getActiveFilterCount()}
                </span>
              )}
              {showFilters ? <HiChevronUp className="text-lg" /> : <HiChevronDown className="text-lg" />}
            </button>
            
            {getActiveFilterCount() > 0 && (
              <button
                onClick={handleClear}
                className="px-5 py-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2 font-medium"
              >
                <HiX className="text-lg" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="px-5 pb-5 border-t border-gray-100 animate-fadeIn">
          <div className="pt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <HiHome className="text-gray-400" />
                  Property Type
                </label>
                <select
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all"
                >
                  <option value="">All Types</option>
                  <option value="pg">PG / Paying Guest</option>
                  <option value="room">Room / Apartment</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <HiLocationMarker className="text-gray-400" />
                  City
                </label>
                <select
                  name="city"
                  value={filters.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all"
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <HiLocationMarker className="text-gray-400" />
                  State
                </label>
                <select
                  name="state"
                  value={filters.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all"
                >
                  <option value="">All States</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Sector - With API Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <HiOfficeBuilding className="text-gray-400" />
                  Sector
                </label>
                <select
                  name="sector"
                  value={filters.sector}
                  onChange={handleChange}
                  disabled={loadingSectors}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all disabled:opacity-50"
                >
                  <option value="">All Sectors</option>
                  {loadingSectors ? (
                    <option disabled>Loading sectors...</option>
                  ) : (
                    sectors.map(sector => (
                      <option key={sector._id} value={sector._id}>
                        {sector.name} {sector.description ? `- ${sector.description}` : ''}
                      </option>
                    ))
                  )}
                </select>
                {sectors.length === 0 && !loadingSectors && (
                  <p className="text-xs text-amber-600 mt-1">No sectors available</p>
                )}
              </div>

              {/* Price Range - Min */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <HiCurrencyRupee className="text-gray-400" />
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleChange}
                  placeholder="Minimum price"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all"
                />
              </div>

              {/* Price Range - Max */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <HiCurrencyRupee className="text-gray-400" />
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleChange}
                  placeholder="Maximum price"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all"
                />
              </div>
            </div>

            {/* Active Filters Summary */}
            {getActiveFilterCount() > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Active Filters:</p>
                <div className="flex flex-wrap gap-2">
                  {filters.propertyType && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
                      Type: {filters.propertyType === 'pg' ? 'PG' : 'Room'}
                      <button
                        onClick={() => handleChange({ target: { name: 'propertyType', value: '' } })}
                        className="ml-1 hover:text-red-500"
                      >
                        <HiX className="text-xs" />
                      </button>
                    </span>
                  )}
                  {filters.city && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                      City: {filters.city}
                      <button
                        onClick={() => handleChange({ target: { name: 'city', value: '' } })}
                        className="ml-1 hover:text-red-500"
                      >
                        <HiX className="text-xs" />
                      </button>
                    </span>
                  )}
                  {filters.state && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm">
                      State: {filters.state}
                      <button
                        onClick={() => handleChange({ target: { name: 'state', value: '' } })}
                        className="ml-1 hover:text-red-500"
                      >
                        <HiX className="text-xs" />
                      </button>
                    </span>
                  )}
                  {filters.sector && sectors.find(s => s._id === filters.sector) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm">
                      Sector: {sectors.find(s => s._id === filters.sector)?.name}
                      <button
                        onClick={() => handleChange({ target: { name: 'sector', value: '' } })}
                        className="ml-1 hover:text-red-500"
                      >
                        <HiX className="text-xs" />
                      </button>
                    </span>
                  )}
                  {filters.minPrice && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                      Min: ₹{filters.minPrice}
                      <button
                        onClick={() => handleChange({ target: { name: 'minPrice', value: '' } })}
                        className="ml-1 hover:text-red-500"
                      >
                        <HiX className="text-xs" />
                      </button>
                    </span>
                  )}
                  {filters.maxPrice && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                      Max: ₹{filters.maxPrice}
                      <button
                        onClick={() => handleChange({ target: { name: 'maxPrice', value: '' } })}
                        className="ml-1 hover:text-red-500"
                      >
                        <HiX className="text-xs" />
                      </button>
                    </span>
                  )}
                  {filters.search && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                      Search: {filters.search}
                      <button
                        onClick={() => handleChange({ target: { name: 'search', value: '' } })}
                        className="ml-1 hover:text-red-500"
                      >
                        <HiX className="text-xs" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PropertyFilter;