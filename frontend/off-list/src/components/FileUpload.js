import axios from 'axios';
import React, { useState } from 'react';

const FileUpload = ({ onUploadComplete, accept, uploadType }) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState({ 
    show: false, 
    success: false, 
    message: '' 
  });

  const validateFile = (file) => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error(`File size must be less than 100MB`);
    }

    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const validFloorPlanTypes = [...validImageTypes, 'application/pdf'];
    
    if (uploadType === 'floor_plan') {
      if (!validFloorPlanTypes.includes(file.type)) {
        throw new Error('Floor plan must be PDF, JPG, or PNG');
      }
    } else {
      if (!validImageTypes.includes(file.type)) {
        throw new Error('Images must be JPG or PNG');
      }
    }
  };

  const onChange = e => {
    try {
      const newFiles = Array.from(e.target.files);
      
      // Validate each file
      newFiles.forEach(validateFile);
      
      setFiles(prevFiles => [...prevFiles, ...newFiles]);

      // Generate previews
      const newPreviews = newFiles.map(file => {
        if (file.type.startsWith('image/')) {
          return URL.createObjectURL(file);
        }
        return null;
      });
      setPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    } catch (error) {
      alert(error.message);
    }
  };

const onSubmit = async e => {
  e.preventDefault();
  if (files.length === 0) {
    alert("Please select files to upload");
    return;
  }

  setIsUploading(true);
  setUploadProgress(0);

  const formData = new FormData();
  files.forEach(file => {
    formData.append("uploadFiles", file);
  });

  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://165.232.131.137:3001';
    const endpoint = uploadType === 'floor_plan' 
      ? `${apiUrl}/api/upload-floor-plan/`
      : `${apiUrl}/api/upload/`;

    const response = await axios.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percentCompleted);
      }
    });

    const urls = response.data.imageUrls;
    setUploadedUrls(urls);

    if (onUploadComplete) {
      onUploadComplete(urls);  // Pass URLs instead of files
    }

    setUploadStatus({
      show: true,
      success: true,
      message: `Successfully uploaded ${files.length} file${files.length > 1 ? 's' : ''}`
    });

    // Clear files after successful upload
    setFiles([]);
    setPreviews([]);

  } catch (err) {
    console.error('Upload error details:', err.response?.data || err.message);
    setUploadStatus({
      show: true,
      success: false,
      message: `Upload failed: ${err.response?.data?.error?.msg || err.message}`
    });
  } finally {
    setIsUploading(false);
    setUploadProgress(0);
  }
};

  const removeFile = (index) => {
    if (previews[index]) {
      URL.revokeObjectURL(previews[index]);
    }
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setPreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  const renderPreview = (file, preview, index) => {
    // Add null check for file.type
    if (file.type && file.type.startsWith('image/')) {
      return (
        <img 
          src={preview} 
          alt={`Preview ${index}`} 
          className="w-32 h-32 object-cover rounded"
        />
      );
    } else {
      // PDF or other file type preview
      return (
        <div className="w-32 h-32 flex flex-col items-center justify-center bg-gray-100 rounded">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="mt-1 block text-sm text-gray-500 truncate px-2">
              {file.name}
            </span>
          </div>
        </div>
      );
    }
  };
return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          type="file"
          multiple
          onChange={onChange}
          accept={accept || '.pdf,.jpg,.jpeg,.png'}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        <button 
          type="button" 
          onClick={onSubmit}
          disabled={files.length === 0}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          Upload
        </button>
        
        <div className="flex flex-wrap gap-4 mt-4">
          {files.map((file, index) => (
            <div key={index} className="relative">
              {renderPreview(file, previews[index], index)}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </form>

      {uploadedUrls.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium">Uploaded Files:</h3>
          <ul className="mt-2 space-y-1">
            {uploadedUrls.map((url, index) => (
              <li key={index} className="text-sm text-gray-600 break-all">{url}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;