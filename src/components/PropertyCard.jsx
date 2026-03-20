import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiPencil, HiTrash, HiEye, HiLocationMarker, HiCurrencyRupee, 
  HiCalendar, HiHeart, HiOutlineHeart, HiStar, HiHome, HiOfficeBuilding 
} from 'react-icons/hi';
import { format } from 'date-fns';

const PropertyCard = ({ property, onDelete, isSaved: initialIsSaved, onSaveToggle }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(initialIsSaved || false);
  const [saving, setSaving] = useState(false);
  
  // Get all images from property files
  useEffect(() => {
    if (property.files && property.files.length > 0) {
      const imageFiles = property.files.filter(f => f.mimetype?.startsWith('image/'));
      
      const imageUrls = imageFiles.map(file => {
        const filename = file.path.split('/').pop();
        const baseURL = import.meta.env.VITE_API_URL_IMG || 'http://localhost:4000';
        return `${baseURL}/uploads/${filename}`;
      });
      
      setImages(imageUrls);
    }
  }, [property.files]);

  // Slideshow effect - change image every 2 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); 

    return () => clearInterval(interval);
  }, [images.length]);

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getTypeColor = (type) => {
    return type === 'pg' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  const getCurrentImage = () => {
    if (images.length > 0) {
      return images[currentImageIndex];
    }
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onSaveToggle) {
      setSaving(true);
      try {
        await onSaveToggle(property._id, !isSaved);
        setIsSaved(!isSaved);
      } finally {
        setSaving(false);
      }
    }
  };

  // Calculate rating (mock data - can be replaced with actual ratings)
  const rating = 4.5;
  const reviewCount = 24;

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image with Slideshow */}
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <img
          src={getCurrentImage()}
          alt={property.address}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />

        {/* Save Button Overlay */}
        {onSaveToggle && (
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
            {isSaved ? (
              <HiHeart className="text-lg" />
            ) : (
              <HiOutlineHeart className="text-lg" />
            )}
          </button>
        )}

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

        {/* Status Badges */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(property.propertyStatus)}`}>
            {property.propertyStatus === 'active' ? '● Available' : '○ Inactive'}
          </span>
        </div>
        
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${getTypeColor(property.propertyType)}`}>
            {property.propertyType?.toUpperCase()}
          </span>
        </div>

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

        {/* Features Grid */}
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
              <span>{format(new Date(property.availableFrom), 'dd MMM')}</span>
            </div>
          )}
        </div>

        {/* Features Chips */}
        {property.features && property.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
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
                +{property.features.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* File Count */}
        {property.files && property.files.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
            <span>📎</span>
            <span>{property.files.length} attachment(s)</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <Link
            to={`/properties/${property._id}`}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium mr-2"
          >
            <HiEye className="text-lg" />
            <span>View</span>
          </Link>
          <Link
            to={`/properties/edit/${property._id}`}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-sm font-medium mr-2"
          >
            <HiPencil className="text-lg" />
            <span>Edit</span>
          </Link>
          <button
            onClick={() => onDelete(property._id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm font-medium"
          >
            <HiTrash className="text-lg" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;