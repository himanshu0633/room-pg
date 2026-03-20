import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { propertyAPI, sectorAPI } from '../services/api'; // ✅ Dono ko ek saath import karo
import FileUpload from './FileUpload';
import { HiSave, HiX, HiPlus, HiTrash } from 'react-icons/hi';
import SectorModal from '../components/SectorModal';

const PropertyForm = ({ propertyId, initialData = null }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState(null);
  
  const [formData, setFormData] = useState({
    mrp: '',
    security: '',
    area: '',
    propertyType: '',
    sector: '',
    city: '',
    state: '',
    address: '',
    floor: '',
    washrooms: '',
    balcony: '',
    availableFrom: '',
    securityMonths: '',
    furnishingType: '',
    tenantType: '',
    bachelorTypes: [],
    amenities: [],
    features: [],
    propertyStatus: 'active',
    loginRequired: false,
    liftAvailable: false,
    files: [],
  });

  const [newFeature, setNewFeature] = useState('');
  const [newAmenity, setNewAmenity] = useState('');

  // City and State options
  const cityOptions = ['Delhi', 'Jaipur', 'Gurgaon', 'Noida'];
  const stateOptions = ['Rajasthan', 'Haryana', 'Uttar Pradesh', 'Delhi'];

  useEffect(() => {
    fetchSectors();
  }, []);

  useEffect(() => {
    if (initialData) {
      const formattedData = {
        ...initialData,
        availableFrom: initialData.availableFrom 
          ? new Date(initialData.availableFrom).toISOString().split('T')[0]
          : '',
        sector: initialData.sector?._id || initialData.sector || '',
        city: initialData.city || '',
        state: initialData.state || '',
      };
      setFormData(formattedData);
    }
  }, [initialData]);

  const fetchSectors = async () => {
    try {
      console.log('📦 Fetching sectors...'); // Debug log
      const response = await sectorAPI.getAll();
      console.log('✅ Sectors fetched:', response.data); // Debug log
      setSectors(response.data);
    } catch (error) {
      console.error('❌ Error fetching sectors:', error);
      toast.error('Failed to load sectors');
    }
  };

  const handleOpenModal = (sector = null) => {
    console.log('📝 Opening modal with sector:', sector); // Debug log
    setSelectedSector(sector);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('🔒 Closing modal'); // Debug log
    setSelectedSector(null);
    setModalOpen(false);
  };

  const handleSectorSave = async (sectorData) => {
    console.log('💾 Saving sector with data:', sectorData); // Debug log
    console.log('Selected sector:', selectedSector); // Debug log
    
    try {
      let response;
      if (selectedSector) {
        console.log('🔄 Updating sector ID:', selectedSector._id);
        response = await sectorAPI.update(selectedSector._id, sectorData);
        console.log('✅ Update response:', response);
        toast.success('Sector updated successfully');
      } else {
        console.log('➕ Creating new sector');
        response = await sectorAPI.create(sectorData);
        console.log('✅ Create response:', response);
        toast.success('Sector added successfully');
      }
      
      // Refresh sectors list
      await fetchSectors();
      
      // Auto-select the newly added sector if it's a new one
      if (!selectedSector && response?.data) {
        console.log('🎯 Auto-selecting new sector:', response.data._id);
        setFormData(prev => ({
          ...prev,
          sector: response.data._id
        }));
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('❌ Error saving sector:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to save sector');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBachelorTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      bachelorTypes: prev.bachelorTypes.includes(type)
        ? prev.bachelorTypes.filter(t => t !== type)
        : [...prev.bachelorTypes, type]
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (files) => {
    setFormData(prev => ({
      ...prev,
      files: files
    }));
  };

  const removeFile = async (filename) => {
    if (propertyId) {
      try {
        await propertyAPI.deleteFile(propertyId, filename);
        toast.success('File removed successfully');
        setFormData(prev => ({
          ...prev,
          files: prev.files.filter(f => f.filename !== filename)
        }));
      } catch (error) {
        toast.error('Failed to remove file');
      }
    } else {
      setFormData(prev => ({
        ...prev,
        files: prev.files.filter(f => f.name !== filename)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      const jsonData = {
        mrp: formData.mrp ? Number(formData.mrp) : undefined,
        security: formData.security ? Number(formData.security) : undefined,
        area: formData.area ? Number(formData.area) : undefined,
        propertyType: formData.propertyType || undefined,
        sector: formData.sector || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        address: formData.address || undefined,
        floor: formData.floor || undefined,
        washrooms: formData.washrooms || undefined,
        balcony: formData.balcony || undefined,
        availableFrom: formData.availableFrom || undefined,
        securityMonths: formData.securityMonths || undefined,
        furnishingType: formData.furnishingType || undefined,
        tenantType: formData.tenantType || undefined,
        bachelorTypes: formData.bachelorTypes,
        amenities: formData.amenities,
        features: formData.features,
        propertyStatus: formData.propertyStatus,
        loginRequired: formData.loginRequired,
        liftAvailable: formData.liftAvailable,
      };

      Object.keys(jsonData).forEach(key => 
        jsonData[key] === undefined && delete jsonData[key]
      );

      submitData.append('data', JSON.stringify(jsonData));

      if (formData.files && formData.files.length > 0) {
        formData.files.forEach(file => {
          if (file instanceof File) {
            submitData.append('files', file);
          }
        });
      }

      if (propertyId) {
        await propertyAPI.update(propertyId, submitData);
        toast.success('Property updated successfully');
      } else {
        await propertyAPI.create(submitData);
        toast.success('Property created successfully');
      }

      navigate('/admindashboard');
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error(error.response?.data?.message || 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  const activeSectors = sectors.filter(s => s.status === 'active');

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              MRP (₹) *
            </label>
            <input
              type="number"
              name="mrp"
              value={formData.mrp}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Security Amount (₹)
            </label>
            <input
              type="number"
              name="security"
              value={formData.security}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type *
            </label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Type</option>
              <option value="pg">PG</option>
              <option value="room">Room</option>
            </select>
          </div>

          {/* City Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select City</option>
              {cityOptions.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* State Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select State</option>
              {stateOptions.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Sector Dropdown with Add Button */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Sector *
              </label>
              <button
                type="button"
                onClick={() => handleOpenModal()}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <HiPlus className="text-lg" />
                Add New Sector
              </button>
            </div>
            <select
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                {activeSectors.length === 0 
                  ? 'No sectors available - Please add a sector' 
                  : 'Select a sector'}
              </option>
              {activeSectors.map(sector => (
                <option key={sector._id} value={sector._id}>
                  {sector.name} {sector.description ? `- ${sector.description}` : ''}
                </option>
              ))}
            </select>
            {activeSectors.length === 0 && (
              <p className="mt-1 text-sm text-amber-600">
                ⚠️ No active sectors found. Please add a sector first.
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Floor *
            </label>
            <input
              type="text"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              required
              placeholder="e.g., 2nd Floor"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Features & Amenities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Features & Amenities</h2>
        
        {/* Features */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Features
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add a feature"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <HiPlus />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
              >
                {feature}
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <HiTrash className="text-sm" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amenities
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              placeholder="Add an amenity"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addAmenity}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <HiPlus />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.amenities.map((amenity, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => removeAmenity(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <HiTrash className="text-sm" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Availability</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available From *
            </label>
            <input
              type="date"
              name="availableFrom"
              value={formData.availableFrom}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Status
            </label>
            <select
              name="propertyStatus"
              value={formData.propertyStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="deactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="liftAvailable"
              checked={formData.liftAvailable}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Lift Available</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="loginRequired"
              checked={formData.loginRequired}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Login Required to View</span>
          </label>
        </div>
      </div>

      {/* File Upload */}
      <FileUpload
        files={formData.files}
        onFileChange={handleFileChange}
        onRemoveFile={removeFile}
        existingFiles={initialData?.files || []}
      />

      {/* Sector Modal */}
      <SectorModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSectorSave}
        sector={selectedSector}
      />

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate('/admindashboard')}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <HiX />
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiSave />
          {loading ? 'Saving...' : propertyId ? 'Update Property' : 'Create Property'}
        </button>
      </div>
    </form>
  );
};

export default PropertyForm;