import axios from 'axios';
import React, { useState } from 'react';

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const resetImages = () => {
    setFiles([]);
    setPreviews([]);
    // Optional: Call parent component's reset method if needed
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
    const formData = new FormData();
    files.forEach(file => {
      formData.append("uploadImages", file);
    });

    try {
      await axios.post('http://localhost:3001/api/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
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
        />
        <button 
          type="button" 
          onClick={onSubmit}
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
    </div>
  );
};

export default FileUpload;