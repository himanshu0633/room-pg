import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  HiHome, HiUser, HiLogout, HiMenu, HiX, HiHeart, 
  HiCalendar, HiOfficeBuilding, HiChartBar, HiPlus,
  HiBell, HiSearch, HiChevronDown, HiUserCircle,
  HiLocationMarker, HiCurrencyRupee, HiStar
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [location]);

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

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserRole(null);
    toast.success('Logged out successfully');
    navigate('/');
    setIsDropdownOpen(false);
  };

  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [];
    }

    if (userRole === 'admin') {
      return [
        { name: 'Dashboard', path: '/admindashboard', icon: HiChartBar },
        { name: 'Bookings', path: '/admin-bookings', icon: HiCalendar },
        { name: 'Add Property', path: '/properties/add', icon: HiPlus },
        { name: 'Sectors', path: '/sectors', icon: HiOfficeBuilding }
      ];
    }

    // User role
    return [
      { name: 'Properties', path: '/properties', icon: HiSearch },
      { name: 'Saved', path: '/saved-properties', icon: HiHeart },
      { name: 'Bookings', path: '/my-bookings', icon: HiCalendar }
    ];
  };

  const navLinks = getNavLinks();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const isActive = (path) => {
    if (path.includes('#')) return false;
    return location.pathname === path;
  };

  // Mobile Footer Component
  const MobileFooter = () => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return null;

    const mobileNavLinks = getNavLinks();

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
        <div className="flex justify-around items-center py-2">
          {/* Home Link */}
          {/* <Link
            to="/"
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors"
          >
            <HiHome className="text-xl text-gray-600" />
            <span className="text-xs text-gray-600">Home</span>
          </Link> */}

          {/* Dynamic Links based on auth and role */}
          {!isAuthenticated ? (
            <>
              <Link
                to="/properties"
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors"
              >
                <HiSearch className="text-xl text-gray-600" />
                <span className="text-xs text-gray-600">Explore</span>
              </Link>
              <Link
                to="/login"
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors"
              >
                <HiUser className="text-xl text-gray-600" />
                <span className="text-xs text-gray-600">Login</span>
              </Link>
            </>
          ) : (
            mobileNavLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive(link.path) ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <link.icon className="text-xl" />
                <span className="text-xs">{link.name}</span>
              </Link>
            ))
          )}

          {/* Profile/Settings */}
          {isAuthenticated && (
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
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div
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
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isActive(link.path)
                        ? 'text-blue-600 font-semibold bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <link.icon className="text-lg" />
                    <span>{link.name}</span>
                  </Link>
                </motion.div>
              ))}

              {/* Auth Section - Desktop */}
              {!isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex gap-3"
                >
                  <Link
                    to="/login"
                    className="px-5 py-2 text-blue-600 border-2 border-blue-600 rounded-full hover:bg-blue-50 transition-all"
                  >
                    Login
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-gray-100 transition-all"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {currentUser?.profilePhoto ? (
                        <img src={currentUser.profilePhoto} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        getInitials(currentUser?.name)
                      )}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-semibold text-gray-800">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                    </div>
                    <HiChevronDown className={`text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Desktop Dropdown */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-gray-100">
                          <p className="font-semibold text-gray-800">{currentUser?.name}</p>
                          <p className="text-sm text-gray-500">{currentUser?.email}</p>
                          <p className="text-xs text-blue-600 capitalize mt-1">{userRole}</p>
                        </div>
                        
                        <div className="py-2">
                          {userRole === 'admin' ? (
                            <>
                              <Link
                                to="/admindashboard"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                              >
                                <HiChartBar className="text-gray-500" />
                                <span>Dashboard</span>
                              </Link>
                              <Link
                                to="/admin-bookings"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                              >
                                <HiCalendar className="text-gray-500" />
                                <span>Bookings</span>
                              </Link>
                              <Link
                                to="/properties/add"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                              >
                                <HiPlus className="text-gray-500" />
                                <span>Add Property</span>
                              </Link>
                              <Link
                                to="/sectors"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
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
                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                              >
                                <HiSearch className="text-gray-500" />
                                <span>Browse Properties</span>
                              </Link>
                              <Link
                                to="/saved-properties"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                              >
                                <HiHeart className="text-gray-500" />
                                <span>Saved Properties</span>
                              </Link>
                              <Link
                                to="/my-bookings"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                              >
                                <HiCalendar className="text-gray-500" />
                                <span>My Bookings</span>
                              </Link>
                            </>
                          )}
                        </div>
                        
                        <div className="border-t border-gray-100 py-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-gray-50 transition-colors text-red-600"
                          >
                            <HiLogout className="text-red-500" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </nav>

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
    </>
  );
};

export default Navbar;