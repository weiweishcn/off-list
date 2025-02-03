import React from 'react';
import { useTranslation } from 'react-i18next';
import FileUpload from './FileUpload';

const VirtualStagingForm = ({ room, onUpdate, onRemove, projectFolder }) => {
  const { t } = useTranslation();

  const handlePhotoUpload = (urls) => {
    onUpdate({
      ...room,
      existingPhotos: [...(room.existingPhotos || []), ...urls]
    });
  };

  return (
    <div className="p-6 border rounded-lg mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        {room.id !== 1 && (
          <button
            onClick={onRemove}
            className="text-red-600 hover:text-red-800"
          >
            {t('createDesign.roomForm.removeRoom')}
          </button>
        )}
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('createDesign.roomForm.upload.current')}
            <span className="block text-gray-500 text-xs mt-1">
              {t('createDesign.roomForm.upload.currentDesc')}
            </span>
          </label>
          <FileUpload
            onUploadComplete={handlePhotoUpload}
            accept="image/jpeg,image/png,image/jpg"
            uploadType="existing"
            projectFolder={projectFolder}
            roomType="virtual-staging"
            roomId={room.id}
          />
        </div>

        {room.existingPhotos && room.existingPhotos.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">{t('createDesign.roomForm.upload.currentPhotos')}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {room.existingPhotos.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={t('createDesign.steps.roomDetails.photoSection.currentRoom')}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      const updatedPhotos = room.existingPhotos.filter((_, i) => i !== index);
                      onUpdate({ ...room, existingPhotos: updatedPhotos });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={t('createDesign.roomForm.removeRoom')}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualStagingForm;