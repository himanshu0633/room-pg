import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiSearch, HiLocationMarker, HiOfficeBuilding, HiCurrencyRupee,
  HiCalendar, HiCheckCircle, HiArrowRight, HiStar, HiUsers,
  HiPhone, HiMail, HiMap, HiMenu, HiX, HiHome, HiHeart,
  HiShieldCheck, HiTrendingUp, HiChat, HiPhotograph
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Student",
      content: "Found the perfect PG near my college through this platform. The booking process was seamless and the property was exactly as described!",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    {
      name: "Priya Patel",
      role: "Working Professional",
      content: "Amazing platform! Found a fully furnished room within my budget. The owner was very cooperative and the whole process was hassle-free.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/2.jpg"
    },
    {
      name: "Amit Kumar",
      role: "Property Owner",
      content: "Listing my properties has never been easier. Got multiple inquiries within days and all tenants were genuine. Highly recommended!",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/3.jpg"
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

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <HiHome className="text-white text-2xl" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                PropertyFinder
              </span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
              <a href="properties" className="text-gray-700 hover:text-blue-600 transition-colors">Properties</a>
              <a href="contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
              <Link to="/login" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-lg transition-all transform hover:scale-105">
                Get Started
              </Link>
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
                <div className="flex flex-col gap-4 py-4">
                  <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors py-2">Home</a>
                  <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors py-2">Features</a>
                  <a href="#properties" className="text-gray-700 hover:text-blue-600 transition-colors py-2">Properties</a>
                  <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors py-2">Testimonials</a>
                  <Link to="/login" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-center">
                    Get Started
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-transparent to-purple-100 opacity-50"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-400 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full mb-6"
              >
                🏠 Find Your Dream Home
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                Find Your Perfect
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Property</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Discover the best properties for rent and sale. From cozy rooms to luxurious apartments, find your perfect home with ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/properties"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 group"
                >
                  Explore Properties
                  <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
            
              </div>
            </motion.div>

            <motion.div
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
                  <p className="text-lg font-semibold">Luxury Apartments</p>
                  <p className="text-sm">Starting from ₹15,000/month</p>
                </div>
              </div>
              
              {/* Floating Stats */}
              <motion.div
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
              </motion.div>
              
              <motion.div
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
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center text-white"
              >
                <div className="flex justify-center mb-4">
                  <stat.icon className="text-4xl" />
                </div>
                <p className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</p>
                <p className="text-sm opacity-90">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
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
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 px-4">
        <div className="container mx-auto">
          <motion.div
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
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Search", description: "Search properties by location, price, and amenities", icon: HiSearch, color: "from-blue-500 to-blue-600" },
              { step: "02", title: "Compare", description: "Compare multiple properties and save favorites", icon: HiStar, color: "from-purple-500 to-purple-600" },
              { step: "03", title: "Book", description: "Book your favorite property online", icon: HiCalendar, color: "from-green-500 to-green-600" }
            ].map((item, index) => (
              <motion.div
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
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
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
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
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Dots */}
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
          <motion.div
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
              <Link
                to="/login"
                className="px-8 py-3 border-2 border-white text-white rounded-full hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105"
              >
                Get Started Today
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <HiHome className="text-white text-2xl" />
                </div>
                <span className="text-2xl font-bold">PropertyFinder</span>
              </div>
              <p className="text-gray-400">Find your perfect home with ease and comfort.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#properties" className="hover:text-white transition-colors">Properties</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2"><HiPhone /> +91 1234567890</li>
                <li className="flex items-center gap-2"><HiMail /> support@propertyfinder.com</li>
                <li className="flex items-center gap-2"><HiMap /> Delhi, India</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">📘</a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">🐦</a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">📷</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 PropertyFinder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;