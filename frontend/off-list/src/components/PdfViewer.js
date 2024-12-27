import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ReactPdfViewer = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log('PDF loaded successfully with', numPages, 'pages');
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError(error);
    setLoading(false);
  };

  // Add a timeout to prevent infinite loading
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError(new Error('Loading timed out - please try again'));
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeoutId);
  }, [loading]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= numPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}
      
      {error && (
        <div className="text-red-600 p-4">
          Error loading PDF: {error.message}
        </div>
      )}

      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        }
      >
        <Page 
          pageNumber={currentPage}
          className="max-w-full"
          loading={
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          }
        />
      </Document>

      {numPages && (
        <div className="flex items-center space-x-4 p-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-gray-700">
            Page {currentPage} of {numPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= numPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReactPdfViewer;