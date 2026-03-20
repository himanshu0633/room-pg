import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  HiArrowLeft, HiPencil, HiTrash, HiPhotograph, HiDocument, 
  HiCurrencyRupee, HiLocationMarker, HiCalendar, HiUser, 
  HiCheckCircle, HiXCircle, HiOfficeBuilding, HiMap 
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { propertyAPI, sectorAPI } from '../services/api'; // ✅ Import sectorAPI

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [sectorDetails, setSectorDetails] = useState(null);
  const [fetchingSector, setFetchingSector] = useState(false);

  // Get base URL from environment variable
  const baseURL = import.meta.env.VITE_API_URL_IMG || 'http://localhost:4000';

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getById(id);
      setProperty(response.data);
      
      // ✅ Check if sector is an ID (string) or populated object
      if (response.data.sector) {
        if (typeof response.data.sector === 'object' && response.data.sector.name) {
          // Already populated
          setSectorDetails(response.data.sector);
        } else if (typeof response.data.sector === 'string') {
          // Just an ID - fetch details
          fetchSectorDetails(response.data.sector);
        }
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property');
      navigate('/admindashboard');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Function to fetch sector details by ID
  const fetchSectorDetails = async (sectorId) => {
    try {
      setFetchingSector(true);
      const response = await sectorAPI.getById(sectorId);
      setSectorDetails(response.data);
    } catch (error) {
      console.error('Error fetching sector details:', error);
      // Don't show toast error for this, just log it
    } finally {
      setFetchingSector(false);
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
    
    // Extract filename from the full path
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Property not found</p>
          <Link to="/admindashboard" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const images = property.files?.filter(f => f.mimetype?.startsWith('image/')) || [];
  const documents = property.files?.filter(f => !f.mimetype?.startsWith('image/')) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Link
            to="/admindashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4"
          >
            <HiArrowLeft />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Property Details</h1>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/properties/edit/${id}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <HiPencil />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <HiTrash />
            Delete
          </button>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" 
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <img
              src={getImageUrl(selectedImage)}
              alt={selectedImage.originalName}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
              }}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {images.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <HiPhotograph className="text-blue-500" />
                Property Images ({images.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer aspect-square"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={image.originalName}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Error';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">MRP</p>
                <p className="text-lg font-semibold flex items-center gap-1">
                  <HiCurrencyRupee className="text-gray-400" />
                  {property.mrp?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Security</p>
                <p className="text-lg font-semibold flex items-center gap-1">
                  <HiCurrencyRupee className="text-gray-400" />
                  {property.security?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Property Type</p>
                <p className="text-lg font-semibold">{property.propertyType?.toUpperCase() || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Floor</p>
                <p className="text-lg font-semibold">{property.floor || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lift Available</p>
                <p className="text-lg font-semibold">
                  {property.liftAvailable ? (
                    <HiCheckCircle className="text-green-500 inline text-2xl" />
                  ) : (
                    <HiXCircle className="text-red-500 inline text-2xl" />
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Login Required</p>
                <p className="text-lg font-semibold">
                  {property.loginRequired ? (
                    <HiCheckCircle className="text-green-500 inline text-2xl" />
                  ) : (
                    <HiXCircle className="text-red-500 inline text-2xl" />
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Location Information - City, State, Sector */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <HiMap className="text-blue-500" />
              Location Details
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {/* City */}
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="text-lg font-semibold">{property.city || 'N/A'}</p>
              </div>

              {/* State */}
              <div>
                <p className="text-sm text-gray-500">State</p>
                <p className="text-lg font-semibold">{property.state || 'N/A'}</p>
              </div>

              {/* Sector */}
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Sector</p>
                {fetchingSector ? (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-gray-500">Loading sector details...</span>
                  </div>
                ) : sectorDetails ? (
                  <div className="mt-2">
                    <p className="text-lg font-semibold">{sectorDetails.name}</p>
                    {sectorDetails.description && (
                      <p className="text-sm text-gray-600 mt-1">{sectorDetails.description}</p>
                    )}
                    <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                      sectorDetails.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {sectorDetails.status === 'active' ? 'Active Sector' : 'Inactive Sector'}
                    </span>
                  </div>
                ) : (
                  <p className="text-lg font-semibold text-gray-500 mt-2">
                    {property.sector ? `Sector ID: ${property.sector}` : 'N/A'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <HiLocationMarker className="text-blue-500" />
              Full Address
            </h2>
            <p className="text-gray-700">
              {[
                property.address,
                property.city,
                property.state,
                sectorDetails?.name ? sectorDetails.name : null
              ].filter(Boolean).join(', ') || 'N/A'}
            </p>
          </div>

          {/* Features & Amenities */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Features & Amenities</h2>
            
            {property.features?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {property.amenities?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(!property.features?.length && !property.amenities?.length) && (
              <p className="text-gray-500 text-center py-4">No features or amenities added</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Property Type</span>
                {getTypeBadge(property.propertyType)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                {getStatusBadge(property.propertyStatus)}
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <HiCalendar className="text-blue-500" />
              Availability
            </h2>
            <div className="space-y-4">
              {property.availableFrom && (
                <div>
                  <p className="text-sm text-gray-500">Available From</p>
                  <p className="font-semibold">
                    {format(new Date(property.availableFrom), 'dd MMMM yyyy')}
                  </p>
                </div>
              )}
              {property.securityMonths && (
                <div>
                  <p className="text-sm text-gray-500">Security Months</p>
                  <p className="font-semibold">{property.securityMonths} months</p>
                </div>
              )}
              {property.createdAt && (
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(property.createdAt), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              )}
              {property.updatedAt && (
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(property.updatedAt), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Info</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">City:</span>
                <span className="font-medium">{property.city || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">State:</span>
                <span className="font-medium">{property.state || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sector:</span>
                <span className="font-medium">
                  {fetchingSector ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : (
                    sectorDetails?.name || property.sector || 'N/A'
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Floor:</span>
                <span className="font-medium">{property.floor || 'N/A'}</span>
              </div>
              {property.area && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Area:</span>
                  <span className="font-medium">{property.area} sq.ft</span>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          {documents.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
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
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <HiDocument className="text-2xl text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.originalName}</p>
                      <p className="text-sm text-gray-500">
                        {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : 'Size unknown'}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;