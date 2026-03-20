import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiHeart, HiLocationMarker, HiCurrencyRupee, HiCalendar } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { userAPI } from '../services/api';

const SavedProperties = () => {
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedProperties();
  }, []);

  const fetchSavedProperties = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getMySavedProperties();
      setSavedProperties(response.data);
    } catch (error) {
      console.error('Error fetching saved properties:', error);
      toast.error('Failed to load saved properties');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSave = async (propertyId) => {
    try {
      await userAPI.toggleSaveProperty(propertyId);
      toast.success('Removed from saved list');
      fetchSavedProperties();
    } catch (error) {
      console.error('Error removing saved property:', error);
      toast.error('Failed to remove property');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Saved Properties</h1>
        <p className="text-gray-600 mt-2">Your favorite properties collection</p>
      </div>

      {savedProperties.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-md">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiHeart className="text-4xl text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg mb-4">No saved properties yet</p>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProperties.map((item) => (
            <div key={item._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all">
              <div className="relative h-48">
                {item.property?.files?.length > 0 && (
                  <img
                    src={`http://localhost:4000/uploads/${item.property.files[0].filename}`}
                    alt={item.property.address}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                )}
                <button
                  onClick={() => handleRemoveSave(item.property._id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <HiHeart className="text-red-500 text-xl" />
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {item.property?.address}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                  <HiLocationMarker className="text-gray-400" />
                  {item.property?.city}, {item.property?.state}
                </p>
                <p className="text-lg font-bold text-blue-600 mb-2">
                  ₹{item.property?.mrp?.toLocaleString()}/month
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  Saved on: {format(new Date(item.savedAt), 'dd MMM yyyy')}
                </p>
                
                <div className="flex gap-2">
                  <Link
                    to={`/properties/${item.property._id}`}
                    className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedProperties;