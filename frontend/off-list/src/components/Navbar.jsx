// src/components/Navbar.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <nav className="relative z-10 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="/logo.png"
            alt="Pencil Dogs Logo" 
            className="h-10 w-auto md:h-12"
          />
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-white"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4 items-center">
          <button 
            onClick={() => window.location.href='/login'}
            className="px-6 py-2 text-white hover:bg-white hover:text-black transition-colors rounded-lg border border-white"
          >
            {t('navigation.login')}
          </button>
          <button 
            onClick={() => window.location.href='/signup'}
            className="px-6 py-2 bg-white text-black hover:bg-gray-200 transition-colors rounded-lg"
          >
            {t('navigation.signup')}
          </button>
          <button 
            onClick={() => window.location.href='/contactus'}
            className="px-6 py-2 bg-white text-black hover:bg-gray-200 transition-colors rounded-lg"
          >
            {t('navigation.contactUs')}
          </button>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden absolute top-full left-0 right-0 bg-black bg-opacity-90 transition-all duration-200`}>
        <div className="flex flex-col gap-2 p-4">
          <button 
            onClick={() => window.location.href='/login'}
            className="w-full px-6 py-2 text-white hover:bg-white hover:text-black transition-colors rounded-lg border border-white text-center"
          >
            {t('navigation.login')}
          </button>
          <button 
            onClick={() => window.location.href='/signup'}
            className="w-full px-6 py-2 bg-white text-black hover:bg-gray-200 transition-colors rounded-lg text-center"
          >
            {t('navigation.signup')}
          </button>
          <button 
            onClick={() => window.location.href='/contactus'}
            className="w-full px-6 py-2 bg-white text-black hover:bg-gray-200 transition-colors rounded-lg text-center"
          >
            {t('navigation.contactUs')}
          </button>
          <div className="flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;