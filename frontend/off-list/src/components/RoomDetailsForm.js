import React, { useState } from 'react';
import FileUpload from './FileUpload';

const styleOptions = {
  'Living Room': ['Modern', 'Traditional', 'Contemporary', 'Scandinavian', 'Industrial', 'Bohemian', 'Minimalist'],
  'Kitchen': ['Modern', 'Traditional', 'Contemporary', 'Farmhouse', 'Industrial', 'Transitional'],
  'Bedroom': ['Modern', 'Traditional', 'Contemporary', 'Minimalist', 'Bohemian', 'Coastal', 'Scandinavian'],
  'Bathroom': ['Modern', 'Traditional', 'Contemporary', 'Spa-like', 'Industrial', 'Coastal'],
  'Dining Room': ['Modern', 'Traditional', 'Contemporary', 'Industrial', 'Farmhouse', 'Transitional'],
  'Office': ['Modern', 'Traditional', 'Contemporary', 'Industrial', 'Minimalist', 'Classic'],
  'default': ['Modern', 'Traditional', 'Contemporary', 'Transitional', 'Minimalist']
};

const RoomDetailsForm = ({ room, onUpdate, showValidation }) => {
  const [roomDetails, setRoomDetails] = useState({
    style: '',
    description: '',
    inspirationPhotos: [],
    existingPhotos: []
  });

  const handleInputChange = (field, value) => {
    const updatedDetails = { ...roomDetails, [field]: value };
    setRoomDetails(updatedDetails);
    onUpdate(room.id, updatedDetails);
  };

  const styles = styleOptions[room.type] || styleOptions.default;

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      {/* Header */}
      <div className="border-b p-4">
        <h3 className="text-xl font-semibold">{room.type}</h3>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Style Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Preferred Style</label>
          <select
            value={roomDetails.style}
            onChange={(e) => handleInputChange('style', e.target.value)}
            className={`w-full p-2 border rounded-md bg-white ${
              showValidation && !roomDetails.style ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a style</option>
            {styles.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
          {showValidation && !roomDetails.style && (
            <p className="mt-1 text-sm text-red-500">Please select a style</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Additional Details & Preferences
          </label>
          <textarea
            value={roomDetails.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe any specific requirements, preferences, or existing items you want to keep..."
            className={`w-full p-2 border rounded-md min-h-32 ${
              showValidation && !roomDetails.description?.trim() 
                ? 'border-red-500' 
                : 'border-gray-300'
            }`}
          />
          {showValidation && !roomDetails.description?.trim() && (
            <p className="mt-1 text-sm text-red-500">Please provide some details about your preferences</p>
          )}
        </div>

        {/* Inspiration Photos */}
        <div>
          <label className="block text-sm font-medium mb-4">
            Inspiration Photos
            <span className="block text-gray-500 text-xs mt-1">
              Upload photos of designs you love or want to incorporate
            </span>
          </label>
          <FileUpload
            onUploadComplete={(urls) => handleInputChange('inspirationPhotos', urls)}
            accept="image/jpeg,image/png,image/jpg"
            uploadType="inspiration"
          />
          {roomDetails.inspirationPhotos.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {roomDetails.inspirationPhotos.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Inspiration ${index + 1}`}
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <button
                    onClick={() => handleInputChange('inspirationPhotos', 
                      roomDetails.inspirationPhotos.filter((_, i) => i !== index)
                    )}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full 
                             opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Existing Room Photos */}
        <div>
          <label className="block text-sm font-medium mb-4">
            Current Room Photos
            <span className="block text-gray-500 text-xs mt-1">
              Upload photos of the room as it currently looks
            </span>
          </label>
          <FileUpload
            onUploadComplete={(urls) => handleInputChange('existingPhotos', urls)}
            accept="image/jpeg,image/png,image/jpg"
            uploadType="existing"
          />
          {roomDetails.existingPhotos.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {roomDetails.existingPhotos.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Existing ${index + 1}`}
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <button
                    onClick={() => handleInputChange('existingPhotos',
                      roomDetails.existingPhotos.filter((_, i) => i !== index)
                    )}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full 
                             opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsForm;