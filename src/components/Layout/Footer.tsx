import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Mail, Phone, MapPin, User } from 'lucide-react';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const handleAdminLogin = () => {
    navigate('/login?admin=true');
  };

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 md:grid-cols-2">
          {/* Company Information */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-cyrobox-primary rounded-lg flex items-center justify-center">
                <div className="relative w-6 h-6">
                  <svg viewBox="0 0 32 32" className="w-full h-full">
                    <path 
                      d="M16 2 L28 8 L28 20 L16 26 L4 20 L4 8 Z" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="2"
                    />
                    <path 
                      d="M8 12 L16 16 L24 12" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="2"
                    />
                    <path 
                      d="M8 16 L16 20 L24 16" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="2"
                    />
                    <path 
                      d="M8 20 L16 24 L24 20" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  CYROBOX
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  MocKinvi by CYROBOX
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              AI-powered mock interviews and career preparation platform by CYROBOX. 
              Empowering your interview success with cutting-edge technology.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 text-cyrobox-primary" />
                <span>7th floor, Manjeera Trinity corporate, V-Quartet, 703, eSeva Ln, K P H B Phase 3, Kukatpally, Hyderabad, Telangana 500072</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4 text-cyrobox-primary" />
                <a href="mailto:contact@cyrobox.in" className="hover:text-cyrobox-primary transition-colors">
                  contact@cyrobox.in
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4 text-cyrobox-primary" />
                <a href="tel:+918309547129" className="hover:text-cyrobox-primary transition-colors">
                  +91-8309547129
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4 text-cyrobox-primary" />
                <span>G Naveen Kumar (Founder)</span>
              </div>
            </div>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-900 dark:text-gray-100 uppercase">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/learning" className="text-gray-600 dark:text-gray-300 hover:text-cyrobox-primary transition-colors">
                  Learning Hub
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-cyrobox-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/interview-resources" className="text-gray-600 dark:text-gray-300 hover:text-cyrobox-primary transition-colors">
                  Interview Guides
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-900 dark:text-gray-100 uppercase">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-cyrobox-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-cyrobox-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-cyrobox-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 mt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm text-center text-gray-600 dark:text-gray-300">
              &copy; {new Date().getFullYear()} CYROBOX. All rights reserved. MocKinvi is a product of CYROBOX.
            </p>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleAdminLogin}
                className="text-xs text-gray-500 dark:text-gray-300 hover:text-cyrobox-primary"
              >
                Admin Access
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="border-gray-300 dark:border-gray-600 hover:border-cyrobox-primary dark:hover:border-cyrobox-primary"
              >
                {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;