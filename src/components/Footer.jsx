import React from 'react';
import { Link } from 'react-router-dom';
import { HiHome, HiPhone, HiMail, HiMap } from 'react-icons/hi';

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <HiHome className="text-white text-2xl" />
              </div>
              <span className="text-2xl font-bold">PropertyFinder</span>
            </div>
            <p className="text-gray-400">
              Find your perfect home with ease and comfort across Delhi NCR, Jaipur, and more.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#home" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#properties" className="hover:text-white transition-colors">
                  Properties
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-white transition-colors">
                  Testimonials
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2">
                <HiPhone /> +91 9876543210
              </li>
              <li className="flex items-center gap-2">
                <HiMail /> support@propertyfinder.com
              </li>
              <li className="flex items-center gap-2">
                <HiMap /> Noida, Uttar Pradesh
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Properties Available In</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📍 Delhi</li>
              <li>📍 Gurgaon</li>
              <li>📍 Noida</li>
              <li>📍 Jaipur</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2026 PropertyFinder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;