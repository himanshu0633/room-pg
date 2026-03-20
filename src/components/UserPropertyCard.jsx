import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiHeart, HiOutlineHeart, HiCalendar, HiLocationMarker, 
  HiCurrencyRupee, HiCheckCircle, HiHome, HiOfficeBuilding 
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { userAPI } from '../services/api';

const UserPropertyCard = ({ property, onSaveToggle, isSaved: initialIsSaved }) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved || false);
  const [saving, setSaving] = useState(false);
  const [booking, setBooking] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    visitDate: '',
    notes: ''
  });

  const baseURL = import.meta.env.VITE_API_URL_IMG || 'http://localhost:4000';

  const getFirstImage = () => {
    if (property.files && property.files.length > 0) {
      const imageFile = property.files.find(f => f.mimetype?.startsWith('image/'));
      if (imageFile) {
        const filename = imageFile.path?.split('/').pop() || imageFile.filename;
        return `${baseURL}/uploads/${filename}`;
      }
    }
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setSaving(true);
      const response = await userAPI.toggleSaveProperty(property._id);
      setIsSaved(response.saved);
      toast.success(response.message);
      if (onSaveToggle) onSaveToggle(property._id, response.saved);
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to save property');
    } finally {
      setSaving(false);
    }
  };

  const handleBookNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setBooking(true);
      await userAPI.createBooking({
        propertyId: property._id,
        visitDate: bookingData.visitDate || undefined,
        notes: bookingData.notes || undefined
      });
      toast.success('Property booked successfully! We will contact you soon.');
      setShowBookingModal(false);
      setBookingData({ visitDate: '', notes: '' });
    } catch (error) {
      console.error('Error booking property:', error);
      toast.error(error.response?.data?.message || 'Failed to book property');
    } finally {
      setBooking(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={getFirstImage()}
            alt={property.address}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
          
          {/* Save Button */}
          <button
            onClick={handleSaveToggle}
            disabled={saving}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all z-10"
          >
            {isSaved ? (
              <HiHeart className="text-red-500 text-xl" />
            ) : (
              <HiOutlineHeart className="text-gray-600 text-xl hover:text-red-500" />
            )}
          </button>

          {/* Property Type Badge */}
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              property.propertyType === 'pg' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {property.propertyType?.toUpperCase()}
            </span>
          </div>

          {/* Status Badge */}
          {property.propertyStatus === 'active' ? (
            <div className="absolute bottom-2 left-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1">
                <HiCheckCircle className="text-xs" /> Available
              </span>
            </div>
          ) : (
            <div className="absolute bottom-2 left-2">
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                Not Available
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
              {property.address}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <HiLocationMarker className="text-gray-400" />
              {property.city}, {property.state}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <HiCurrencyRupee className="text-gray-400" />
              <span className="text-xl font-bold text-blue-600">
                {property.mrp?.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
            {property.security > 0 && (
              <span className="text-xs text-gray-500">
                Security: ₹{property.security?.toLocaleString()}
              </span>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <HiOfficeBuilding className="text-gray-400" />
              <span>Floor: {property.floor}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <HiHome className="text-gray-400" />
              <span>Type: {property.propertyType}</span>
            </div>
            {property.area && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span>📏 {property.area} sq.ft</span>
              </div>
            )}
            {property.availableFrom && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <HiCalendar className="text-gray-400" />
                <span>From: {format(new Date(property.availableFrom), 'dd MMM')}</span>
              </div>
            )}
          </div>

          {/* Features Chips */}
          {property.features && property.features.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {property.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                >
                  {feature}
                </span>
              ))}
              {property.features.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                  +{property.features.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            <Link
              to={`/properties/${property._id}`}
              className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              View Details
            </Link>
            <button
              onClick={handleBookNow}
              disabled={property.propertyStatus !== 'active'}
              className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                property.propertyStatus === 'active'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowBookingModal(false)} />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Book Property</h3>
                <p className="text-sm text-gray-500 mb-4">{property.address}, {property.city}</p>
                
                <form onSubmit={handleBookingSubmit}>
                  <div className="space-y-4">
                    {/* Visit Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Visit Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={bookingData.visitDate}
                        onChange={(e) => setBookingData({ ...bookingData, visitDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        value={bookingData.notes}
                        onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                        placeholder="Any specific requirements or questions..."
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowBookingModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={booking}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {booking ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserPropertyCard;