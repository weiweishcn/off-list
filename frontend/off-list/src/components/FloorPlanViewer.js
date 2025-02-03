import React, { useMemo } from 'react';
import { Download, FileText } from 'lucide-react';

const FloorPlanViewer = ({ imageUrl }) => {
  // Check the file type before rendering anything
  const contentType = useMemo(() => {
    if (!imageUrl) return null;
    return imageUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';
  }, [imageUrl]);

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center p-12 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-500">No floor plan available</p>
      </div>
    );
  }

  if (contentType === 'pdf') {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-gray-200 rounded-lg bg-gray-50">
        <div className="mb-4">
          <FileText size={48} className="text-gray-400" />
        </div>
        <p className="mb-4 text-gray-600 text-center">Floor Plan (PDF Format)</p>
        <a 
          href={imageUrl}
          download
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-blue-600 hover:text-blue-800 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
        >
          <Download size={20} />
          <span>Download PDF</span>
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <img 
        src={imageUrl} 
        alt="Floor Plan"
        className="w-full h-auto"
      />
    </div>
  );
};

export default FloorPlanViewer;