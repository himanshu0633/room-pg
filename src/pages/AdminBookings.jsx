import React, { useState, useEffect } from 'react';
import { HiCheckCircle, HiXCircle, HiClock, HiEye, HiCurrencyRupee, HiUser, HiHome } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { userAPI } from '../services/api';
import Navbar from '../components/Navbar';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, savedRes] = await Promise.all([
        userAPI.getAllBookings(),
        userAPI.getAllSavedProperties()
      ]);
      setBookings(bookingsRes.data);
      setSavedProperties(savedRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, status, adminNotes = '') => {
    try {
      await userAPI.updateBookingStatus(bookingId, { status, adminNotes });
      toast.success(`Booking ${status} successfully`);
      fetchData();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 admin-bookings-page">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage bookings and saved properties</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 px-4 flex items-center gap-2 transition-colors ${
              activeTab === 'bookings'
                ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <HiClock className="text-lg" />
            Bookings ({bookings.length})
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
            Saved Properties ({savedProperties.length})
          </button>
        </div>

        {activeTab === 'bookings' ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <HiUser className="text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{booking.user?.name}</p>
                            <p className="text-xs text-gray-500">{booking.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{booking.property?.address}</p>
                          <p className="text-xs text-gray-500">{booking.property?.city}</p>
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
                        {booking.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                              className="text-green-600 hover:text-green-800"
                              title="Accept"
                            >
                              <HiCheckCircle className="text-xl" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(booking._id, 'rejected')}
                              className="text-red-600 hover:text-red-800"
                              title="Reject"
                            >
                              <HiXCircle className="text-xl" />
                            </button>
                          </div>
                        )}
                        {booking.notes && (
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Notes
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
                  {savedProperties.map((saved) => (
                    <tr key={saved._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <HiUser className="text-gray-400" />
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
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm">{format(new Date(saved.savedAt), 'dd MMM yyyy')}</p>
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
          </div>
        )}
      </div>

      {/* Modal for Booking Details */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h3>
                <div className="space-y-3">
                  <p><strong>User:</strong> {selectedBooking.user?.name}</p>
                  <p><strong>Property:</strong> {selectedBooking.property?.address}</p>
                  <p><strong>Duration:</strong> {selectedBooking.duration} {selectedBooking.durationType}</p>
                  <p><strong>Dates:</strong> {format(new Date(selectedBooking.startDate), 'dd MMM yyyy')} - {format(new Date(selectedBooking.endDate), 'dd MMM yyyy')}</p>
                  <p><strong>Total Amount:</strong> ₹{selectedBooking.totalAmount?.toLocaleString()}</p>
                  <p><strong>Notes:</strong> {selectedBooking.notes}</p>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Close
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
      `}</style>
    </>
  );
};

export default AdminBookings;