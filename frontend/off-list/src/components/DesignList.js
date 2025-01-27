import React, { useState, useEffect, useRef, useCallback } from 'react';

// ... other components remain the same (LoadingState, ErrorState, EmptyState) ...
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
// Progressive Image component that loads a small blur first
const ProgressiveImage = ({ src, alt, className, onClick, priority = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null);
  const imgRef = useRef();

  // Generate a low-quality image URL for initial quick load
  const thumbnailSrc = src ? (
    src.includes('digitaloceanspaces.com') 
      ? `${src}?w=10` // Very small image for quick load
      : src
  ) : null;

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    setCurrentSrc(thumbnailSrc);

    // Preload high quality image
    const highQualityImage = new Image();
    highQualityImage.src = src;
    highQualityImage.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
  }, [src, thumbnailSrc]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Low quality placeholder */}
      {thumbnailSrc && (
        <img
          src={thumbnailSrc}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover blur-lg scale-105 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-300`}
        />
      )}

      {/* Main image */}
      {currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          onClick={onClick}
          className={`w-full h-full object-cover ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } transition-all duration-500`}
          onError={(e) => {
            console.error(`Failed to load image: ${e.target.src}`);
            e.target.onerror = null;
            e.target.src = '/api/placeholder/400/320';
          }}
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};

// Virtual list component for efficient rendering
const VirtualizedDesignList = ({ designs }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 6 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const buffer = window.innerHeight;
      
      // Check if container is near viewport
      if (rect.top - buffer < window.innerHeight && rect.bottom + buffer > 0) {
        // Load more items when user scrolls near the end
        setVisibleRange(prev => ({
          start: 0,
          end: Math.min(prev.end + 3, designs.length)
        }));
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [designs.length]);

  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {designs.slice(0, visibleRange.end).map((design) => (
        <DesignCard 
          key={design.id} 
          design={design}
          priority={visibleRange.end <= 6} // Prioritize loading first 6 items
        />
      ))}
    </div>
  );
};

const ImageModal = ({ images, currentIndex, onClose, onNext, onPrevious, design }) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    console.error('Invalid or empty images array');
    return null;
  }

  const currentImage = images[currentIndex];
  if (!currentImage) {
    console.error('Invalid current image index');
    return null;
  }

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center"
      onClick={handleClose}
    >
      <div 
        className="relative w-full h-full flex flex-col items-center justify-center p-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          className="absolute top-4 right-4 text-white p-2 z-50 hover:bg-white/20 rounded-full"
          onClick={handleClose}
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Main content container */}
        <div className="relative max-h-[85vh] w-full flex flex-col items-center">
          {/* Image container */}
          <div className="relative w-full flex-1 flex items-center justify-center mb-4">
            <img
              src={currentImage}
              alt="Enlarged view"
              className="max-h-[70vh] max-w-[90vw] object-contain"
              onClick={e => e.stopPropagation()}
            />
            
            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrevious();
                  }}
                  className="absolute left-4 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
                  className="absolute right-4 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute top-4 right-16 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>

          {/* Design details */}
          <div className="w-full max-w-3xl bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex flex-wrap gap-3 items-center justify-center text-white">
              {design.style && (
                <span className="bg-blue-500/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  Style: {design.style}
                </span>
              )}
              {design.tag && (
                <span className="bg-green-500/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  Tag: {design.tag}
                </span>
              )}
              {design.color?.map((c, index) => (
                <span 
                  key={index} 
                  className="bg-gray-500/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm"
                >
                  Color: {c}
                </span>
              ))}
              {design.description && (
                <span className="bg-purple-500/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  Location: {design.description}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DesignCard = ({ design }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleImageClick = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleNextImage = useCallback((e) => {
    e?.stopPropagation();
    if (design?.images?.length) {
      setCurrentImageIndex(prev => (prev + 1) % design.images.length);
    }
  }, [design?.images?.length]);

  const handlePreviousImage = useCallback((e) => {
    e?.stopPropagation();
    if (design?.images?.length) {
      setCurrentImageIndex(prev => 
        prev === 0 ? design.images.length - 1 : prev - 1
      );
    }
  }, [design?.images?.length]);

  // Verify design data is valid
  if (!design || !design.images || !Array.isArray(design.images) || design.images.length === 0) {
    console.error('Invalid design data:', design);
    return null;
  }

  return (
    <div className="relative">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div 
          className="relative h-64 cursor-pointer"
          onClick={handleImageClick}
        >
          <img
            src={design.images[currentImageIndex]}
            alt={`${design.tag || ''} design by ${design.designer || ''}`}
            className="w-full h-full object-cover"
          />
          
          {/* Navigation controls */}
          {design.images.length > 1 && (
            <>
              <div className="absolute inset-0 flex items-center justify-between p-2">
                <button
                  onClick={handlePreviousImage}
                  className="w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNextImage}
                  className="w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Image counter */}
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {design.images.length}
              </div>
            </>
          )}
        </div>

        {/* Card content */}
        <div className="p-4">
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
            {design.color?.map((c, index) => (
              <span 
                key={index} 
                className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
              >
                Color: {c}
              </span>
            ))}
          </div>
          {design.description && (
            <p className="text-gray-700 mt-2">{design.description}</p>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && design.images && (
        <ImageModal
          images={design.images}
          currentIndex={currentImageIndex}
          onClose={handleCloseModal}
          onNext={handleNextImage}
          onPrevious={handlePreviousImage}
          design={design}
        />
      )}
    </div>
  );
};

const DesignList = () => {
  const [designs, setDesigns] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const apiUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/design`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        console.log('Fetched designs:', data);
        
        if (data?.designs) {
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!designs.length) return <div>No designs found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {designs.map((design) => (
          <DesignCard key={design.id} design={design} />
        ))}
      </div>
    </div>
  );
};

export default DesignList;