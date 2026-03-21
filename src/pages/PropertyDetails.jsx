import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  HiArrowLeft, HiPencil, HiTrash, HiPhotograph, HiDocument, 
  HiCurrencyRupee, HiLocationMarker, HiCalendar, HiUser, 
  HiCheckCircle, HiXCircle, HiOfficeBuilding, HiMap, 
  HiHeart, HiOutlineHeart, HiBookmark, HiCalendar as HiCalendarIcon,
  HiStar, HiShare, HiExternalLink, HiPhone, HiMail, HiClock, HiLockClosed,
  HiExclamationCircle, HiRefresh
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { propertyAPI, sectorAPI, userAPI } from '../services/api';
import Navbar from '../components/Navbar';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [sectorDetails, setSectorDetails] = useState(null);
  const [fetchingSector, setFetchingSector] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // User related states
  const [currentUser, setCurrentUser] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [booking, setBooking] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [bookingData, setBookingData] = useState({
    visitDate: '',
    notes: ''
  });

  const baseURL = import.meta.env.VITE_API_URL_IMG || 'http://localhost:4000';

  // Check if user is logged in
  const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user;
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (property && currentUser && currentUser.role !== 'admin') {
      checkSavedStatus();
    }
  }, [property, currentUser]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getById(id);
      setProperty(response.data);
      
      if (response.data.sector) {
        if (typeof response.data.sector === 'object' && response.data.sector.name) {
          setSectorDetails(response.data.sector);
        } else if (typeof response.data.sector === 'string') {
          fetchSectorDetails(response.data.sector);
        }
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      navigate(user.role === 'admin' ? '/admindashboard' : '/properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchSectorDetails = async (sectorId) => {
    try {
      setFetchingSector(true);
      const response = await sectorAPI.getById(sectorId);
      setSectorDetails(response.data);
    } catch (error) {
      console.error('Error fetching sector details:', error);
    } finally {
      setFetchingSector(false);
    }
  };

  const checkSavedStatus = async () => {
    try {
      const response = await userAPI.checkSavedStatus(id);
      setIsSaved(response.saved);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleLoginRequired = (action) => {
    setPendingAction(action);
    setShowLoginModal(true);
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

  const handleSaveToggle = async () => {
    if (!isLoggedIn()) {
      handleLoginRequired('save');
      return;
    }

    setSaving(true);
    try {
      const response = await userAPI.toggleSaveProperty(id);
      setIsSaved(response.saved);
      toast.success(response.message);
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error(error.response?.data?.message || 'Failed to save property');
    } finally {
      setSaving(false);
    }
  };

  const handleBookNow = () => {
    if (!isLoggedIn()) {
      handleLoginRequired('book');
      return;
    }
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBooking(true);
    try {
      await userAPI.createBooking({
        propertyId: id,
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await propertyAPI.delete(id);
      toast.success('Property deleted successfully');
      navigate('/admindashboard');
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  const getImageUrl = (file) => {
    if (!file) return 'https://via.placeholder.com/400x300?text=No+Image';
    const filename = file.path?.split('/').pop() || file.filename;
    return `${baseURL}/uploads/${filename}`;
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      deactive: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const colors = {
      pg: 'bg-purple-100 text-purple-800',
      room: 'bg-blue-100 text-blue-800',
      '1bhk': 'bg-green-100 text-green-800',
      '2bhk': 'bg-yellow-100 text-yellow-800',
      '3bhk': 'bg-orange-100 text-orange-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {type?.toUpperCase()}
      </span>
    );
  };

  const getBackPath = () => {
    if (currentUser?.role === 'admin') return '/admindashboard';
    return '/properties';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading property details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiXCircle className="text-4xl text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Property Not Found</h2>
            <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
            <Link to={getBackPath()} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
              <HiArrowLeft /> Back to Dashboard
            </Link>
          </div>
        </div>
      </>
    );
  }

  const images = property.files?.filter(f => f.mimetype?.startsWith('image/')) || [];
  const documents = property.files?.filter(f => !f.mimetype?.startsWith('image/')) || [];
  const isAdmin = currentUser?.role === 'admin';
  const isUser = currentUser?.role === 'user';
  const isPropertyActive = property.propertyStatus === 'active';

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 pb-8">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Header with Breadcrumb */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Link
                  to={getBackPath()}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
                >
                  <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                  <span>Back</span>
                </Link>
                <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
                <div className="flex items-center gap-2">
                  {getTypeBadge(property.propertyType)}
                  {getStatusBadge(property.propertyStatus)}
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                {isAdmin ? (
                  <>
                    <Link
                      to={`/properties/edit/${id}`}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                      <HiPencil /> Edit
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                    >
                      <HiTrash /> Delete
                    </button>
                  </>
                ) : isUser && (
                  <>
                    <button
                      onClick={handleSaveToggle}
                      disabled={saving}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        isSaved 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isSaved ? <HiHeart className="text-xl" /> : <HiOutlineHeart className="text-xl" />}
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>
                    
                    {isPropertyActive ? (
                      <button
                        onClick={handleBookNow}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                      >
                        <HiCalendarIcon /> Book Now
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                      >
                        <HiCalendarIcon /> Not Available
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Layout: Image Left | Content Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image Gallery */}
            <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] overflow-y-auto">
              {images.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Main Image */}
                  <div className="relative bg-gray-900 aspect-square md:aspect-[4/3]">
                    <img
                      src={getImageUrl(images[currentImageIndex])}
                      alt={property.address}
                      className="w-full h-full object-contain cursor-pointer"
                      onClick={() => setSelectedImage(images[currentImageIndex])}
                    />
                    
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                    
                    {images.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div className="flex gap-2 p-4 bg-gray-100 overflow-x-auto">
                      {images.map((image, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            idx === currentImageIndex ? 'border-blue-600' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={getImageUrl(image)}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <HiPhotograph className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No images available</p>
                </div>
              )}
            </div>

            {/* Right Column - All Information */}
            <div className="space-y-6">
              {/* Title & Price */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{property.address}</h1>
                    <div className="flex items-center gap-2 text-gray-500 flex-wrap">
                      <HiLocationMarker className="text-gray-400" />
                      <span>{property.city}, {property.state}</span>
                      {sectorDetails?.name && (
                        <>
                          <span>•</span>
                          <span>Sector {sectorDetails.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-3xl md:text-4xl font-bold text-blue-600">
                      ₹{property.mrp?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">/ month</p>
                  </div>
                </div>
              </div>

              {/* Key Features Grid */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <HiStar className="text-blue-500" />
                  Key Features
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <HiCurrencyRupee className="text-blue-500 text-xl" />
                    <div>
                      <p className="text-xs text-gray-500">Security</p>
                      <p className="font-semibold">₹{property.security?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <HiOfficeBuilding className="text-blue-500 text-xl" />
                    <div>
                      <p className="text-xs text-gray-500">Floor</p>
                      <p className="font-semibold">{property.floor || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <HiCheckCircle className="text-blue-500 text-xl" />
                    <div>
                      <p className="text-xs text-gray-500">Lift</p>
                      <p className="font-semibold">{property.liftAvailable ? 'Available' : 'Not Available'}</p>
                    </div>
                  </div>
                  {/* <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <HiLockClosed className="text-blue-500 text-xl" />
                    <div>
                      <p className="text-xs text-gray-500">Login Required</p>
                      <p className="font-semibold">{property.loginRequired ? 'Yes' : 'No'}</p>
                    </div>
                  </div> */}
                </div>
              </div>

              {/* Location Details */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <HiMap className="text-blue-500" />
                  Location Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">City</p>
                    <p className="font-semibold text-lg">{property.city || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">State</p>
                    <p className="font-semibold text-lg">{property.state || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Sector</p>
                    {fetchingSector ? (
                      <div className="animate-pulse h-6 w-24 bg-gray-200 rounded"></div>
                    ) : sectorDetails ? (
                      <div>
                        <p className="font-semibold text-lg">{sectorDetails.name}</p>
                        {sectorDetails.description && (
                          <p className="text-xs text-gray-500 mt-1">{sectorDetails.description}</p>
                        )}
                      </div>
                    ) : (
                      <p className="font-semibold text-lg">{property.sector || 'N/A'}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Full Address</p>
                  <p className="text-gray-700">
                    {[
                      property.address,
                      property.city,
                      property.state,
                      sectorDetails?.name ? `Sector ${sectorDetails.name}` : null
                    ].filter(Boolean).join(', ') || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Features & Amenities */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Features & Amenities</h2>
                
                {property.features?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {property.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {property.amenities?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(!property.features?.length && !property.amenities?.length) && (
                  <p className="text-gray-500 text-center py-8">No features or amenities added</p>
                )}
              </div>

              {/* Quick Info Card - Moved to Right Column for Desktop */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Info</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Property Type</span>
                    {getTypeBadge(property.propertyType)}
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Status</span>
                    {getStatusBadge(property.propertyStatus)}
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Floor</span>
                    <span className="font-medium">{property.floor || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">City</span>
                    <span className="font-medium">{property.city || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">State</span>
                    <span className="font-medium">{property.state || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Sector</span>
                    <span className="font-medium">
                      {sectorDetails?.name || property.sector || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Availability Section */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <HiCalendar className="text-blue-500" />
                    Availability
                  </h3>
                  {property.availableFrom && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-500">Available From</p>
                      <p className="font-medium">{format(new Date(property.availableFrom), 'dd MMMM yyyy')}</p>
                    </div>
                  )}
                  {property.securityMonths && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-500">Security Months</p>
                      <p className="font-medium">{property.securityMonths} months</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              {documents.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <HiDocument className="text-blue-500" />
                    Documents ({documents.length})
                  </h2>
                  <div className="space-y-3">
                    {documents.map((doc, index) => (
                      <a
                        key={index}
                        href={getImageUrl(doc)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all group"
                      >
                        <HiDocument className="text-2xl text-gray-400 group-hover:text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{doc.originalName}</p>
                          <p className="text-xs text-gray-500">
                            {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : 'Size unknown'}
                          </p>
                        </div>
                        <HiExternalLink className="text-gray-400 group-hover:text-blue-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Property Timeline */}
              {/* {(property.createdAt || property.updatedAt) && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <HiClock className="text-blue-600 text-xl" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Property Timeline</h2>
                  </div>
                  
                  <div className="relative pl-4 border-l-2 border-gray-200 ml-3">
                    {property.createdAt && (
                      <div className="mb-6 relative">
                        <div className="absolute -left-[1.65rem] top-0 w-3 h-3 bg-green-500 rounded-full ring-4 ring-white"></div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <HiCheckCircle className="text-green-600" />
                            <span className="text-sm font-semibold text-green-700">Listed</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {format(new Date(property.createdAt), 'dd MMMM yyyy, hh:mm a')}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {property.updatedAt && property.updatedAt !== property.createdAt && (
                      <div className="relative">
                        <div className="absolute -left-[1.65rem] top-0 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-white"></div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <HiRefresh className="text-blue-600" />
                            <span className="text-sm font-semibold text-blue-700">Last Updated</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {format(new Date(property.updatedAt), 'dd MMMM yyyy, hh:mm a')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* Fullscreen Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" 
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-6xl max-h-[90vh]">
              <img
                src={getImageUrl(selectedImage)}
                alt={selectedImage.originalName}
                className="max-w-full max-h-[90vh] object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 bg-black bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center"
              >
                ×
              </button>
            </div>
          </div>
        )}

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
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleLoginRedirect}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowBookingModal(false)} />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full animate-slideUp">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">Book Property</h3>
                    <button
                      onClick={() => setShowBookingModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <HiXCircle className="text-2xl" />
                    </button>
                  </div>
                  <p className="text-gray-600 mb-4 pb-4 border-b">
                    {property.address}, {property.city}
                  </p>
                  
                  <form onSubmit={handleBookingSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Visit Date
                        </label>
                        <input
                          type="date"
                          value={bookingData.visitDate}
                          onChange={(e) => setBookingData({ ...bookingData, visitDate: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Additional Notes
                        </label>
                        <textarea
                          value={bookingData.notes}
                          onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                          placeholder="Any specific requirements or questions..."
                          rows="4"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setShowBookingModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={booking}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slideUp {
            animation: slideUp 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </>
  );
};

export default PropertyDetails;