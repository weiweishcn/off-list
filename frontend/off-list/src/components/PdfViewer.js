import React, { useRef, useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ReactPdfViewer = ({ pdfUrl, onPdfRendered, onLoad }) => {
  const containerRef = useRef(null);
  const [numPages, setNumPages] = useState(1);
  const [pageWidth, setPageWidth] = useState(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setPageWidth(containerRef.current.offsetWidth);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current && onPdfRendered) {
      onPdfRendered(containerRef.current);
    }
  }, [onPdfRendered]);

  const handleLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    if (onLoad) {
      onLoad({ numPages });
    }
  };

  const handleLoadError = (error) => {
    console.error('Error loading PDF:', error);
  };

  return (
    <div 
      ref={containerRef} 
      className="pdf-container"
      style={{ width: '100%', height: '100%', overflow: 'auto' }}
    >
      <Document 
        file={pdfUrl}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        }
        error={
          <div className="flex items-center justify-center h-full text-red-500">
            Failed to load PDF. Please try again.
          </div>
        }
      >
        <Page 
          pageNumber={1}
          width={pageWidth}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          }
        />
      </Document>
    </div>
  );
};

ReactPdfViewer.defaultProps = {
  onPdfRendered: () => {},
  onLoad: () => {}
};

export default ReactPdfViewer;