import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HiHeart, HiOutlineHeart, HiCalendar, HiLocationMarker, 
  HiCurrencyRupee, HiCheckCircle, HiHome, HiOfficeBuilding,
  HiStar, HiPhone, HiMail, HiClock, HiArrowRight, HiX,
  HiExclamationCircle
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { userAPI } from '../services/api';

const UserPropertyCard = ({ 
  property, 
  onSaveToggle, 
  isSaved: initialIsSaved,
  isLoggedIn: propIsLoggedIn,
  onLoginRequired 
}) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(initialIsSaved || false);
  const [saving, setSaving] = useState(false);
  const [booking, setBooking] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [bookingData, setBookingData] = useState({
    visitDate: '',
    notes: ''
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);

  const baseURL = import.meta.env.VITE_API_URL_IMG || 'http://localhost:4000';

  // Check if user is logged in
  const isLoggedIn = () => {
    if (propIsLoggedIn !== undefined) return propIsLoggedIn;
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user;
  };

  // Get all images from property
  useEffect(() => {
    if (property.files && property.files.length > 0) {
      const imageFiles = property.files.filter(f => f.mimetype?.startsWith('image/'));
      const imageUrls = imageFiles.map(file => {
        const filename = file.path?.split('/').pop() || file.filename;
        return `${baseURL}/uploads/${filename}`;
      });
      setImages(imageUrls);
    }
  }, [property.files, baseURL]);

  // Auto slideshow
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const getCurrentImage = () => {
    if (images.length > 0) return images[currentImageIndex];
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is logged in
    if (!isLoggedIn()) {
      if (onLoginRequired) {
        onLoginRequired('save', property._id);
      } else {
        setPendingAction('save');
        setShowLoginModal(true);
      }
      return;
    }
    
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
    
    // Check if user is logged in
    if (!isLoggedIn()) {
      if (onLoginRequired) {
        onLoginRequired('book', property._id);
      } else {
        setPendingAction('book');
        setShowLoginModal(true);
      }
      return;
    }
    
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

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    setPendingAction(null);
    navigate('/auth');
  };

  const handleCancelLogin = () => {
    setShowLoginModal(false);
    setPendingAction(null);
  };

  const rating = 4.5;
  const reviewCount = 24;
  const isPropertyActive = property.propertyStatus === 'active';

  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section */}
        <div className="relative h-52 overflow-hidden bg-gray-100">
          <img
            src={getCurrentImage()}
            alt={property.address}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
          
          {/* Save Button */}
          <button
            onClick={handleSaveToggle}
            disabled={saving}
            className={`
              absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all z-10
              ${isSaved 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white text-gray-600 hover:text-red-500 hover:bg-gray-50'
              }
              ${saving ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isSaved ? <HiHeart className="text-lg" /> : <HiOutlineHeart className="text-lg" />}
          </button>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className={`
                  absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full 
                  transition-all duration-300 hover:bg-black/70
                  ${isHovered ? 'opacity-100' : 'opacity-0'}
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className={`
                  absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full 
                  transition-all duration-300 hover:bg-black/70
                  ${isHovered ? 'opacity-100' : 'opacity-0'}
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Property Type Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
              property.propertyType === 'pg' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {property.propertyType?.toUpperCase()}
            </span>
          </div>

          {/* Status Badge */}
          {isPropertyActive ? (
            <div className="absolute bottom-3 left-3">
              <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
                <HiCheckCircle className="text-xs" /> Available
              </span>
            </div>
          ) : (
            <div className="absolute bottom-3 left-3">
              <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold shadow-sm">
                Not Available
              </span>
            </div>
          )}

          {/* Rating Badge */}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <HiStar className="text-yellow-400 text-xs" />
            <span>{rating}</span>
            <span className="text-gray-300">({reviewCount})</span>
          </div>

          {/* Dots Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentImageIndex 
                      ? 'w-2 h-2 bg-white' 
                      : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Address */}
          <div className="mb-2">
            <h3 className="text-lg font-bold text-gray-800 line-clamp-1 hover:text-blue-600 transition-colors">
              {property.address}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
              <HiLocationMarker className="text-gray-400 text-xs" />
              <span>{property.city}, {property.state}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-2xl font-bold text-blue-600">₹{property.mrp?.toLocaleString()}</span>
              <span className="text-sm text-gray-500 ml-1">/month</span>
            </div>
            {property.security > 0 && (
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Sec: ₹{property.security?.toLocaleString()}
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded-lg">
              <HiOfficeBuilding className="text-gray-400 text-sm" />
              <span>Floor {property.floor}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded-lg">
              <HiHome className="text-gray-400 text-sm" />
              <span>{property.propertyType?.toUpperCase()}</span>
            </div>
            {property.area && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded-lg">
                <span>📏</span>
                <span>{property.area} sq.ft</span>
              </div>
            )}
            {property.availableFrom && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded-lg">
                <HiCalendar className="text-gray-400 text-sm" />
                <span>{format(new Date(property.availableFrom), 'dd MMM yyyy')}</span>
              </div>
            )}
          </div>

          {/* Features Chips */}
          {property.features && property.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {property.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium"
                >
                  {feature}
                </span>
              ))}
              {property.features.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs font-medium">
                  +{property.features.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <Link
              to={`/properties/${property._id}`}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
            >
              <span>View Details</span>
              <HiArrowRight className="text-sm" />
            </Link>
            <button
              onClick={handleBookNow}
              disabled={!isPropertyActive}
              className={`
                flex-1 px-3 py-2 rounded-lg transition-all text-sm font-medium
                flex items-center justify-center gap-2
                ${isPropertyActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <HiCalendar className="text-sm" />
              <span>Book Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={handleCancelLogin} />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-fadeInUp">
              <div className="p-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiExclamationCircle className="text-4xl text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h3>
                  <p className="text-gray-600 mb-6">
                    You need to be logged in to {pendingAction === 'save' ? 'save this property' : 'book this property'}.
                    Please login to continue.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelLogin}
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

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowBookingModal(false)} />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-fadeInUp">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Book Property</h3>
                    <p className="text-blue-100 text-sm">{property.address}, {property.city}</p>
                  </div>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <HiX className="text-2xl" />
                  </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="p-6">
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Price:</span> ₹{property.mrp?.toLocaleString()}/month
                  </p>
                  {property.security > 0 && (
                    <p className="text-sm text-blue-800 mt-1">
                      <span className="font-semibold">Security:</span> ₹{property.security?.toLocaleString()}
                    </p>
                  )}
                </div>
                
                <form onSubmit={handleBookingSubmit}>
                  <div className="space-y-4">
                    {/* Visit Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <HiCalendar className="inline mr-1 text-gray-400" />
                        Preferred Visit Date
                      </label>
                      <input
                        type="date"
                        value={bookingData.visitDate}
                        onChange={(e) => setBookingData({ ...bookingData, visitDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      <p className="text-xs text-gray-400 mt-1">Optional - We'll contact you to confirm</p>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        value={bookingData.notes}
                        onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                        placeholder="Any specific requirements or questions..."
                        rows="4"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex gap-3 mt-6 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowBookingModal(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={booking}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {booking ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <HiCheckCircle className="text-lg" />
                          <span>Confirm Booking</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
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
      `}</style>
    </>
  );
};

export default UserPropertyCard;