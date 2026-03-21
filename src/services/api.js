import axios from 'axios';

// Vite uses import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Property APIs
export const propertyAPI = {
  // Get all properties
  getAll: async () => {
    try {
      const response = await api.get('/properties');
      return response.data;
    } catch (error) {
      console.error('API Error - getAll:', error);
      throw error;
    }
  },

  // Get single property
  getById: async (id) => {
    try {
      const response = await api.get(`/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error - getById:', error);
      throw error;
    }
  },

  // Create property with files
  create: async (formData) => {
    try {
      const response = await api.post('/properties', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('API Error - create:', error);
      throw error;
    }
  },

  // Update property with files
  update: async (id, formData) => {
    try {
      const response = await api.put(`/properties/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('API Error - update:', error);
      throw error;
    }
  },

  // Delete property
  delete: async (id) => {
    try {
      const response = await api.delete(`/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error - delete:', error);
      throw error;
    }
  },

  // Delete single file from property
  deleteFile: async (propertyId, filename) => {
    try {
      const response = await api.delete(`/properties/${propertyId}/files/${filename}`);
      return response.data;
    } catch (error) {
      console.error('API Error - deleteFile:', error);
      throw error;
    }
  },
};

// Sector APIs
export const sectorAPI = {
  // Get all sectors
  getAll: async () => {
    const response = await api.get('/sectors');
    return response.data;
  },

  // Get single sector
  getById: async (id) => {
    const response = await api.get(`/sectors/${id}`);
    return response.data;
  },

  // Create sector
  create: async (data) => {
    const response = await api.post('/sectors', data);
    return response.data;
  },

  // Update sector
  update: async (id, data) => {
    const response = await api.put(`/sectors/${id}`, data);
    return response.data;
  },

  // Delete sector
  delete: async (id) => {
    const response = await api.delete(`/sectors/${id}`);
    return response.data;
  },

  // Toggle status
  toggleStatus: async (id) => {
    const response = await api.patch(`/sectors/${id}/toggle`);
    return response.data;
  },
};

// User APIs (for authenticated users)
export const userAPI = {
  // Get all properties for users
  getAllProperties: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/properties?${params.toString()}`);
    return response.data;
  },

  // Get single property
  getPropertyById: async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  // Bookings with duration support
  createBooking: async (data) => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  cancelBooking: async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },

  // Saved Properties
  toggleSaveProperty: async (propertyId, notes = '') => {
    const response = await api.post('/saved-properties', { propertyId, notes });
    return response.data;
  },

  getMySavedProperties: async () => {
    const response = await api.get('/saved-properties/my-saved');
    return response.data;
  },

  checkSavedStatus: async (propertyId) => {
    const response = await api.get(`/saved-properties/check/${propertyId}`);
    return response.data;
  },

  // Admin methods
  getAllBookings: async () => {
    const response = await api.get('/bookings/all');
    return response.data;
  },

  getAllSavedProperties: async () => {
    const response = await api.get('/saved-properties/all');
    return response.data;
  },

  updateBookingStatus: async (bookingId, data) => {
    const response = await api.put(`/bookings/${bookingId}/status`, data);
    return response.data;
  },

  // Get dashboard stats for admin
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};

// Auth APIs
export const authAPI = {
  // Register user
  register: async (formData) => {
    const response = await axios.post(`${API_URL}/auth/register`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Login user
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (data) => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  },

  // Resend OTP
  resendOTP: async (data) => {
    const response = await api.post('/auth/resend-otp', data);
    return response.data;
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authAPI.getCurrentUser();
    return user?.role === 'admin';
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default api;