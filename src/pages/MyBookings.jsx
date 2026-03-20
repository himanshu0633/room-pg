import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiCalendar, HiLocationMarker, HiCurrencyRupee, HiXCircle, HiCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { userAPI } from '../services/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

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

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
        <p className="text-gray-600 mt-2">View and manage your property bookings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-md">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiCalendar className="text-4xl text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg mb-4">No bookings found</p>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all">
              <div className="relative h-48">
                {booking.property?.files?.length > 0 && (
                  <img
                    src={`http://localhost:4000/uploads/${booking.property.files[0].filename}`}
                    alt={booking.property.address}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(booking.status)}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {booking.property?.address}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                  <HiLocationMarker className="text-gray-400" />
                  {booking.property?.city}, {booking.property?.state}
                </p>
                <p className="text-lg font-bold text-blue-600 mb-2">
                  ₹{booking.property?.mrp?.toLocaleString()}/month
                </p>
                {booking.visitDate && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Visit Date:</span> {format(new Date(booking.visitDate), 'dd MMM yyyy')}
                  </p>
                )}
                {booking.notes && (
                  <p className="text-sm text-gray-500 mb-3">
                    <span className="font-medium">Notes:</span> {booking.notes}
                  </p>
                )}
                <p className="text-xs text-gray-400 mb-3">
                  Booked on: {format(new Date(booking.createdAt), 'dd MMM yyyy, hh:mm a')}
                </p>
                
                {booking.status === 'pending' && (
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <HiXCircle />
                    Cancel Booking
                  </button>
                )}
                
                {booking.status === 'confirmed' && (
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg">
                    <HiCheckCircle />
                    Booking Confirmed
                  </div>
                )}
                
                {booking.status === 'cancelled' && (
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg">
                    <HiXCircle />
                    Booking Cancelled
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
