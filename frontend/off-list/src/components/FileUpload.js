import axios from 'axios';
import React, { useState } from 'react';

const FileUpload = ({ onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);

  const resetImages = () => {
    setFiles([]);
    setPreviews([]);
    setUploadedUrls([]);
  };

  const onChange = e => {
    const newFiles = Array.from(e.target.files);
    
    // Add new files to existing files
    setFiles(prevFiles => [...prevFiles, ...newFiles]);

    // Generate previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Please select files to upload");
      return;
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append("uploadImages", file);
    });

    try {
      const response = await axios.post('http://localhost:3001/api/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Store the uploaded image URLs
      const imageUrls = response.data.imageUrls;
      setUploadedUrls(imageUrls);

      // Call the onUploadComplete prop with the URLs if provided
      if (onUploadComplete) {
        onUploadComplete(imageUrls);
      }

      alert("Upload success!");
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + err.message);
    }
  };

  const removeImage = (indexToRemove) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setPreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          type='file'
          multiple
          onChange={onChange}
          accept=".jpg,.jpeg,.png"
        />
        <button 
          type="button" 
          onClick={onSubmit}
          disabled={files.length === 0}
        >
          Upload
        </button>
        
        <div className="flex flex-wrap gap-4 mt-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative">
              <img 
                src={preview} 
                alt={`Preview ${index}`} 
                className="w-32 h-32 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
              >
                X
              </button>
            </div>
          ))}
        </div>
      </form>

      {/* Optional: Display uploaded image URLs */}
      {uploadedUrls.length > 0 && (
        <div className="mt-4">
          <h3>Uploaded Image URLs:</h3>
          <ul>
            {uploadedUrls.map((url, index) => (
              <li key={index} className="break-all">{url}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;