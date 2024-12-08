import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import FileUpload from './FileUpload';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dialog = ({ isOpen, onClose, title, description, onConfirm, showCancel = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        <div className="flex justify-end space-x-4">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showCancel ? 'Confirm' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateDesign = () => {
  const form = useRef();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const [currentSpaceUrls, setCurrentSpaceUrls] = useState([]);
  const [inspirationUrls, setInspirationUrls] = useState([]);
  const [floorPlanUrls, setFloorPlanUrls] = useState([]);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    from_name: '',
    user_email: '',
    room_type: '',
    length: '',
    width: '',
    height: '',
    color: '',
    pattern: '',
    zipcode: '',
    message: '',
    current_space_photos: '',
    inspiration_photos: '',
    floor_plan_files: ''
  });

  const questions = [
    { label: "What's your name?", key: 'from_name', type: 'text', placeholder: 'Enter your full name' },
    { label: "What's your email?", key: 'user_email', type: 'email', placeholder: 'Enter your email address' },
    { label: "What type of room are you designing?", key: 'room_type', type: 'text', placeholder: 'e.g., Kitchen, Living Room, Bathroom' },
    { 
      label: "What are the room's dimensions?", 
      multiField: true,
      fields: [
        { key: 'length', placeholder: 'Length (ft)', type: 'number' },
        { key: 'width', placeholder: 'Width (ft)', type: 'number' },
        { key: 'height', placeholder: 'Height (ft)', type: 'number' }
      ]
    },
    { label: "Do you have any color preferences?", key: 'color', type: 'text', placeholder: 'e.g., Earth tones, Bright colors, Neutrals' },
    { label: "Any pattern preferences?", key: 'pattern', type: 'text', placeholder: 'e.g., Modern, Traditional, Minimalist' },
    { label: "What's your zip code?", key: 'zipcode', type: 'text', placeholder: 'Enter your zip code' },
    { 
      label: "Upload your floor plan (optional)", 
      type: 'upload', 
      uploadLabel: 'Floor Plan', 
      uploadType: 'floor_plan',
      acceptedFileTypes: 'application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png', 
      description: 'Upload PDF or image files (max 100MB)'
    },
    { 
      label: "Upload photos of your current space", 
      type: 'upload', 
      uploadLabel: 'Current Space Photos', 
      uploadType: 'current_space',
      acceptedFileTypes: '.jpg,.jpeg,.png',
      description: 'Upload image files (max 100MB)'
    },
    { 
      label: "Upload inspiration photos", 
      type: 'upload', 
      uploadLabel: 'Inspiration Photos', 
      uploadType: 'inspiration',
      acceptedFileTypes: '.jpg,.jpeg,.png',
      description: 'Upload image files (max 100MB)'
    },
    { label: "Any additional details we should know?", key: 'message', type: 'textarea', placeholder: 'Tell us more about your vision...' }
  ];

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFloorPlanUpload = async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append("uploadFiles", file);
    });

    try {
      const response = await axios.post('http://localhost:3001/api/upload-floor-plan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const urls = response.data.floorPlanUrls;
      setFloorPlanUrls(urls);
      return urls;
    } catch (error) {
      console.error('Floor plan upload failed:', error);
      throw error;
    }
  };

const validateFiles = (files, type) => {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const allowedPDFTypes = ['application/pdf'];

  return files.every(file => {
    // Check file size
    if (file.size > maxSize) {
      throw new Error('File size must be less than 100MB');
    }

    // Check file type
    if (type === 'floor_plan') {
      if (![...allowedImageTypes, ...allowedPDFTypes].includes(file.mimetype)) {
        throw new Error('Floor plan must be PDF, JPG, or PNG');
      }
    } else {
      if (!allowedImageTypes.includes(file.mimetype)) {
        throw new Error('Images must be JPG or PNG');
      }
    }

    return true;
  });
};

