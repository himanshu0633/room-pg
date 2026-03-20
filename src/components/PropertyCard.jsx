import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiPencil, HiTrash, HiEye, HiLocationMarker, HiCurrencyRupee, HiCalendar } from 'react-icons/hi';
import { format } from 'date-fns';

const PropertyCard = ({ property, onDelete }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  
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
    if (images.length <= 1) return; // Don't run slideshow if 0 or 1 images
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); 

    return () => clearInterval(interval); // Cleanup on unmount
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

  // Go to next image manually
  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  // Go to previous image manually
  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image with Slideshow */}
      <div className="relative h-48 overflow-hidden group">
        <img
          src={getCurrentImage()}
          alt={property.address}
          className="w-full h-full object-cover transition-opacity duration-500"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />

        {/* Image Counter (only show if multiple images) */}
        {images.length > 1 && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}

        {/* Navigation Arrows (only show if multiple images and hover) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Status Badges */}
        <div className="absolute top-2 right-2 flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(property.propertyStatus)}`}>
            {property.propertyStatus || 'Unknown'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(property.propertyType)}`}>
            {property.propertyType?.toUpperCase()}
          </span>
        </div>

        {/* Dots Indicator (only show if multiple images) */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'bg-white w-3' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {property.address}
          </h3>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <HiCurrencyRupee className="text-gray-400" />
            <span>MRP: ₹{property.mrp?.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <HiLocationMarker className="text-gray-400" />
            <span>Floor: {property.floor}</span>
          </div>

          <div className="flex items-center gap-2">
            <HiCalendar className="text-gray-400" />
            <span>Available: {property.availableFrom ? format(new Date(property.availableFrom), 'dd MMM yyyy') : 'N/A'}</span>
          </div>

          {/* <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
              Area: {property.area} sq.ft
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
              Washrooms: {property.washrooms}
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
              Balcony: {property.balcony}
            </span>
          </div> */}

          {property.files && (
            <p className="text-xs text-gray-500 mt-2">
              📎 {property.files.length} file(s) attached
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
          <Link
            to={`/properties/${property._id}`}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="View Details"
          >
            <HiEye className="text-xl" />
          </Link>
          <Link
            to={`/properties/edit/${property._id}`}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
            title="Edit"
          >
            <HiPencil className="text-xl" />
          </Link>
          <button
            onClick={() => onDelete(property._id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Delete"
          >
            <HiTrash className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;