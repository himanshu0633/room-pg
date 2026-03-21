import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiCalendar, HiLocationMarker, HiCurrencyRupee, HiXCircle, 
  HiCheckCircle, HiEye, HiClock, HiHome, HiUser, HiArrowRight,
  HiOfficeBuilding, HiStar, HiFilter, HiOutlineSearch
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { userAPI } from '../services/api';
import Navbar from '../components/Navbar';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'cancelled'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, statusFilter, searchTerm]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getMyBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.property?.address?.toLowerCase().includes(searchLower) ||
        booking.property?.city?.toLowerCase().includes(searchLower) ||
        booking.property?.state?.toLowerCase().includes(searchLower) ||
        booking.property?.sector?.name?.toLowerCase().includes(searchLower) ||
        booking.notes?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await userAPI.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: HiClock, label: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', icon: HiCheckCircle, label: 'Confirmed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: HiXCircle, label: 'Cancelled' }
    };
    const { color, icon: Icon, label } = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
        <Icon className="text-xs" />
        {label}
      </span>
    );
  };

  const getBaseURL = () => {
    return import.meta.env.VITE_API_URL_IMG || 'http://localhost:4000';
  };

  const getImageUrl = (file) => {
    if (!file) return null;
    const filename = file.path?.split('/').pop() || file.filename;
    return `${getBaseURL()}/uploads/${filename}`;
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your bookings...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dashboard-page">
        <div className="container mx-auto px-4 py-4 md:py-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <HiCalendar className="text-xl md:text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  My Bookings
                </h1>
                <p className="text-gray-600 text-sm md:text-base mt-1">View and manage your property bookings</p>
              </div>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12 md:py-20 bg-white rounded-2xl shadow-lg">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiCalendar className="text-3xl md:text-4xl text-gray-400" />
              </div>
              <p className="text-gray-500 text-base md:text-lg mb-2">No bookings found</p>
              <p className="text-gray-400 text-sm md:text-base mb-6">You haven't booked any properties yet</p>
              <Link
                to="/properties"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 md:px-6 py-2.5 md:py-3 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 text-sm md:text-base"
              >
                Browse Properties
                <HiArrowRight />
              </Link>
            </div>
          ) : (
            <>
              {/* Search and Filter Section */}
              <div className="mb-6 md:mb-8">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  {/* Search Bar */}
                  <div className="flex-1 relative">
                    <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm md:text-base" />
                    <input
                      type="text"
                      placeholder="Search by address, city, state..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-sm md:text-base"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <HiXCircle className="text-base md:text-lg" />
                      </button>
                    )}
                  </div>

                  {/* Status Filter Buttons */}
                  <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-4 md:px-6 py-2 md:py-3 rounded-xl text-sm md:text-base font-medium transition-all whitespace-nowrap ${
                        statusFilter === 'all'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      All ({bookings.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('pending')}
                      className={`px-4 md:px-6 py-2 md:py-3 rounded-xl text-sm md:text-base font-medium transition-all whitespace-nowrap ${
                        statusFilter === 'pending'
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      Pending ({pendingCount})
                    </button>
                    <button
                      onClick={() => setStatusFilter('confirmed')}
                      className={`px-4 md:px-6 py-2 md:py-3 rounded-xl text-sm md:text-base font-medium transition-all whitespace-nowrap ${
                        statusFilter === 'confirmed'
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      Confirmed ({confirmedCount})
                    </button>
                    <button
                      onClick={() => setStatusFilter('cancelled')}
                      className={`px-4 md:px-6 py-2 md:py-3 rounded-xl text-sm md:text-base font-medium transition-all whitespace-nowrap ${
                        statusFilter === 'cancelled'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      Cancelled ({cancelledCount})
                    </button>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(searchTerm || statusFilter !== 'all') && (
                  <div className="flex flex-wrap gap-2">
                    {statusFilter !== 'all' && (
                      <button
                        onClick={() => setStatusFilter('all')}
                        className="px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-full text-xs md:text-sm hover:bg-yellow-100 flex items-center gap-1 transition-all"
                      >
                        <span>Status: {statusFilter}</span>
                        <HiXCircle className="text-sm" />
                      </button>
                    )}
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs md:text-sm hover:bg-blue-100 flex items-center gap-1 transition-all"
                      >
                        <span>Search: {searchTerm}</span>
                        <HiXCircle className="text-sm" />
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

              {/* Stats Summary - Responsive Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="bg-white rounded-xl shadow-md p-3 md:p-5 hover:shadow-lg transition-all">
                  <p className="text-gray-500 text-xs md:text-sm">Total Bookings</p>
                  <p className="text-xl md:text-3xl font-bold text-gray-800 mt-1">{bookings.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-3 md:p-5 hover:shadow-lg transition-all">
                  <p className="text-gray-500 text-xs md:text-sm">Pending</p>
                  <p className="text-xl md:text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-3 md:p-5 hover:shadow-lg transition-all">
                  <p className="text-gray-500 text-xs md:text-sm">Confirmed</p>
                  <p className="text-xl md:text-3xl font-bold text-green-600 mt-1">{confirmedCount}</p>
                </div>
              </div>

              {/* Bookings Grid - Responsive */}
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                  <HiCalendar className="text-5xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No bookings match your filters</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredBookings.map((booking) => (
                    <div 
                      key={booking._id} 
                      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {/* Image Section */}
                      <div className="relative h-44 sm:h-52 overflow-hidden bg-gray-100">
                        {booking.property?.files?.length > 0 ? (
                          <img
                            src={getImageUrl(booking.property.files[0])}
                            alt={booking.property.address}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <HiHome className="text-4xl md:text-5xl text-gray-300" />
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          {getStatusBadge(booking.status)}
                        </div>
                        
                        {/* Property Type Badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            booking.property?.propertyType === 'pg' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            <HiOfficeBuilding className="text-xs" />
                            {booking.property?.propertyType?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4 md:p-5">
                        {/* Address */}
                        <div className="mb-3">
                          <h3 className="text-base md:text-lg font-bold text-gray-800 line-clamp-1 hover:text-blue-600 transition-colors">
                            {booking.property?.address}
                          </h3>
                          <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500 mt-1">
                            <HiLocationMarker className="text-gray-400 text-xs md:text-sm" />
                            <span className="truncate">{booking.property?.city}, {booking.property?.state}</span>
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="flex items-baseline justify-between mb-4">
                          <div>
                            <span className="text-xl md:text-2xl font-bold text-blue-600">
                              ₹{booking.property?.mrp?.toLocaleString()}
                            </span>
                            <span className="text-xs md:text-sm text-gray-500 ml-1">/month</span>
                          </div>
                          {booking.property?.security > 0 && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              Sec: ₹{booking.property?.security?.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        {/* Notes */}
                        {booking.notes && (
                          <div className="mb-3 p-2 bg-yellow-50 rounded-lg">
                            <p className="text-xs text-yellow-700 break-words">
                              <span className="font-semibold">📝 Notes:</span> {booking.notes}
                            </p>
                          </div>
                        )}
                        
                        {/* Booking Date */}
                        <div className="mb-4 flex items-center gap-1 text-xs text-gray-400">
                          <HiClock className="text-gray-400" />
                          <span>Booked: {format(new Date(booking.createdAt), 'dd MMM yyyy')}</span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Link
                            to={`/properties/${booking.property?._id}`}
                            className="flex-1 flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all text-xs md:text-sm font-medium"
                          >
                            <HiEye className="text-base md:text-lg" />
                            View
                          </Link>
                          
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 md:px-4 py-2 border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-400 transition-all text-xs md:text-sm font-medium"
                            >
                              <HiXCircle className="text-base md:text-lg" />
                              Cancel
                            </button>
                          )}
                        </div>
                        
                        {/* Status Message for Non-Pending Bookings */}
                        {booking.status !== 'pending' && (
                          <div className={`mt-4 flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {booking.status === 'confirmed' ? (
                              <HiCheckCircle className="text-base md:text-lg" />
                            ) : (
                              <HiXCircle className="text-base md:text-lg" />
                            )}
                            <span>
                              {booking.status === 'confirmed' 
                                ? '✓ Booking Confirmed' 
                                : '✗ Booking Cancelled'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .dashboard-page {
          margin-top: 60px;
        }
        @media (min-width: 768px) {
          .dashboard-page {
            margin-top: 80px;
          }
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .break-words {
          word-break: break-word;
        }
      `}</style>
    </>
  );
};

export default MyBookings;