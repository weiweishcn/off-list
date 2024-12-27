import React from 'react';
import ImageTagger from './ImageTagger';
import PDFTagger from './PdfTagger';

const RoomTagger = ({ 
  floorPlanUrl, 
  rooms = [], 
  onTagsUpdate,
  isPreviewMode = false, 
  initialTags = [] 
}) => {
  const isPDF = floorPlanUrl?.toLowerCase().endsWith('.pdf');

  return isPDF ? (
    <PDFTagger
      floorPlanUrl={floorPlanUrl}
      rooms={rooms}
      onTagsUpdate={onTagsUpdate}
      isPreviewMode={isPreviewMode}
      initialTags={initialTags}
    />
  ) : (
    <ImageTagger
      imageUrl={floorPlanUrl}
      rooms={rooms}
      onTagsUpdate={onTagsUpdate}
      isPreviewMode={isPreviewMode}
      initialTags={initialTags}
    />
  );
};

export default RoomTagger;