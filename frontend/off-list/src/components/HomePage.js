import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from './designshow.jpg'; // Import the image

const LandingPage = ({ onLogin }) => {
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
        <nav className="relative z-10 p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-white text-3xl font-bold">Rondo</h1>
            <div className="space-x-4">
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
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h2 className="text-6xl font-bold mb-6">Your personal design team</h2>
          <p className="text-xl mb-8 max-w-2xl">
            Let our professional designers bring your clients' visions to life
          </p>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.href='/designRequest'}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg"
            >
              Start Your Project
            </button>
            <button 
              onClick={() => window.location.href='/design'}
              className="px-8 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-lg"
            >
              View Designs
            </button>
          </div>
        </div>
      </div>

      {/* Featured Designs Grid */}
      <div className="max-w-7xl mx-auto py-16 px-4">
        <h3 className="text-3xl font-bold text-center mb-12">Featured Designs</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group relative overflow-hidden rounded-lg aspect-square shadow-lg">
              <img 
                src={backgroundImage} 
                alt={`Featured design ${i}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-6 text-white">
                  <h4 className="text-xl font-bold">Design Project {i}</h4>
                  <p className="text-sm opacity-90">Modern Interior Design</p>
                </div>
              </div>
            </div>
          ))}
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