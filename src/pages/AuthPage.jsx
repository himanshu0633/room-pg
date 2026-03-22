import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { 
  HiMail, HiLockClosed, HiUser, HiPhone, HiPhotograph, 
  HiEye, HiEyeOff, HiArrowRight, HiCheckCircle, HiXCircle 
} from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaTwitter } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import OTPVerification from '../components/OTPVerification';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showOTP, setShowOTP] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  // Form states
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e, isLoginForm) => {
    const { name, value } = e.target;
    if (isLoginForm) {
      setLoginData(prev => ({ ...prev, [name]: value }));
    } else {
      setRegisterData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate register form
  const validateRegister = () => {
    const newErrors = {};

    if (!registerData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (registerData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (registerData.name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    if (!registerData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!registerData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(registerData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!registerData.password) {
      newErrors.password = 'Password is required';
    } else if (registerData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (registerData.password.length > 100) {
      newErrors.password = 'Password must be less than 100 characters';
    }

    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate login form
  const validateLogin = () => {
    const newErrors = {};

    if (!loginData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login submit
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setLoading(true);
    try {
      const response = await authAPI.login(loginData);
      
      if (!response.token) {
        throw new Error('No token received');
      }
      
      toast.success('Login successful!');
      
      // Store user data in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirect based on role
      if (response.user.role === 'admin') {
        navigate('/admindashboard');
      } else {
        navigate('/properties');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle register submit
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', registerData.name);
      formData.append('email', registerData.email);
      formData.append('phone', registerData.phone);
      formData.append('password', registerData.password);
      if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto);
      }

      const response = await authAPI.register(formData);
      setUserEmail(registerData.email);
      setUserId(response.userId);
      setShowOTP(true);
      toast.success('Registration successful! Please verify OTP.');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification success
  const handleOTPSuccess = () => {
    setShowOTP(false);
    setIsLogin(true);
    toast.success('Email verified! Please login.');
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 }
  };

  if (showOTP) {
    return (
      <OTPVerification 
        email={userEmail}
        userId={userId}
        onSuccess={handleOTPSuccess}
        onCancel={() => setShowOTP(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="container max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Branding/Image */}
            <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-white rounded-full opacity-10"></div>
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white rounded-full opacity-10"></div>
              
              <div className="relative z-10">
                <div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                    {isLogin ? 'Welcome Back!' : 'Join Us Today!'}
                  </h1>
                  <p className="text-base md:text-xl opacity-90 mb-6 md:mb-8">
                    {isLogin 
                      ? 'Sign in to access your account and manage your properties'
                      : 'Create an account to start your property journey'}
                  </p>
                </div>

                <div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3 md:space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <HiCheckCircle className="text-lg md:text-xl" />
                    </div>
                    <span className="text-sm md:text-base">Find your perfect property</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <HiCheckCircle className="text-lg md:text-xl" />
                    </div>
                    <span className="text-sm md:text-base">Save and book properties</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <HiCheckCircle className="text-lg md:text-xl" />
                    </div>
                    <span className="text-sm md:text-base">Get instant notifications</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-8 md:mt-12">
                <p className="text-xs md:text-sm opacity-80">
                  © 2026 PropertyFinder. All rights reserved.
                </p>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:w-1/2 p-6 md:p-8 lg:p-12">
              <AnimatePresence mode="wait">
                <div
                  key={isLogin ? 'login' : 'register'}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  {/* Header */}
                  <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </h2>
                    <p className="text-sm md:text-base text-gray-600">
                      {isLogin 
                        ? 'Enter your credentials to access your account'
                        : 'Fill in the details to register'}
                    </p>
                  </div>

                  {/* Login Form */}
                  {isLogin ? (
                    <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <HiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={loginData.email}
                            onChange={(e) => handleChange(e, true)}
                            placeholder="Enter your email"
                            className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                              errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={loginData.password}
                            onChange={(e) => handleChange(e, true)}
                            placeholder="Enter your password"
                            className={`w-full pl-10 pr-12 py-2.5 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                              errors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <HiEyeOff /> : <HiEye />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                        )}
                      </div>

                      {/* <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>
                        <button type="button" className="text-sm text-blue-600 hover:text-blue-800">
                          Forgot password?
                        </button>
                      </div> */}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 md:py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Signing in...</span>
                          </>
                        ) : (
                          <>
                            <span>Sign In</span>
                            <HiArrowRight />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* Register Form */
                    <form onSubmit={handleRegister} className="space-y-3 md:space-y-4">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <HiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="name"
                            value={registerData.name}
                            onChange={(e) => handleChange(e, false)}
                            placeholder="Enter your full name"
                            className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                              errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <HiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={registerData.email}
                            onChange={(e) => handleChange(e, false)}
                            placeholder="Enter your email"
                            className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                              errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <HiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={registerData.phone}
                            onChange={(e) => handleChange(e, false)}
                            placeholder="Enter 10-digit phone number"
                            maxLength="10"
                            className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                              errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                        )}
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={registerData.password}
                            onChange={(e) => handleChange(e, false)}
                            placeholder="Create a password"
                            className={`w-full pl-10 pr-12 py-2.5 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                              errors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <HiEyeOff /> : <HiEye />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={registerData.confirmPassword}
                            onChange={(e) => handleChange(e, false)}
                            placeholder="Confirm your password"
                            className={`w-full pl-10 pr-12 py-2.5 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <HiEyeOff /> : <HiEye />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 md:py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Creating account...</span>
                          </>
                        ) : (
                          <>
                            <span>Create Account</span>
                            <HiArrowRight />
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Toggle between Login/Register */}
                  <div className="mt-6 text-center">
                    <p className="text-sm md:text-base text-gray-600">
                      {isLogin ? "Don't have an account? " : "Already have an account? "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setErrors({});
                          setProfilePhoto(null);
                        }}
                        className="text-blue-600 font-semibold hover:text-blue-800 hover:underline transition-colors"
                      >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                      </button>
                    </p>
                  </div>
                </div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
