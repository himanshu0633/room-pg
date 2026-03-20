import React from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import { HiRefresh } from 'react-icons/hi';

const PropertyList = ({ properties, loading, onDelete, onRefresh }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg mb-4">No properties found</p>
        <Link
          to="/properties/add"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Add Your First Property
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <p className="text-gray-600">Showing {properties.length} properties</p>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <HiRefresh className="text-xl" />
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {properties.map((property) => (
          <PropertyCard
            key={property._id}
            property={property}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default PropertyList;