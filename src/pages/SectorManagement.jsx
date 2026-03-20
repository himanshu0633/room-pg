import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { sectorAPI } from '../services/api';
import SectorModal from '../components/SectorModal';
import { HiPlus, HiPencil, HiTrash, HiCheck, HiX } from 'react-icons/hi';

const SectorManagement = () => {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      setLoading(true);
      const response = await sectorAPI.getAll();
      setSectors(response.data);
    } catch (error) {
      console.error('Error fetching sectors:', error);
      toast.error('Failed to load sectors');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (sector = null) => {
    setSelectedSector(sector);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedSector(null);
    setModalOpen(false);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedSector) {
        // Update
        await sectorAPI.update(selectedSector._id, formData);
        toast.success('Sector updated successfully');
      } else {
        // Create
        await sectorAPI.create(formData);
        toast.success('Sector created successfully');
      }
      fetchSectors();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving sector:', error);
      toast.error(error.response?.data?.message || 'Failed to save sector');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await sectorAPI.delete(id);
      toast.success('Sector deleted successfully');
      fetchSectors();
    } catch (error) {
      console.error('Error deleting sector:', error);
      toast.error('Failed to delete sector');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await sectorAPI.toggleStatus(id);
      toast.success(`Sector ${currentStatus === 'active' ? 'deactivated' : 'activated'} successfully`);
      fetchSectors();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to toggle status');
    }
  };

  // Filter sectors based on search
  const filteredSectors = sectors.filter(sector =>
    sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sector.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sector Management</h1>
          <p className="text-gray-600 mt-2">Manage all sectors in one place</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg"
        >
          <HiPlus className="text-xl" />
          <span>Add New Sector</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search sectors by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500 text-sm">Total Sectors</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{sectors.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500 text-sm">Active Sectors</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {sectors.filter(s => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500 text-sm">Inactive Sectors</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {sectors.filter(s => s.status === 'inactive').length}
          </p>
        </div>
      </div>

      {/* Sectors Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S.No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sector Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredSectors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                    {searchTerm ? 'No sectors match your search' : 'No sectors found'}
                  </td>
                </tr>
              ) : (
                filteredSectors.map((sector, index) => (
                  <tr key={sector._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {sector.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {sector.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(sector._id, sector.status)}
                        className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
                          sector.status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {sector.status === 'active' ? (
                          <><HiCheck className="mr-1" /> Active</>
                        ) : (
                          <><HiX className="mr-1" /> Inactive</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sector.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(sector)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Edit"
                      >
                        <HiPencil className="text-xl" />
                      </button>
                      <button
                        onClick={() => handleDelete(sector._id, sector.name)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <HiTrash className="text-xl" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <SectorModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        sector={selectedSector}
      />
    </div>
  );
};

export default SectorManagement;