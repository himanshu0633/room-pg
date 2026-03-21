import React, { useState, useEffect } from 'react';
import { HiCheckCircle, HiXCircle, HiClock, HiEye, HiCurrencyRupee, HiUser, HiHome, 
  HiSearch, HiFilter, HiX, HiRefresh, HiChevronDown, HiChevronUp, HiDocumentText,
  HiCalendar, HiLocationMarker, HiPhone, HiMail } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { userAPI } from '../services/api';
import Navbar from '../components/Navbar';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filteredSaved, setFilteredSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionBooking, setActionBooking] = useState(null);
  const [actionType, setActionType] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterBookings();
    filterSavedProperties();
  }, [searchTerm, statusFilter, bookings, savedProperties]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, savedRes] = await Promise.all([
        userAPI.getAllBookings(),
        userAPI.getAllSavedProperties()
      ]);
      setBookings(bookingsRes.data);
      setFilteredBookings(bookingsRes.data);
      setSavedProperties(savedRes.data);
      setFilteredSaved(savedRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.user?.name?.toLowerCase().includes(searchLower) ||
        booking.user?.email?.toLowerCase().includes(searchLower) ||
        booking.property?.address?.toLowerCase().includes(searchLower) ||
        booking.property?.city?.toLowerCase().includes(searchLower)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    setFilteredBookings(filtered);
  };

  const filterSavedProperties = () => {
    let filtered = [...savedProperties];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(saved => 
        saved.user?.name?.toLowerCase().includes(searchLower) ||
        saved.user?.email?.toLowerCase().includes(searchLower) ||
        saved.property?.address?.toLowerCase().includes(searchLower) ||
        saved.property?.city?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredSaved(filtered);
  };

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await userAPI.updateBookingStatus(bookingId, { status, adminNotes });
      toast.success(`Booking ${status === 'confirmed' ? 'approved' : 'rejected'} successfully`);
      fetchData();
      setShowActionModal(false);
      setAdminNotes('');
      setActionBooking(null);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const openActionModal = (booking, type) => {
    setActionBooking(booking);
    setActionType(type);
    setShowActionModal(true);
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: HiClock, label: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', icon: HiCheckCircle, label: 'Confirmed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: HiXCircle, label: 'Cancelled' },
      rejected: { color: 'bg-gray-100 text-gray-800', icon: HiXCircle, label: 'Rejected' }
    };
    const { color, icon: Icon, label } = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
        <Icon className="text-xs" />
        {label}
      </span>
    );
  };

  const getStats = () => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const rejected = bookings.filter(b => b.status === 'rejected').length;
    return { total, pending, confirmed, rejected };
  };

  const stats = getStats();

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading dashboard data...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 admin-bookings-page">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage bookings and saved properties</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <HiClock className="text-blue-600 text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <HiClock className="text-yellow-600 text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Confirmed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <HiCheckCircle className="text-green-600 text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Saved Properties</p>
                  <p className="text-2xl font-bold text-purple-600">{savedProperties.length}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <HiHome className="text-purple-600 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b flex-wrap">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`pb-3 px-4 flex items-center gap-2 transition-colors ${
                activeTab === 'bookings'
                  ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <HiClock className="text-lg" />
              Bookings ({filteredBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-3 px-4 flex items-center gap-2 transition-colors ${
                activeTab === 'saved'
                  ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <HiHome className="text-lg" />
              Saved Properties ({filteredSaved.length})
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search by user name, email, or property address...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <HiFilter />
                  Filters
                  {statusFilter !== 'all' && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      1
                    </span>
                  )}
                </button>
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <HiRefresh />
                  Refresh
                </button>
              </div>
            </div>
            
            {showFilters && activeTab === 'bookings' && (
              <div className="mt-4 pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'pending', 'confirmed', 'rejected'].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        statusFilter === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {activeTab === 'bookings' ? (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiClock className="text-3xl text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No bookings found</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredBookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                {booking.user?.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{booking.user?.name}</p>
                                <p className="text-xs text-gray-500">{booking.user?.email}</p>
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                  <HiPhone className="text-xs" /> {booking.user?.phone}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{booking.property?.address}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <HiLocationMarker className="text-xs" /> {booking.property?.city}, {booking.property?.state}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm">{booking.duration} {booking.durationType}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(booking.startDate), 'dd MMM')} - {format(new Date(booking.endDate), 'dd MMM yyyy')}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-blue-600">₹{booking.totalAmount?.toLocaleString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(booking.status)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {booking.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => openActionModal(booking, 'confirm')}
                                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all"
                                    title="Approve Booking"
                                  >
                                    <HiCheckCircle className="text-xl" />
                                  </button>
                                  <button
                                    onClick={() => openActionModal(booking, 'reject')}
                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                                    title="Reject Booking"
                                  >
                                    <HiXCircle className="text-xl" />
                                  </button>
                                </>
                              )}
                              {booking.notes && (
                                <button
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowModal(true);
                                  }}
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                                  title="View Notes"
                                >
                                  <HiDocumentText className="text-xl" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {filteredSaved.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiHome className="text-3xl text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No saved properties found</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saved On</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredSaved.map((saved) => (
                        <tr key={saved._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                {saved.user?.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{saved.user?.name}</p>
                                <p className="text-xs text-gray-500">{saved.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{saved.property?.address}</p>
                              <p className="text-xs text-gray-500">₹{saved.property?.mrp?.toLocaleString()}/month</p>
                              <p className="text-xs text-gray-400">{saved.property?.city}, {saved.property?.state}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm">{format(new Date(saved.savedAt), 'dd MMM yyyy')}</p>
                            <p className="text-xs text-gray-500">{format(new Date(saved.savedAt), 'hh:mm a')}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 max-w-xs truncate">
                              {saved.notes || '-'}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fadeInUp">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-white">Booking Details</h3>
                  <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200">
                    <HiX className="text-2xl" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <HiUser className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedBooking.user?.name}</p>
                    <p className="text-sm text-gray-500">{selectedBooking.user?.email}</p>
                    <p className="text-sm text-gray-500">{selectedBooking.user?.phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Property</p>
                  <p className="font-medium">{selectedBooking.property?.address}</p>
                  <p className="text-sm text-gray-500">{selectedBooking.property?.city}, {selectedBooking.property?.state}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{selectedBooking.duration} {selectedBooking.durationType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium text-blue-600">₹{selectedBooking.totalAmount?.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booking Period</p>
                  <p className="font-medium">
                    {format(new Date(selectedBooking.startDate), 'dd MMM yyyy')} - {format(new Date(selectedBooking.endDate), 'dd MMM yyyy')}
                  </p>
                </div>
                {selectedBooking.notes && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">User Notes</p>
                    <p className="text-sm text-gray-700">{selectedBooking.notes}</p>
                  </div>
                )}
                {selectedBooking.adminNotes && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Admin Notes</p>
                    <p className="text-sm text-gray-700">{selectedBooking.adminNotes}</p>
                  </div>
                )}
                <div className="pt-3">
                  {getStatusBadge(selectedBooking.status)}
                </div>
              </div>
              <div className="p-6 pt-0 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Accept/Reject with Notes) */}
      {showActionModal && actionBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowActionModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fadeInUp">
              <div className={`p-6 rounded-t-2xl ${actionType === 'confirm' ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-red-600 to-red-700'}`}>
                <h3 className="text-xl font-bold text-white">
                  {actionType === 'confirm' ? 'Approve Booking' : 'Reject Booking'}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Property: <span className="font-medium">{actionBooking.property?.address}</span></p>
                  <p className="text-sm text-gray-600 mt-1">User: <span className="font-medium">{actionBooking.user?.name}</span></p>
                  <p className="text-sm text-gray-600 mt-1">Duration: <span className="font-medium">{actionBooking.duration} {actionBooking.durationType}</span></p>
                  <p className="text-sm text-gray-600 mt-1">Total: <span className="font-medium text-blue-600">₹{actionBooking.totalAmount?.toLocaleString()}</span></p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes or comments..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(actionBooking._id, actionType === 'confirm' ? 'confirmed' : 'rejected')}
                    className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                      actionType === 'confirm' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {actionType === 'confirm' ? 'Confirm Booking' : 'Reject Booking'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-bookings-page {
          margin-top: 80px;
        }
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

export default AdminBookings;