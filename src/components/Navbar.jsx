import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  HiHome, HiUser, HiLogout, HiMenu, HiX, HiHeart, 
  HiCalendar, HiOfficeBuilding, HiChartBar, HiPlus,
  HiBell, HiSearch, HiChevronDown, HiUserCircle
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      return [
        
      ];
    }

    if (userRole === 'admin') {
      return [
        { name: 'Dashboard', path: '/admindashboard', icon: HiChartBar },
        { name: 'Bookings & Saved Properties', path: '/admin-bookings', icon: HiHome },
        { name: 'Add Property', path: '/properties/add', icon: HiPlus },
        { name: 'Sectors', path: '/sectors', icon: HiOfficeBuilding }
      ];
    }

    // User role
    return [
      { name: 'Properties', path: '/properties', icon: HiSearch },
      { name: 'Saved', path: '/saved-properties', icon: HiHeart },
      { name: 'Bookings', path: '/my-bookings', icon: HiCalendar },
      // { name: 'Contact', path: '/#contact', icon: HiUser }
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

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 py-3 margin-bottom-20">
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
                {link.path.includes('#') ? (
                  <a
                    href={link.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isActive(link.path)
                        ? 'text-blue-600 font-semibold'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <link.icon className="text-lg" />
                    <span>{link.name}</span>
                  </a>
                ) : (
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
                )}
              </motion.div>
            ))}

            {/* Auth Section */}
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

                {/* Dropdown Menu */}
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
                              <HiHome className="text-gray-500" />
                              <span>Bookings & Saved Properties</span>
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 overflow-hidden"
            >
              <div className="flex flex-col gap-2 py-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {link.path.includes('#') ? (
                      <a
                        href={link.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive(link.path)
                            ? 'bg-blue-50 text-blue-600 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <link.icon className="text-xl" />
                        <span>{link.name}</span>
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive(link.path)
                            ? 'bg-blue-50 text-blue-600 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <link.icon className="text-xl" />
                        <span>{link.name}</span>
                      </Link>
                    )}
                  </motion.div>
                ))}

                {/* Mobile Auth Section */}
                {!isAuthenticated ? (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-3 text-center text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-all"
                    >
                      Login
                    </Link>
                  
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg mb-2">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {getInitials(currentUser?.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{currentUser?.name}</p>
                        <p className="text-sm text-gray-500">{currentUser?.email}</p>
                        <p className="text-xs text-blue-600 capitalize">{userRole}</p>
                      </div>
                    </div>
                    
                    {userRole === 'admin' ? (
                      <>
                        <Link
                          to="/admindashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50"
                        >
                          <HiChartBar /> Dashboard
                        </Link>
                        <Link
                          to="/sectors"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50"
                        >
                          <HiOfficeBuilding /> Sectors
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/saved-properties"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50"
                        >
                          <HiHeart /> Saved Properties
                        </Link>
                        <Link
                          to="/my-bookings"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50"
                        >
                          <HiCalendar /> My Bookings
                        </Link>
                      </>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 rounded-lg hover:bg-red-50 mt-2"
                    >
                      <HiLogout /> Logout
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;