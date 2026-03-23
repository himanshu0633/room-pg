import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { sectorAPI } from '../services/api';
import SectorModal from '../components/SectorModal';
import { HiPlus, HiPencil, HiTrash, HiCheck, HiX, HiOutlineSearch, HiFilter } from 'react-icons/hi';
import Navbar from '../components/Navbar';

const SectorManagement = () => {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

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

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  // Filter sectors based on search and status
  const filteredSectors = sectors.filter(sector => {
    const matchesSearch = sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sector.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sector.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const activeCount = sectors.filter(s => s.status === 'active').length;
  const inactiveCount = sectors.filter(s => s.status === 'inactive').length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dashboard-page">
        <div className="container mx-auto px-4 py-4 md:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Sector Management
              </h1>
              <p className="text-gray-600 text-sm md:text-base mt-1">Manage all sectors in one place</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
            >
              <HiPlus className="text-lg md:text-xl" />
              <span>Add New Sector</span>
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm md:text-base" />
                <input
                  type="text"
                  placeholder="Search sectors by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-sm md:text-base"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <HiX className="text-base md:text-lg" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-xl text-sm md:text-base font-medium transition-all ${
                    statusFilter === 'all'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-xl text-sm md:text-base font-medium transition-all ${
                    statusFilter === 'active'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-xl text-sm md:text-base font-medium transition-all ${
                    statusFilter === 'inactive'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || statusFilter !== 'all') && (
              <div className="flex flex-wrap gap-2 mt-3">
                {statusFilter !== 'all' && (
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs md:text-sm hover:bg-green-100 flex items-center gap-1 transition-all"
                  >
                    <span>Status: {statusFilter}</span>
                    <HiX className="text-sm" />
                  </button>
                )}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs md:text-sm hover:bg-blue-100 flex items-center gap-1 transition-all"
                  >
                    <span>Search: {searchTerm}</span>
                    <HiX className="text-sm" />
                  </button>
                )}
                {(searchTerm || statusFilter !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs md:text-sm hover:bg-red-100 flex items-center gap-1 transition-all"
                  >
                    Clear All
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Stats Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-white rounded-xl shadow-md p-3 md:p-5 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs md:text-sm">Total Sectors</p>
                  <p className="text-xl md:text-3xl font-bold text-gray-800 mt-1">{sectors.length}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 md:p-3 rounded-xl">
                  <HiFilter className="text-lg md:text-2xl text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-3 md:p-5 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs md:text-sm">Active Sectors</p>
                  <p className="text-xl md:text-3xl font-bold text-green-600 mt-1">{activeCount}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 md:p-3 rounded-xl">
                  <HiCheck className="text-lg md:text-2xl text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-3 md:p-5 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs md:text-sm">Inactive Sectors</p>
                  <p className="text-xl md:text-3xl font-bold text-red-600 mt-1">{inactiveCount}</p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 md:p-3 rounded-xl">
                  <HiX className="text-lg md:text-2xl text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Sectors Table/Cards */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
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
                        {searchTerm || statusFilter !== 'all' 
                          ? 'No sectors match your filters' 
                          : 'No sectors found'}
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
                            className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                              sector.status === 'active'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {sector.status === 'active' ? (
                              <><HiCheck className="mr-1 text-sm" /> Active</>
                            ) : (
                              <><HiX className="mr-1 text-sm" /> Inactive</>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(sector.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOpenModal(sector)}
                            className="text-blue-600 hover:text-blue-900 mr-3 transition-colors"
                            title="Edit"
                          >
                            <HiPencil className="text-lg md:text-xl" />
                          </button>
                          <button
                            onClick={() => handleDelete(sector._id, sector.name)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete"
                          >
                            <HiTrash className="text-lg md:text-xl" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredSectors.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No sectors match your filters' 
                    : 'No sectors found'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredSectors.map((sector) => (
                    <div key={sector._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900">{sector.name}</h3>
                          {sector.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{sector.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-3">
                          <button
                            onClick={() => handleOpenModal(sector)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Edit"
                          >
                            <HiPencil className="text-lg" />
                          </button>
                          <button
                            onClick={() => handleDelete(sector._id, sector.name)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete"
                          >
                            <HiTrash className="text-lg" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Status:</span>
                          <button
                            onClick={() => handleToggleStatus(sector._id, sector.status)}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all ${
                              sector.status === 'active'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {sector.status === 'active' ? (
                              <><HiCheck className="mr-1 text-xs" /> Active</>
                            ) : (
                              <><HiX className="mr-1 text-xs" /> Inactive</>
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Created:</span>
                          <span className="text-gray-700">{new Date(sector.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal */}
          <SectorModal
            key={`${selectedSector?._id || 'new'}-${modalOpen ? 'open' : 'closed'}`}
            isOpen={modalOpen}
            onClose={handleCloseModal}
            onSave={handleSave}
            sector={selectedSector}
          />
        </div>
      </div>
    </>
  );
};

export default SectorManagement;
