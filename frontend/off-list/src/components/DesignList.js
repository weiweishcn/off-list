import React, { useState, useEffect, useRef } from 'react';

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

const DesignCard = ({ design, priority = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Preload next images
  useEffect(() => {
    if (!design.images || !priority) return;

    const nextIndex = (currentImageIndex + 1) % design.images.length;
    const nextImage = new Image();
    nextImage.src = design.images[nextIndex];
  }, [currentImageIndex, design.images, priority]);

  const nextImage = (e) => {
    e?.stopPropagation();
    if (design.images?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % design.images.length);
    }
  };

  const previousImage = (e) => {
    e?.stopPropagation();
    if (design.images?.length) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? design.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative h-64">
        <ProgressiveImage
          src={design.images?.[currentImageIndex]}
          alt={`${design.tag} design by ${design.designer}`}
          className="w-full h-full"
          onClick={() => setIsModalOpen(true)}
          priority={priority}
        />
        
        {/* Navigation buttons */}
        {design.images?.length > 1 && (
          <>
            <div className="absolute inset-x-0 bottom-2 flex justify-center items-center space-x-2 z-10">
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
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to image ${index + 1} of ${design.images.length}`}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-between px-2">
              <button
                onClick={previousImage}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Previous image"
              >
                ←
              </button>
              <button
                onClick={nextImage}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Next image"
              >
                →
              </button>
            </div>
          </>
        )}
      </div>

      <div className="p-4">
        <p className="text-gray-700 mt-2">{design.description}</p>
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
  );
};

const DesignList = () => {
  const [designs, setDesigns] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'https://pencildogs.com';
        const response = await fetch(`${apiUrl}/api/design`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
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

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!designs.length) return <EmptyState />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-12">Featured Designs</h2>
      <VirtualizedDesignList designs={designs} />
    </div>
  );
};

export default DesignList;