import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from './designshow.jpg'; // Import the image
import DesignList from './DesignList';

// HomePage.js update
const LandingPage = ({ onLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            filter: 'brightness(0.7)'
          }}
        />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        {/* Navigation */}
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
            <div className="hidden md:flex space-x-4">
              <button 
                onClick={() => window.location.href='/login'}
                className="px-6 py-2 text-white hover:bg-white hover:text-black transition-colors rounded-lg border border-white"
              >
                Log In
              </button>
              <button 
                onClick={() => window.location.href='/signup'}
                className="px-6 py-2 bg-white text-black hover:bg-gray-200 transition-colors rounded-lg"
              >
                Sign Up
              </button>
              <button 
                onClick={() => window.location.href='/contactus'}
                className="px-6 py-2 bg-white text-black hover:bg-gray-200 transition-colors rounded-lg"
              >
                Contact Us
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden absolute top-full left-0 right-0 bg-black bg-opacity-90 transition-all duration-200`}>
            <div className="flex flex-col gap-2 p-4">
              <button 
                onClick={() => window.location.href='/login'}
                className="w-full px-6 py-2 text-white hover:bg-white hover:text-black transition-colors rounded-lg border border-white text-center"
              >
                Log In
              </button>
              <button 
                onClick={() => window.location.href='/signup'}
                className="w-full px-6 py-2 bg-white text-black hover:bg-gray-200 transition-colors rounded-lg text-center"
              >
                Sign Up
              </button>
              <button 
                onClick={() => window.location.href='/contactus'}
                className="w-full px-6 py-2 bg-white text-black hover:bg-gray-200 transition-colors rounded-lg text-center"
              >
                Contact Us
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6">Your personal design team</h2>
          <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl">
            Let our professional designers bring your clients' visions to life
          </p>
          <div className="flex flex-col md:flex-row gap-4 md:space-x-4">
            <button 
              onClick={() => window.location.href='/design'}
              className="px-8 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-lg w-full md:w-auto"
            >
              View Designs
            </button>
          </div>
        </div>
      </div>

      {/* Design List Section */}
      <div className="bg-white">
        <div className="relative z-10">
           <DesignList />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add logout logic here
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Designer Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Design Request Card */}
          <div 
            onClick={() => navigate('/designRequest')}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
          >
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Create Design Request</h2>
              <p className="text-gray-600">Start a new design project by submitting your requirements</p>
            </div>
          </div>

          {/* Contact Support Card */}
          <div 
            onClick={() => navigate('/contact')}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
          >
            <div className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Contact Support</h2>
              <p className="text-gray-600">Get help with your design projects or account</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Add logic to check if user is logged in
    // For now, we'll assume they're not
    setIsLoggedIn(false);
  }, []);

  return isLoggedIn ? <Dashboard /> : <LandingPage />;
};

export default HomePage;