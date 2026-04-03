import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HiSearch, HiLocationMarker, HiOfficeBuilding, 
  HiCalendar, HiCheckCircle, HiArrowRight, HiStar, HiUsers,
  HiPhone, HiMail, HiMap, HiUser , HiHome, HiHeart,
  HiShieldCheck, HiTrendingUp, HiChat, HiPhotograph, HiLogout,
  HiChevronDown,HiChartBar, HiPlus
} from 'react-icons/hi';
import { AnimatePresence } from 'framer-motion';
import { authAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const baseURL = import.meta.env.VITE_API_URL_IMG || 'http://localhost:4000';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    checkAuth();
    fetchProperties();
  }, []);

  const checkAuth = () => {
    const token = authAPI.getToken();
    const user = authAPI.getCurrentUser();
    
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      setUserRole(user.role);
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setUserRole(null);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllProperties();
      const activeProperties = response.data.filter(p => p.propertyStatus === 'active');
      setFeaturedProperties(activeProperties.slice(0, 6));
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserRole(null);
    toast.success('Logged out successfully');
    navigate('/');
    setIsDropdownOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const getImageUrl = (file) => {
    if (!file) return 'https://via.placeholder.com/400x300?text=No+Image';
    const filename = file.path?.split('/').pop() || file.filename;
    return `${baseURL}/uploads/${filename}`;
  };

  const getFirstImage = (property) => {
    if (property.files && property.files.length > 0) {
      const imageFile = property.files.find(f => f.mimetype?.startsWith('image/'));
      if (imageFile) {
        return getImageUrl(imageFile);
      }
    }
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Student at IIT Delhi",
      content: "Found the perfect PG near my college through this platform. The booking process was seamless and the property was exactly as described!",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      location: "Delhi"
    },
    {
      name: "Priya Patel",
      role: "Software Engineer at Google",
      content: "Amazing platform! Found a fully furnished room within my budget. The owner was very cooperative and the whole process was hassle-free.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      location: "Gurgaon"
    },
    {
      name: "Amit Kumar",
      role: "Property Owner",
      content: "Listing my properties has never been easier. Got multiple inquiries within days and all tenants were genuine.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      location: "Noida"
    },
    {
      name: "Neha Singh",
      role: "MBA Student",
      content: "The filter options are amazing! Found exactly what I was looking for. The property was clean and well-maintained.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/4.jpg",
      location: "Jaipur"
    }
  ];

  const features = [
    { icon: HiSearch, title: "Easy Search", description: "Find properties by location, price, and amenities with our advanced search filters", color: "from-blue-500 to-blue-600" },
    { icon: HiShieldCheck, title: "Verified Listings", description: "All properties are verified to ensure authenticity and quality", color: "from-green-500 to-green-600" },
    { icon: HiHeart, title: "Save Favorites", description: "Save your favorite properties and get notifications for price drops", color: "from-red-500 to-red-600" },
    { icon: HiCalendar, title: "Easy Booking", description: "Book properties online with flexible visit scheduling", color: "from-purple-500 to-purple-600" },
    { icon: HiTrendingUp, title: "Best Prices", description: "Get the best deals with direct owner negotiations", color: "from-orange-500 to-orange-600" },
    { icon: HiChat, title: "Direct Chat", description: "Communicate directly with property owners", color: "from-teal-500 to-teal-600" }
  ];

  const stats = [
    { number: "10K+", label: "Happy Tenants", icon: HiUsers },
    { number: "500+", label: "Properties", icon: HiHome },
    { number: "50+", label: "Cities", icon: HiLocationMarker },
    { number: "100%", label: "Satisfaction", icon: HiCheckCircle }
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // Mobile Footer Component
  const MobileFooter = () => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return null;

    const navLinks = [
      { name: "Home", path: "/", icon: HiHome },
      { name: "Properties", path: "/properties", icon: HiSearch },
      { name: "Features", path: "/#features", icon: HiStar },
     
    ];

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
        <div className="flex justify-around items-center py-2">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
            >
              <link.icon className="text-xl" />
              <span className="text-xs">{link.name}</span>
            </Link>
          ))}
          
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
            >
              <HiUser className="text-xl" />
              <span className="text-xs">Login</span>
            </Link>
          ) : (
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors"
            >
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {getInitials(currentUser?.name)}
              </div>
              <span className="text-xs text-gray-600">Profile</span>
            </button>
          )}
        </div>

        {/* Mobile Profile Dropdown */}
        {isDropdownOpen && isAuthenticated && (
          <div className="absolute bottom-full left-0 right-0 bg-white shadow-lg rounded-t-xl mb-1 animate-slideUp">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {getInitials(currentUser?.name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{currentUser?.name}</p>
                  <p className="text-sm text-gray-500">{currentUser?.email}</p>
                  <p className="text-xs text-blue-600 capitalize">{userRole}</p>
                </div>
              </div>
            </div>
            <div className="py-2">
              {userRole === 'admin' ? (
                <>
                  <Link
                    to="/admindashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <HiChartBar className="text-gray-500" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/admin-bookings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <HiCalendar className="text-gray-500" />
                    <span>Bookings</span>
                  </Link>
                  <Link
                    to="/properties/add"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <HiPlus className="text-gray-500" />
                    <span>Add Property</span>
                  </Link>
                  <Link
                    to="/sectors"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <HiOfficeBuilding className="text-gray-500" />
                    <span>Sectors</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/properties"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <HiSearch className="text-gray-500" />
                    <span>Browse Properties</span>
                  </Link>
                  <Link
                    to="/saved-properties"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <HiHeart className="text-gray-500" />
                    <span>Saved Properties</span>
                  </Link>
                  <Link
                    to="/my-bookings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <HiCalendar className="text-gray-500" />
                    <span>My Bookings</span>
                  </Link>
                </>
              )}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <HiLogout className="text-red-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pb-16 md:pb-0">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <HiHome className="text-white text-2xl" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                PropertyFinder
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
              <a href="/properties" className="text-gray-700 hover:text-blue-600 transition-colors">Properties</a>
              
              {!isAuthenticated ? (
                <Link to="/login" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-lg transition-all transform hover:scale-105">
                  Get Started
                </Link>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-all"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                      {getInitials(currentUser?.name)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{currentUser?.name}</span>
                    <HiChevronDown className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-gray-100">
                          <p className="font-semibold text-gray-800">{currentUser?.name}</p>
                          <p className="text-sm text-gray-500">{currentUser?.email}</p>
                          <p className="text-xs text-blue-600 capitalize mt-1">{userRole}</p>
                        </div>
                        <div className="py-2">
                          {userRole === 'admin' ? (
                            <Link
                              to="/admindashboard"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50"
                            >
                              <HiChartBar className="text-gray-500" />
                              <span>Dashboard</span>
                            </Link>
                          ) : (
                            <Link
                              to="/properties"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50"
                            >
                              <HiSearch className="text-gray-500" />
                              <span>Browse Properties</span>
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-gray-100 py-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-gray-50 text-red-600"
                          >
                            <HiLogout className="text-red-500" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-transparent to-purple-100 opacity-50"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-400 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full mb-6"
              >
                🏠 Find Your Dream Home
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                Find Your Perfect
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Property</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Discover the best PG accommodations and rental rooms across Delhi NCR, Jaipur, and more. 
                From cozy rooms to luxury PGs, find your perfect home with ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/properties"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 group"
                >
                  Explore Properties
                  <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 bg-white/80 backdrop-blur border border-gray-200 text-gray-800 rounded-full hover:bg-white hover:shadow-lg transition-all text-center"
                >
                  Start Free Account
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/80 backdrop-blur-md border border-white rounded-2xl px-4 py-3 shadow-sm">
                  <p className="text-xs text-gray-500">Trust score</p>
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                    <HiShieldCheck className="text-emerald-600" /> Verified listings
                  </p>
                </div>
                <div className="bg-white/80 backdrop-blur-md border border-white rounded-2xl px-4 py-3 shadow-sm">
                  <p className="text-xs text-gray-500">Fast response</p>
                  <p className="text-sm font-semibold text-gray-800">Avg. owner reply in 15 mins</p>
                </div>
                <div className="bg-white/80 backdrop-blur-md border border-white rounded-2xl px-4 py-3 shadow-sm">
                  <p className="text-xs text-gray-500">Coverage</p>
                  <p className="text-sm font-semibold text-gray-800">Delhi NCR • Jaipur • More</p>
                </div>
              </div>
            </div>

            <div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop"
                  alt="Modern Property"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-lg font-semibold">Luxury Apartments & PGs</p>
                  <p className="text-sm">Starting from ₹8,000/month</p>
                </div>
              </div>
              
              {/* Floating Stats */}
              <div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -left-10 top-20 bg-white rounded-xl shadow-lg p-4 hidden lg:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <HiCheckCircle className="text-green-600 text-2xl" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">500+</p>
                    <p className="text-sm text-gray-500">Properties</p>
                  </div>
                </div>
              </div>
              
              <div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="absolute -right-10 bottom-20 bg-white rounded-xl shadow-lg p-4 hidden lg:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <HiUsers className="text-blue-600 text-2xl" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">10K+</p>
                    <p className="text-sm text-gray-500">Happy Tenants</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4">
          <div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                variants={fadeInUp}
                className="text-center text-white"
              >
                <div className="flex justify-center mb-4">
                  <stat.icon className="text-4xl" />
                </div>
                <p className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</p>
                <p className="text-sm opacity-90">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section id="properties" className="py-20 px-4">
        <div className="container mx-auto">
          <div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Featured <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Properties</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most popular PG accommodations and rental rooms
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-md">
              <p className="text-gray-500 text-lg">No properties found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property, index) => (
                <div
                  key={property._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
                >
                  <div className="relative h-48">
                    <img
                      src={getFirstImage(property)}
                      alt={property.address}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        property.propertyType === 'pg' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {property.propertyType?.toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 text-sm font-semibold flex items-center gap-1 shadow">
                      <HiStar className="text-yellow-400" />
                      <span>4.5</span>
                      <span className="text-gray-400">(24)</span>
                    </div>
                    {property.propertyStatus === 'active' && (
                      <div className="absolute bottom-4 left-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1">
                          <HiCheckCircle className="text-xs" /> Available
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{property.address}</h3>
                    <div className="flex items-center gap-1 text-gray-500 mb-3">
                      <HiLocationMarker className="text-gray-400" />
                      <span className="text-sm">{property.city}, {property.state}</span>
                    </div>
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">₹{property.mrp?.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">/month</span>
                      </div>
                      {property.security > 0 && (
                        <span className="text-xs text-gray-500">Sec: ₹{property.security?.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {property.features && property.features.slice(0, 3).map((feature, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                          {feature}
                        </span>
                      ))}
                      {property.features && property.features.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                          +{property.features.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/properties/${property._id}`}
                        className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Details
                      </Link>
                      <Link
                        to="/properties"
                        className="flex-1 text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-xl transition-all transform hover:scale-105"
            >
              View All Properties
              <HiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto">
          <div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">PropertyFinder?</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make property search and rental management simple, transparent, and hassle-free
            </p>
          </div>

          <div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all group"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              How It <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-lg text-gray-600">Simple steps to find your perfect property</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Search", description: "Search properties by location, price, and amenities", icon: HiSearch, color: "from-blue-500 to-blue-600" },
              { step: "02", title: "Compare", description: "Compare multiple properties and save favorites", icon: HiStar, color: "from-purple-500 to-purple-600" },
              { step: "03", title: "Book", description: "Book your favorite property online", icon: HiCalendar, color: "from-green-500 to-green-600" }
            ].map((item, index) => (
              <div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className={`w-24 h-24 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center mx-auto mb-4 relative`}>
                  <span className="text-3xl font-bold text-white">{item.step}</span>
                </div>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto -mt-12 mb-4 shadow-lg">
                  <item.icon className={`text-3xl text-${item.color.split('-')[1]}-600`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto">
          <div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              What Our <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Clients Say</span>
            </h2>
            <p className="text-lg text-gray-600">Trusted by thousands of happy tenants and property owners</p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <img
                    src={testimonials[activeTestimonial].avatar}
                    alt={testimonials[activeTestimonial].name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex justify-center md:justify-start gap-1 mb-3">
                      {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                        <HiStar key={i} className="text-yellow-400 text-xl" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-lg mb-4">"{testimonials[activeTestimonial].content}"</p>
                    <p className="font-semibold text-gray-800">{testimonials[activeTestimonial].name}</p>
                    <p className="text-sm text-gray-500">{testimonials[activeTestimonial].role}</p>
                    <p className="text-xs text-gray-400 mt-1">{testimonials[activeTestimonial].location}</p>
                  </div>
                </div>
              </div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${activeTestimonial === index ? 'w-8 bg-blue-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto text-center">
          <div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Find Your Dream Property?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of happy tenants and property owners using PropertyFinder
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/properties"
                className="px-8 py-3 bg-white text-blue-600 rounded-full hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
              >
                Explore Properties
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="px-8 py-3 border-2 border-white text-white rounded-full hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105"
                >
                  Get Started Today
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
     

      {/* Mobile Footer */}
      <MobileFooter />

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
