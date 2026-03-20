import React from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import PropertyForm from '../components/PropertyForm';

const AddProperty = () => {
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
        <h1 className="text-3xl font-bold text-gray-800">Add New Property</h1>
        <p className="text-gray-600 mt-2">Fill in the details to create a new property listing</p>
      </div>

      {/* Form */}
      <PropertyForm />
    </div>
  );
};

export default AddProperty;