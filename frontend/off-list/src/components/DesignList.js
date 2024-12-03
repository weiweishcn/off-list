import React, { useState, useEffect } from 'react';

const LoadingState = () => (
  <div className="flex justify-center items-center min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="flex justify-center items-center min-h-[200px] text-red-600">
    <div className="text-center">
      <p className="text-lg font-semibold">Error loading designs</p>
      <p className="text-sm">{message}</p>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex justify-center items-center min-h-[200px] text-gray-600">
    <p className="text-lg">No designs found</p>
  </div>
);

const ImageModal = ({ images, currentIndex, onClose, onNext, onPrevious }) => {
  if (!images) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
         onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Close button */}
        <button 
          className="absolute top-4 right-4 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Previous button */}
        {images.length > 1 && (
          <button 
            className="absolute left-4 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Image */}
        <img 
          src={`{apiUrl}${images[currentIndex]}`}
          alt="Enlarged view"
          className="max-h-[90vh] max-w-[90vw] object-contain"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Next button */}
        {images.length > 1 && (
          <button 
            className="absolute right-4 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Image counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

const DesignCard = ({ design }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextImage = (e) => {
    e?.stopPropagation();
    if (design.images && design.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % design.images.length);
    }
  };

  const previousImage = (e) => {
    e?.stopPropagation();
    if (design.images && design.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? design.images.length - 1 : prev - 1
      );
    }
  };

  const hasMultipleImages = design.images && design.images.length > 1;

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="relative h-64">
          {design.images && design.images[currentImageIndex] && (
            <img 
              src={`{apiUrl}${design.images[currentImageIndex]}`}
              alt={`${design.tag} design by ${design.designer}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setIsModalOpen(true)}
              onError={(e) => {
                console.error(`Failed to load image: ${e.target.src}`);
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/400";
              }}
            />
          )}

          {hasMultipleImages && (
            <>
              <button 
                onClick={previousImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button 
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                {design.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'bg-white scale-110' 
                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-4">
          <p className="text-gray-700 mb-2">{design.description}</p>
          <div className="flex flex-wrap gap-2">
            {design.style && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                Style: {design.style}
              </span>
            )}
            {design.tag && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                Tag: {design.tag}
              </span>
            )}
            {design.color && design.color.map((c, index) => (
              <span 
                key={index} 
                className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
              >
                Color: {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ImageModal 
          images={design.images}
          currentIndex={currentImageIndex}
          onClose={() => setIsModalOpen(false)}
          onNext={() => nextImage()}
          onPrevious={() => previousImage()}
        />
      )}
    </>
  );
};

const DesignList = () => {
  const [designs, setDesigns] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://165.232.131.137:3001';
        //const apiUrl = "http://localhost:3001";
        console.log('Fetching from:', `${apiUrl}/api/design`);
        
        const response = await fetch(`${apiUrl}/api/design`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched data:', data);
        
        if (data && data.designs) {
          setDesigns(data.designs);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!designs || designs.length === 0) return <EmptyState />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-12">Featured Designs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {designs.map((design) => (
          <DesignCard key={design.id} design={design} />
        ))}
      </div>
    </div>
  );
};

export default DesignList;