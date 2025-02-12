import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, PlusSquare, BarChart2, Settings, HelpCircle, LogOut, User, Search, Globe2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number>();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'he' : 'en');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex-none flex items-center md:ml-64 rtl:md:ml-0 rtl:md:mr-64">
            <Link to="/" className="flex items-center">
              <BarChart2 className="h-8 w-8 text-accent-400" />
              <span className="ml-2 rtl:ml-0 rtl:mr-2 text-xl font-bold text-white">{t('app.name')}</span>
            </Link>
          </div>
            
          {/* Search Bar Section */}
          <div className="hidden md:flex flex-1 items-center justify-center max-w-xl px-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-3 rtl:left-auto rtl:right-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t('nav.search')}
                className="block w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-sm"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center px-3 py-2 text-gray-300 hover:text-accent-400 transition-colors"
              title={language === 'en' ? 'Switch to Hebrew' : 'החלף לאנגלית'}
            >
              <Globe2 className="h-5 w-5 mr-1 rtl:mr-0 rtl:ml-1" />
              <span className="text-sm font-medium">{language === 'en' ? 'עב' : 'EN'}</span>
            </button>

            {user ? (
              <>
                <Link
                  to="/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <PlusSquare className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {t('nav.createPoll')}
                </Link>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-accent-400 transition-colors"
                  title="Dashboard"
                >
                  <BarChart2 className="h-6 w-6" />
                </Link>
                <Link
                  to="/settings"
                  className="text-gray-300 hover:text-accent-400 transition-colors"
                  title="Settings"
                >
                  <Settings className="h-6 w-6" />
                </Link>
                <div 
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                    title="Account"
                  >
                    <User className="h-5 w-5 text-accent-400" />
                  </button>
                  {isDropdownOpen && (
                    <div 
                      className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-700"
                    >
                      <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                        {user.email}
                      </div>
                      <Link
                        to="/account"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        {t('nav.accountSettings')}
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        {t('nav.signOut')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-accent-400 text-sm font-medium rounded-md text-accent-400 bg-transparent hover:bg-gray-800 transition-colors"
                >
                  <LogIn className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {t('nav.signup')}
                </Link>
              </>
            )}
            <Link
              to="/help"
              className="text-gray-300 hover:text-accent-400 transition-colors"
              title={t('nav.help')}
            >
              <HelpCircle className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}