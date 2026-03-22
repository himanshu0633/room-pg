import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import PropertyForm from '../components/PropertyForm';
import { propertyAPI } from '../services/api';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProperty = useCallback(async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getById(id);
      setProperty(response.data);
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property');
      navigate('/admindashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admindashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4"
        >
          <HiArrowLeft />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Edit Property</h1>
        <p className="text-gray-600 mt-2">Update the property details</p>
      </div>

      {/* Form */}
      <PropertyForm propertyId={id} initialData={property} />
    </div>
  );
};

export default EditProperty;