const handleUploadComplete = async (urls, type) => {  // Change parameter from 'files' to 'urls'
  try {
    switch(type) {
      case 'floor_plan':
        setFloorPlanUrls(urls);
        setFormData(prev => ({
          ...prev,
          floor_plan_files: urls.join(', ')
        }));
        setShowUploadSuccess(true);
        setUploadSuccessMessage(`Successfully uploaded floor plan`);
        break;

      case 'current_space':
        setCurrentSpaceUrls(urls);
        setFormData(prev => ({
          ...prev,
          current_space_photos: urls.join(', ')
        }));
        break;

      case 'inspiration':
        setInspirationUrls(urls);
        setFormData(prev => ({
          ...prev,
          inspiration_photos: urls.join(', ')
        }));
        break;

      default:
        console.warn('Unknown upload type:', type);
    }
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Upload failed: ' + error.message);
  }
};

  const isCurrentStepValid = () => {
    if (currentStep >= questions.length) return true;
    const question = questions[currentStep];
    
    if (question.multiField) {
      return question.fields.every(field => formData[field.key]?.trim());
    }
    if (question.type === 'upload') return true;
    return formData[question.key]?.trim();
  };

  const hasUnsavedChanges = () => {
    return Object.values(formData).some(value => value !== '') || currentStep > 0;
  };

  const handleHomeClick = () => {
    if (hasUnsavedChanges()) {
      setShowHomeConfirm(true);
    } else {
      navigate('/dashboard');
    }
  };

  const handleNext = () => {
    if (isCurrentStepValid()) {
      if (currentStep < questions.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setShowConfirm(true);
      }
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    const formElement = form.current;
    Object.entries(formData).forEach(([key, value]) => {
      const input = formElement.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = value;
      }
    });

    emailjs
      .sendForm('service_mvjkasf', 'template_is4zoid', formElement, {
        publicKey: 'txupk1NbFN0mcpUCJ',
      })
      .then(
        () => {
          setShowConfirm(false);
          setShowSuccess(true);
          setTimeout(() => {
            navigate('/');
          }, 3000);
        },
        (error) => {
          alert("Failed to send request: " + error);
        },
      );
  };

  const renderCurrentQuestion = () => {
    if (currentStep >= questions.length) return null;
    const question = questions[currentStep];

    return (
      <div className="space-y-4 transition-all duration-500 ease-in-out">
        <h2 className="text-2xl font-semibold mb-6">{question.label}</h2>
        
        {question.type === 'upload' ? (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-600 mb-4">{question.uploadLabel}</p>
            <p className="text-sm text-gray-500 mb-4">{question.description}</p>
            <FileUpload 
              key={`upload-${currentStep}`}
              onUploadComplete={(urls) => handleUploadComplete(urls, question.uploadType)}
              accept={question.acceptedFileTypes}
              uploadType={question.uploadType}
            />
          </div>
        ) : question.multiField ? (
          <div className="grid grid-cols-3 gap-4">
            {question.fields.map((field) => (
              <input
                key={field.key}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.key]}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ))}
          </div>
        ) : (
          question.type === 'textarea' ? (
            <textarea
              value={formData[question.key]}
              onChange={(e) => handleInputChange(question.key, e.target.value)}
              placeholder={question.placeholder}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
            />
          ) : (
            <input
              type={question.type}
              value={formData[question.key]}
              onChange={(e) => handleInputChange(question.key, e.target.value)}
              placeholder={question.placeholder}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <button
        onClick={handleHomeClick}
        className="fixed top-4 left-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        Home
      </button>

      <div className="max-w-2xl mx-auto">
        <form ref={form} onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {Object.keys(formData).map(key => (
            <input key={key} type="hidden" name={key} />
          ))}
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${(currentStep / questions.length) * 100}%` }}
            ></div>
          </div>

          {renderCurrentQuestion()}

          <div className="flex justify-between pt-6">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!isCurrentStepValid()}
              className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {currentStep === questions.length - 1 ? 'Review' : 'Next'}
            </button>
          </div>
        </form>

        <Dialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          title="Confirm Design Request"
          description="Please review your design request carefully. Once submitted, it cannot be modified. Are you sure you want to proceed?"
          onConfirm={handleSubmit}
        />

        <Dialog
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          title="Request Sent Successfully!"
          description="Thank you for your design request. We'll review it and get back to you soon. Redirecting you to the homepage..."
          onConfirm={() => setShowSuccess(false)}
          showCancel={false}
        />

        <Dialog
          isOpen={showHomeConfirm}
          onClose={() => setShowHomeConfirm(false)}
          title="Return to Home?"
          description="You have unsaved changes. If you leave now, your design request progress will be lost. Are you sure you want to continue?"
          onConfirm={() => navigate('/dashboard')}
        />
      </div>
    </div>
  );
};

export default CreateDesign;