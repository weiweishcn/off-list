import React, { useState } from 'react';
import { designRoomData } from '../data/designRoomData';

const RoomSection = ({ roomType, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <h2 className="text-xl font-bold p-4 bg-gray-50">{roomType}</h2>
      
      {/* Image Container */}
      <div className="relative h-64">
        <img
          src={images[currentIndex].location}
          alt={`${roomType} design`}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setShowModal(true)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/api/placeholder/400/320';
          }}
        />

        {/* Navigation Controls */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-2">
            <button
              onClick={handlePrevious}
              className="w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Image Counter */}
        <div className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="relative max-w-7xl mx-auto p-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"
              onClick={() => setShowModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Image */}
            <img
              src={images[currentIndex].location}
              alt={`${roomType} design enlarged view`}
              className="max-h-[85vh] max-w-full object-contain mx-auto"
            />

            {/* Modal Navigation */}
            {images.length > 1 && (
              <div className="absolute inset-y-1/2 w-full flex justify-between px-4 -mx-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious(e);
                  }}
                  className="w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext(e);
                  }}
                  className="w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Modal Counter */}
            <div className="absolute top-4 right-16 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DesignListPerRoomType = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(designRoomData).map(([roomType, images]) => (
          <RoomSection 
            key={roomType} 
            roomType={roomType} 
            images={images}
          />
        ))}
      </div>
    </div>
  );
};

export default DesignListPerRoomType;