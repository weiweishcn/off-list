import React, { useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import ImageTagger from './ImageTagger';
import PDFTagger from './PdfTagger';
import html2canvas from 'html2canvas';
import axios from 'axios';

const RoomTagger = forwardRef(({ 
  floorPlanUrl, 
  rooms = [], 
  onTagsUpdate,
  isPreviewMode = false, 
  initialTags = [],
  projectFolder
}, ref) => {
  const containerRef = useRef(null);
  const isPDF = floorPlanUrl?.toLowerCase().endsWith('.pdf');

  const captureAndUploadTags = useCallback(async () => {
    console.log('Starting capture and upload...', { containerRef: containerRef.current, projectFolder });
    if (!containerRef.current || !projectFolder) {
      console.error('Missing containerRef or projectFolder');
      return null;
    }

    try {
      // Find the parent element containing all UI components
      const rootElement = containerRef.current.closest('.room-tagger-root');
      if (!rootElement) {
        console.error('Could not find root element');
        return null;
      }

      // Wait for any images to load
      console.log('Waiting for images to load...');
      const images = rootElement.getElementsByTagName('img');
      await Promise.all([...images].map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));

      // Get the computed styles
      const computedStyle = window.getComputedStyle(rootElement);
      
      // Calculate the actual dimensions including padding and borders
      const actualHeight = rootElement.scrollHeight;
      const actualWidth = rootElement.scrollWidth;

      // Store original styles and scroll positions
      const originalStyles = {
        root: rootElement.style.cssText,
        container: containerRef.current.style.cssText,
        bodyOverflow: document.body.style.overflow,
        htmlOverflow: document.documentElement.style.overflow,
        scrollTop: window.pageYOffset,
        scrollLeft: window.pageXOffset
      };

      // Prepare element for capture
      const prepareForCapture = () => {
        // Temporarily prevent scrolling
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        // Set up root element styles
        rootElement.style.position = 'relative';
        rootElement.style.width = `${actualWidth}px`;
        rootElement.style.height = `${actualHeight}px`;
        rootElement.style.transform = 'none';
        rootElement.style.transformOrigin = 'top left';
        rootElement.style.maxHeight = 'none';
        rootElement.style.overflow = 'visible';

        // Scroll to top
        window.scrollTo(0, 0);
      };

      // Restore original state
      const restoreStyles = () => {
        rootElement.style.cssText = originalStyles.root;
        containerRef.current.style.cssText = originalStyles.container;
        document.body.style.overflow = originalStyles.bodyOverflow;
        document.documentElement.style.overflow = originalStyles.htmlOverflow;
        window.scrollTo(originalStyles.scrollLeft, originalStyles.scrollTop);
      };

      // Prepare the element
      prepareForCapture();

      // Force a reflow
      void rootElement.offsetHeight;

      console.log('Capturing canvas...', { actualWidth, actualHeight });
      const canvas = await html2canvas(rootElement, {
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        logging: true,
        scale: 2,
        width: actualWidth,
        height: actualHeight,
        scrollX: -window.pageXOffset,
        scrollY: -window.pageYOffset,
        windowWidth: actualWidth,
        windowHeight: actualHeight,
        x: 0,
        y: 0,
        onclone: (clonedDoc, element) => {
          const clonedElement = clonedDoc.querySelector('.room-tagger-root');
          if (clonedElement) {
            clonedElement.style.width = `${actualWidth}px`;
            clonedElement.style.height = `${actualHeight}px`;
            clonedElement.style.transform = 'none';
            clonedElement.style.maxHeight = 'none';
            clonedElement.style.overflow = 'visible';
          }
        }
      });

      // Restore the original styles
      restoreStyles();

      // Convert canvas to blob
      console.log('Converting to blob...');
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png', 1.0);
      });

      // Create FormData and properly append the project folder and blob
      const formData = new FormData();
      formData.append('projectFolder', String(projectFolder));
      formData.append('uploadFiles', blob, 'tagged-floor-plan.png');

      console.log('Uploading to server with projectFolder:', projectFolder);

      // Upload to server
      const response = await axios.post(
        `${import.meta.env.REACT_APP_API_URL}/api/upload-tagged-floor-plan`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Upload response:', response);
      const taggedFloorPlanUrl = response.data.imageUrls[0];
      return taggedFloorPlanUrl;
    } catch (error) {
      console.error('Error in captureAndUploadTags:', {
        message: error.message,
        stack: error.stack,
        projectFolder,
        response: error.response?.data
      });
      throw error;
    }
  }, [projectFolder]);

  useImperativeHandle(ref, () => ({
    captureAndUploadTags
  }), [captureAndUploadTags]);

  const handleTagsUpdate = (newTags) => {
    if (onTagsUpdate) {
      onTagsUpdate(newTags);
    }
  };

  const sharedProps = {
    rooms,
    onTagsUpdate: handleTagsUpdate,
    isPreviewMode,
    initialTags,
    projectFolder
  };

  return (
    <div className="room-tagger-root" style={{ 
      width: '100%', 
      height: '100%',
      position: 'relative',
      overflow: 'visible'
    }}>
      <h1 className="text-xl font-semibold text-center mb-4">
        Tag rooms on your floor plan
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Click on your floor plan to mark each room location
      </p>
      
      {/* Room type legend */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4">Tag Rooms on Floor Plan</h2>
        <div className="flex flex-wrap gap-4">
          {rooms.map((room) => (
            <div key={room.type} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: room.color }} 
              />
              <span>{room.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floor plan container */}
      <div 
        ref={containerRef} 
        className="room-tagger-container" 
        style={{ 
          width: '100%',
          position: 'relative',
          overflow: 'visible'
        }}
      >
        {isPDF ? (
          <PDFTagger
            floorPlanUrl={floorPlanUrl}
            {...sharedProps}
          />
        ) : (
          <ImageTagger
            imageUrl={floorPlanUrl}
            {...sharedProps}
          />
        )}
      </div>
    </div>
  );
});

export default RoomTagger;