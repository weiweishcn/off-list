import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from './FileUpload';
import axios from 'axios';
import RoomTagger from './RoomTagger';
import RoomDetailsForm from './RoomDetailsForm';
import emailjs from '@emailjs/browser';
import { useTranslation } from 'react-i18next';
import { calculateTotalPrice } from './PricingCalculator';
import { loadStripe } from '@stripe/stripe-js';
import ReactPdfViewer from './PdfViewer';
import { designStyleData } from '../data/designStyleData';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);


const handlePayment = async (amountInCents, projectDetails) => {
  try {
    // Validate Stripe is loaded
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Failed to initialize Stripe');
    }

    console.log('Creating payment session...', {
      amount: amountInCents,
      projectDetails: {
        ...projectDetails,
        sensitive: '[REDACTED]'
      }
    });

    // Create Stripe session
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/create-payment-session`,
      {
        amount: amountInCents,
        projectDetails
      },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const { sessionId } = response.data;
    if (!sessionId) {
      throw new Error('No session ID received from server');
    }

    console.log('Redirecting to checkout...');
    
    // Redirect to checkout
    const { error } = await stripe.redirectToCheckout({
      sessionId
    });

    if (error) {
      console.error('Stripe redirect error:', error);
      throw error;
    }

  } catch (error) {
    console.error('Payment flow error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Payment processing failed');
  }
};

const ROOM_TYPES = [
  { id: 'bedroom', label: 'Bedroom', multiple: true },
  { id: 'kitchen', label: 'Kitchen', multiple: false },
  { id: 'bathroom', label: 'Bathroom', multiple: true },
  { id: 'livingRoom', label: 'Living Room', multiple: false },
  { id: 'diningRoom', label: 'Dining Room', multiple: false },
  { id: 'office', label: 'Office', multiple: true },
  { id: 'laundry', label: 'Laundry Room', multiple: false },
  { id: 'other', label: 'Other', multiple: true }
];


const RoomForm = ({ room, onUpdate, onRemove, projectFolder }) => {
  const { t } = useTranslation();
const handleRoomPhotoUpload = (urls, type) => {
  console.log('Room photo upload:', {
    urls,
    type,
    roomType: room.type,
    roomId: room.id,
    projectFolder
  });

  // Make sure we're getting the URLs
  if (!Array.isArray(urls) || urls.length === 0) {
    console.log('No URLs received');
    return;
  }

  const existingPhotos = room.existingPhotos || [];
  const updatedRoom = {
    ...room,
    existingPhotos: [...existingPhotos, ...urls]
  };

  console.log('Updated room:', updatedRoom);
  onUpdate(updatedRoom);
};
  return (
    <div className="p-4 border rounded-lg mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{t('createDesign.roomForm.title')}</h3>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-800"
        >
          {t('createDesign.roomForm.removeRoom')}
        </button>
      </div>
      
      <div className="grid gap-4">
        {/* Room Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Room Type *
          </label>
          <select
            value={room.type}
            onChange={(e) => onUpdate({ ...room, type: e.target.value })}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Select a room type</option>
            {ROOM_TYPES.map(type => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('createDesign.steps.roomDetails.dimensions.squareFootage')}
          </label>
          <input
            type="number"
            value={room.squareFootage}
            onChange={(e) => onUpdate({ ...room, squareFootage: e.target.value })}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('createDesign.steps.roomDetails.dimensions.length')}
            </label>
            <input
              type="number"
              value={room.length}
              onChange={(e) => onUpdate({ ...room, length: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('createDesign.steps.roomDetails.dimensions.width')}
            </label>
            <input
              type="number"
              value={room.width}
              onChange={(e) => onUpdate({ ...room, width: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('createDesign.steps.roomDetails.dimensions.height')}
            </label>
            <input
              type="number"
              value={room.height}
              onChange={(e) => onUpdate({ ...room, height: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
          </div>
        {/* Existing Room Photos */}
        <div className="col-span-full">
          <label className="block text-sm font-medium mb-2">
            Current Room Photos
            <span className="block text-gray-500 text-xs mt-1">
              Upload photos of how the room currently looks
            </span>
          </label>
          <FileUpload
            onUploadComplete={(urls) => handleRoomPhotoUpload(urls, 'existing')}
            accept="image/jpeg,image/png,image/jpg"
            uploadType="existing"
            projectFolder={projectFolder}
            roomType={room.type}
            roomId={room.id}
          />
          {room.existingPhotos && room.existingPhotos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {room.existingPhotos.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Room photo ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      const updatedPhotos = room.existingPhotos.filter((_, i) => i !== index);
                      onUpdate({ ...room, existingPhotos: updatedPhotos });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove photo"
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
    </div>
  );
};

/*
// Define this outside the component, at the top of the file
const useAutoSave = (projectId, currentStep, formData) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const saveProgress = useCallback(async () => {
    if (!projectId || isSaving) return;

    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/progress`,
        {
          currentStep,
          ...formData,
          status: 'draft'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setIsSaving(false);
    }
  }, [projectId, currentStep, formData, isSaving]);

  // Auto-save when form data changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      saveProgress();
    }, 3000);

    return () => clearTimeout(debounceTimer);
  }, [saveProgress]);

  return { isSaving, lastSaved, saveProgress };
};
*/
const CreateDesign = () => {
  const { t } = useTranslation();
  
  // Your existing state declarations
  const form = useRef();
  const roomTaggerRef = useRef(null); // Add this ref at component level
  const navigate = useNavigate();
  const [showError, setShowError] = useState({ show: false, message: '' });
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDesignStyle, setSelectedDesignStyle] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [designType, setDesignType] = useState(null);
  const [roomDetails, setRoomDetails] = useState({});
  const [floorPlanUrls, setFloorPlanUrls] = useState([]);
  const [hasExistingFloorPlan, setHasExistingFloorPlan] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [taggedRooms, setTaggedRooms] = useState([]);
  const [roomCounter, setRoomCounter] = useState({});
  const [isProjectInitialized, setIsProjectInitialized] = useState(false);
    const [selectedPDFPage, setSelectedPDFPage] = useState(null);
  const [pdfPreviewUrl, setPDFPreviewUrl] = useState(null);
  const initializationAttempted = useRef(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
const [rooms, setRooms] = useState([
  { 
    id: 1, 
    type: '', 
    squareFootage: '', 
    length: '', 
    width: '', 
    height: '',
    existingPhotos: [],
    inspirationPhotos: []
  }
]);

  // Add this new state for image indices
  const [styleImageIndices, setStyleImageIndices] = useState(() => 
    Object.keys(designStyleData).reduce((acc, style) => {
      acc[style] = 0;
      return acc;
    }, {})
  );

  // Add these new handler functions at the component level
  const handlePrevImage = (e, style) => {
    e.stopPropagation();
    setStyleImageIndices(prev => ({
      ...prev,
      [style]: prev[style] === 0 ? designStyleData[style].length - 1 : prev[style] - 1
    }));
  };

  const handleNextImage = (e, style) => {
    e.stopPropagation();
    setStyleImageIndices(prev => ({
      ...prev,
      [style]: prev[style] === designStyleData[style].length - 1 ? 0 : prev[style] + 1
    }));
  };

  const handleDotClick = (e, style, index) => {
    e.stopPropagation();
    setStyleImageIndices(prev => ({
      ...prev,
      [style]: index
    }));
  };

const handleAddRoom = () => {
  const newRoom = { 
    id: Date.now(), 
    type: '', 
    squareFootage: '', 
    length: '', 
    width: '', 
    height: '',
    existingPhotos: [],
  };
  setRooms([...rooms, newRoom]);
};

const [homeInfo, setHomeInfo] = useState({
  totalBedrooms: '',
  totalBathrooms: '',
  totalSquareFootage: '',
  renderPhotos: ''
});
  const [roomTags, setRoomTags] = useState([]);

  // Add these new state variables to CreateDesign component
const [projectId, setProjectId] = useState(null);
const [projectFolder, setProjectFolder] = useState(null);

  const formData = {
    designType,
    homeInfo, 
    rooms: rooms.map(room => ({
    id: room.id,
    type: room.type,
    dimensions: {
      squareFootage: room.squareFootage,
      length: room.length,
      width: room.width,
      height: room.height
    },
    existingPhotos: room.existingPhotos || [],
    inspirationPhotos: room.inspirationPhotos || []
  })),
    hasExistingFloorPlan,
    floorPlanUrls,
    taggedRooms,
    roomDetails
  };

    const handleExistingPhotosUpload = (urls) => {
    onUpdate({
      ...room,
      existingPhotos: [...(room.existingPhotos || []), ...urls]
    });
  };

  const handleUpdateRoom = (updatedRoom) => {
    // Check if room type is being changed
    if (updatedRoom.type !== rooms.find(r => r.id === updatedRoom.id)?.type) {
      const roomType = ROOM_TYPES.find(t => t.id === updatedRoom.type);
      if (roomType && !roomType.multiple) {
        const existingCount = rooms.filter(r => r.type === updatedRoom.type).length;
        if (existingCount > 0) {
          setShowError({
            show: true,
            message: `Only one ${roomType.label} is allowed`
          });
          return;
        }
      }
    }
    
    setRooms(rooms.map(room => 
      room.id === updatedRoom.id ? updatedRoom : room
    ));
  };

  const handleRemoveRoom = (roomId) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter(room => room.id !== roomId));
    }
  };


  //const { isSaving, lastSaved, saveProgress } = useAutoSave(projectId, currentStep, formData);


// Add this function to load saved progress
const loadSavedProgress = async (projectId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/projects/${projectId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error loading saved progress:', error);
    return null;
  }
};

  const handleTaggedFloorPlanNext = async () => {
    try {
      if (roomTaggerRef.current) {
        const taggedUrl = await roomTaggerRef.current.captureAndUploadTags();
        if (taggedUrl) {
          setFloorPlanUrls(prev => [...prev, taggedUrl]);
          setCurrentStep(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error handling next:', error);
      setShowError({
        show: true,
        message: 'Failed to save tagged floor plan. Please try again.'
      });
    }
  };

// Modify useEffect to initialize project on component mount
  useEffect(() => {
    const initializeProject = async () => {
      // Check if we've already attempted initialization
      if (initializationAttempted.current) {
        return;
      }
      
      // Mark that we've attempted initialization
      initializationAttempted.current = true;

      try {
        const token = localStorage.getItem('token');
        const userEmail = localStorage.getItem('username');

        if (!token || !userEmail) {
          setShowError({
            show: true,
            message: 'Please log in to create a design'
          });
          navigate('/login');
          return;
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/projects/initialize`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setProjectId(response.data.projectId);
        setProjectFolder(response.data.projectFolder);
        setIsProjectInitialized(true);
        console.log("Project initialized with ID:", response.data.projectId);

      } catch (error) {
        console.error('Error initializing project:', error);
        setShowError({
          show: true,
          message: error.response?.data?.message || 'Failed to initialize project'
        });
      }
    };

    initializeProject();
  }, []); // Keep empty dependency array

// Modify FileUpload usage to include project folder
<FileUpload
  onUploadComplete={(urls) => {
    console.log('Floor plan URLs received:', urls);
    setFloorPlanUrls(urls);
  }}
  accept="application/pdf,image/jpeg,image/png"
  uploadType="floor_plan"
  projectFolder={projectFolder}  // Add this prop
/>


  const handleRoomTypeSelect = (roomType) => {
    setSelectedRoomType(roomType);
  };

  const handleRoomTag = (coordinates) => {
    if (!selectedRoomType) return;
    
    // Update room counter
    const currentCount = roomCounter[selectedRoomType.id] || 0;
    const newCount = currentCount + 1;
    
    // Check if multiple rooms of this type are allowed
    if (!selectedRoomType.multiple && currentCount > 0) {
      setShowError({
        show: true,
        message: `Only one ${selectedRoomType.label} can be added`
      });
      return;
    }

    // Generate room name with counter if needed
    const roomName = selectedRoomType.multiple 
      ? `${selectedRoomType.label} ${newCount}`
      : selectedRoomType.label;

    const newRoom = {
      id: Date.now(),
      type: selectedRoomType.id,
      name: roomName,
      coordinates,
      details: {
        squareFootage: '',
        length: '',
        width: '',
        height: ''
      }
    };

    setTaggedRooms([...taggedRooms, newRoom]);
    setRoomCounter({
      ...roomCounter,
      [selectedRoomType.id]: newCount
    });
  };

  const handleUpdateRoomDetails = (roomId, details) => {
    setTaggedRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId
          ? { ...room, details: { ...room.details, ...details } }
          : room
      )
    );
  };

  const sendSupportEmail = async () => {
    try {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userName'); // Make sure you store user's email during login
      
      const templateParams = {
        user_email: userEmail,
        design_type: designType,
        message: `Customer needs assistance creating a floor plan for ${designType} project.`,
        to_email: 'support@pencildogs.com'
      };

      const result = await emailjs.send(
        'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
        templateParams,
        'YOUR_PUBLIC_KEY' // Replace with your EmailJS public key
      );

      console.log('Email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  };

// Modified questions array definition
// Replace the existing questions array in CreateDesign.js
const questions = [
  {
    label: t('createDesign.steps.designType.title'),
    type: 'designType',
    description: t('createDesign.steps.designType.description')
  },
  {
    label: 'Home Information',
    type: 'homeInfo',
    description: 'Tell us about your home'
  },
  {
    label: 'Design Style',
    type: 'designStyle',
    description: 'Choose your preferred design style'
  },
  {
    label: t('createDesign.steps.floorPlan.title'),
    type: 'floorPlanChoice',
    description: t('createDesign.steps.floorPlan.description')
  },
  ...(hasExistingFloorPlan === true ? [
    {
      label: t('createDesign.floorplan.current'),
      type: 'floorPlanUpload',
      description: t('createDesign.floorplan.currentDesc')
    }
  ] : []),
  {
    label: t('createDesign.steps.roomDetails.title'),
    type: 'rooms',
    description: t('createDesign.steps.roomDetails.description')
  },
  {
    label: t('createDesign.steps.pricing.title'),
    type: 'pricingReview',
    description: t('createDesign.steps.pricing.description')
  }
].filter(Boolean); // Remove any undefined entries

// Add a debug log to track the questions array
console.log('Current questions:', {
  total: questions.length,
  types: questions.map(q => q.type),
  hasExistingFloorPlan
});

const handleNext = async () => {
  console.log("handlenext triggered");
  if (!isCurrentStepValid()) {
    setShowValidation(true);
    return;
  }
  const currentQuestion = questions[currentStep];
  console.log("handlenext triggered");

    console.log("handleNext triggered, current step:", currentStep);
  
  if (!isCurrentStepValid()) {
    console.log("Validation failed");
    setShowValidation(true);
    return;
  }

  console.log("Current question type:", currentQuestion.type);

  // Special handling for room tagging step
  if (currentQuestion.type === 'roomTagging') {
    console.log("updating tagged floor plan");
    try {
      if (roomTaggerRef.current) {
        console.log('Capturing and uploading tagged floor plan...');
        const taggedUrl = await roomTaggerRef.current.captureAndUploadTags();
        if (taggedUrl) {
          console.log('Tagged floor plan uploaded successfully:', taggedUrl);
          setFloorPlanUrls(prev => [...prev, taggedUrl]);
          setCurrentStep(prev => prev + 1);
          setShowValidation(false);
        }
      }
      return;
    } catch (error) {
      console.error('Error handling room tagging next:', error);
      setShowError({
        show: true,
        message: 'Failed to save tagged floor plan. Please try again.'
      });
      return;
    }
  }

// Inside handleNext function where rooms are saved
if (currentQuestion.type === 'rooms') {
  try {
    const token = localStorage.getItem('token');
    
    // Filter out rooms with no data entered
    const roomsWithData = rooms.filter(room => 
      room.type || room.squareFootage || room.length || room.width || room.height || 
      (Array.isArray(room.existingPhotos) && room.existingPhotos.length > 0)
    );
    
    // Format rooms data properly for the backend, but only for rooms that have data
    const formattedRooms = roomsWithData.map(room => ({
      id: room.id,
      type: room.type,
      squareFootage: parseFloat(room.squareFootage) || null,
      length: parseFloat(room.length) || null,
      width: parseFloat(room.width) || null,
      height: parseFloat(room.height) || null,
      existingPhotos: Array.isArray(room.existingPhotos) ? room.existingPhotos : []
    }));
    
    // Save progress before moving to next step
    console.log('Saving progress with rooms:', formattedRooms);
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/progress`,
      {
        currentStep,
        designType,
        style: selectedDesignStyle,
        hasExistingFloorPlan,
        floorPlanUrls,
        rooms: formattedRooms, // Only save rooms with data
        roomDetails,
        status: 'draft',
        s3FolderPath: projectFolder,
        homeInfo: {
          totalBedrooms: parseInt(homeInfo.totalBedrooms) || null,
          totalBathrooms: parseFloat(homeInfo.totalBathrooms) || null,
          totalSquareFootage: parseInt(homeInfo.totalSquareFootage) || null,
          photoRequested: parseInt(homeInfo.renderPhotos) || null,
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Progress saved successfully');
    setShowValidation(false);
  } catch (error) {
    console.error('Error saving progress:', error);
    setShowError({
      show: true,
      message: 'Failed to save progress. Please try again.'
    });
  }
}

  // If we're on the pricing review step, redirect to Stripe
  if (currentQuestion.type === 'pricingReview') {
  try {
    setShowError({ show: false, message: '' });
    
    // Calculate total price based on total square footage
    const squareFootage = parseFloat(homeInfo.totalSquareFootage);
    if (!squareFootage || isNaN(squareFootage)) {
      throw new Error('Invalid square footage');
    }

    const ratePerSqFt = 1.00; // $1 per square foot
    const totalPrice = squareFootage * ratePerSqFt;
    const depositAmount = totalPrice * 0.6; // 60% deposit

    const userEmail = localStorage.getItem('username');
    const isPencildogsUser = userEmail?.endsWith('@pencildogs.com');
    
    // Convert to cents and ensure it's a valid integer
    const amountInCents = isPencildogsUser 
      ? 50 // 50 cent for Pencildogs users
      : Math.round(depositAmount * 100); // Normal price in cents

    await handlePayment(amountInCents, {
      projectId,
      rooms,
      homeInfo,
      pricing: {
        totalPrice,
        deposit: depositAmount,
        remaining: totalPrice * 0.4
      }
    });

  } catch (error) {
    console.error('Payment flow error:', error);
    setShowError({
      show: true,
      message: error.message
    });
  }
  return;
}

  // For non-payment steps, proceed normally
  setCurrentStep(prev => prev + 1);
  setShowValidation(false);
  console.log('Regular step progression');
  console.log('Current step:', currentStep);
  console.log('Next step:', currentStep + 1);
  console.log('Next question type:', questions[currentStep + 1]?.type);
  
};

const isCurrentStepValid = () => {
  const currentQuestion = questions[currentStep];
  console.log('=== Validating Step ===');
  console.log('Current step:', currentStep);
  console.log('Question type:', currentQuestion.type);
  
  switch (currentQuestion.type) {
    case 'designType':
      console.log('Design type validation:', { designType });
      return designType !== null;
      
    case 'homeInfo':
      console.log('Home info validation:', { homeInfo });
      return Boolean(
        homeInfo.totalBedrooms && 
        homeInfo.totalBathrooms && 
        homeInfo.totalSquareFootage
      );
      
    case 'floorPlanChoice':
      console.log('Floor plan choice validation:', { hasExistingFloorPlan });
      return hasExistingFloorPlan !== null;
      
    case 'floorPlanUpload':
      console.log('Floor plan upload validation:', { hasExistingFloorPlan, floorPlanUrls });
      return !hasExistingFloorPlan || floorPlanUrls.length > 0;
      
    case 'rooms':
      // If there are no rooms or no room data entered, just return true
      if (!rooms.length || !rooms.some(room => room.type || room.squareFootage)) {
        console.log('No room data entered - allowing progression');
        return true;
      }
      
      // Only validate rooms that have any data entered
      const roomsWithData = rooms.filter(room => 
        room.type || room.squareFootage || room.length || room.width || room.height
      );
      
      // Log validation state for debugging
      const roomValidations = roomsWithData.map(room => ({
        id: room.id,
        type: room.type,
        hasSquareFootage: Boolean(room.squareFootage),
        isValid: Boolean(room.type && room.squareFootage)
      }));
      console.log('Rooms validation:', roomValidations);
      
      // If any room has data, make sure it's complete
      return roomsWithData.length === 0 || 
             roomsWithData.every(room => room.type && room.squareFootage);
      
      
    default:
      console.log('Default validation - returning true');
      return true;
  }
};

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!designType) {
        setShowError({
          show: true,
          message: 'Please select a design type before submitting.'
        });
        return;
      }

      if (!token) {
        setShowError({ 
          show: true, 
          message: 'Please log in to submit your design request.' 
        });
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL;
      
      const isValid = rooms.every(room => {
        const details = roomDetails[room.id];
        return room.type && 
               room.squareFootage && 
               details?.style && 
               details?.description;
      });

      if (!isValid) {
        setShowError({
          show: true,
          message: 'Please complete all required fields for each room.'
        });
        return;
      }

      const formattedRooms = rooms.map(room => ({
        type: room.type,
        dimensions: {
          squareFootage: room.squareFootage,
          length: room.length || null,
          width: room.width || null,
          height: room.height || null
        },
        designPreferences: roomDetails[room.id] || {},
      }));

      const response = await axios.post(
        `${apiUrl}/api/projects`, 
        {
          designType: designType,
          rooms: formattedRooms,
          hasFloorPlan: hasExistingFloorPlan,
          originalFloorPlanUrl: floorPlanUrls[0],
          taggedFloorPlanUrl: floorPlanUrls[1]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting design:', error);
      setShowError({
        show: true,
        message: error.response?.data?.error || 'Failed to submit design. Please try again.'
      });
    }
  };

  const handleSaveForLater = async () => {
      navigate('/dashboard', { 
        state: { 
          message: 'Project saved successfully! You can complete payment later from your dashboard.' 
        }
      });
};

  const renderCurrentStep = () => {
    if (currentStep < 0 || currentStep >= questions.length) {
    return null;
  }
    const currentQuestion = questions[currentStep];
  if (!currentQuestion) {
    console.error('No question found for step:', currentStep);
    return null;
  }
    switch (currentQuestion.type) {
      case 'designType':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">{currentQuestion.label}</h2>
            <p className="text-gray-600 mb-4">{currentQuestion.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                className={`p-6 rounded-lg border-2 transition-all ${
                  designType === 'virtual-staging'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => setDesignType('virtual-staging')}
              >
                <h3 className="text-lg font-medium mb-2">Virtual Staging</h3>
                <p className="text-gray-600 text-sm">
                  Transform empty spaces with virtual furniture and decor for real estate listings
                </p>
              </button>
              
              <button
                className={`p-6 rounded-lg border-2 transition-all ${
                  designType === 'remodeling'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => setDesignType('remodeling')}
              >
                <h3 className="text-lg font-medium mb-2">Remodeling Design</h3>
                <p className="text-gray-600 text-sm">
                  Get professional design plans for remodeling your existing space
                </p>
              </button>
            </div>
          </div>
        );

// ... earlier code remains the same

case 'homeInfo':
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">{currentQuestion.label}</h2>
      <p className="text-gray-600 mb-4">{currentQuestion.description}</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Bedrooms *
          </label>
          <input
            type="number"
            min="1"
            value={homeInfo.totalBedrooms}
            onChange={(e) => setHomeInfo(prev => ({
              ...prev,
              totalBedrooms: e.target.value
            }))}
            className="w-full p-2 border rounded-md"
            placeholder="Enter number of bedrooms"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Bathrooms *
          </label>
          <input
            type="number"
            min="1"
            step="0.5"
            value={homeInfo.totalBathrooms}
            onChange={(e) => setHomeInfo(prev => ({
              ...prev,
              totalBathrooms: e.target.value
            }))}
            className="w-full p-2 border rounded-md"
            placeholder="Enter number of bathrooms"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Total Square Footage *
          </label>
          <input
            type="number"
            min="1"
            value={homeInfo.totalSquareFootage}
            onChange={(e) => setHomeInfo(prev => ({
              ...prev,
              totalSquareFootage: e.target.value
            }))}
            className="w-full p-2 border rounded-md"
            placeholder="Enter total square footage"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Render Photos Needed *
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={homeInfo.renderPhotos}
              onChange={(e) => setHomeInfo(prev => ({
                ...prev,
                renderPhotos: e.target.value
              }))}
              className="w-full p-2 border rounded-md"
              placeholder="Enter number of render photos needed"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              How many different views or angles would you like us to render?
            </p>
          </div>
        </div>
      </div>
    </div>
  );

case 'designStyle':
  // Create a state object to track current image index for each style
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">{currentQuestion.label}</h2>
      <p className="text-gray-600 mb-4">{currentQuestion.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(designStyleData).map(([style, images]) => (
          <div
            key={style}
            className={`cursor-pointer rounded-lg border-2 transition-all overflow-hidden ${
              selectedDesignStyle === style
                ? 'border-blue-600 ring-2 ring-blue-400'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedDesignStyle(style)}
          >
            <div className="relative">
              {/* Main Image Display */}
              <div className="relative w-full h-48 overflow-hidden">
                <img
                  src={images[styleImageIndices[style]].location}
                  alt={`${style} style example ${styleImageIndices[style] + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => handlePrevImage(e, style)}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all"
                      aria-label="Previous image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleNextImage(e, style)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all"
                      aria-label="Next image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                  {styleImageIndices[style] + 1} / {images.length}
                </div>

                {/* Selection Check Mark */}
                {selectedDesignStyle === style && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Style Name and Navigation Dots */}
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2">{style}</h3>
                
                {/* Navigation Dots */}
                {images.length > 1 && (
                  <div className="flex justify-center space-x-2 mt-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => handleDotClick(e, style, index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          styleImageIndices[style] === index 
                            ? 'bg-blue-600' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

      case 'rooms':
        return (
          <div className="space-y-4">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{currentQuestion.label}</h2>
              <p className="text-gray-600">{currentQuestion.description}</p>
            </div>

            {rooms.map((room) => (
              <RoomForm
                key={room.id}
                room={room}
                onUpdate={handleUpdateRoom}
                onRemove={() => handleRemoveRoom(room.id)}
                projectFolder={projectFolder} // Explicitly pass projectFolder
              />
            ))}

            <button
              type="button"
              onClick={handleAddRoom}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full"
            >
              Add Another Room
            </button>
          </div>
        );

case 'floorPlanChoice':
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-2">{currentQuestion.label}</h2>
        <p className="text-gray-600 mb-4">{currentQuestion.description}</p>
        
        <div className="flex flex-col space-y-4">
          <button
            className={`p-6 rounded-lg border-2 ${
              hasExistingFloorPlan === true
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-blue-300'
            }`}
            onClick={() => setHasExistingFloorPlan(true)}
          >
            <h3 className="text-lg font-medium mb-2">Yes, I have a floor plan</h3>
            <p className="text-gray-600 text-sm">
              I can provide an existing floor plan of my space
            </p>
          </button>
          
          <button
            className={`p-6 rounded-lg border-2 ${
              hasExistingFloorPlan === false
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-blue-300'
            }`}
            onClick={async () => {
              setHasExistingFloorPlan(false);
              
              // Show loading state
              setShowError({
                show: true,
                message: "Sending request to our support team..."
              });
              
              const emailSent = await sendSupportEmail();
              /*
              if (emailSent) {
                setShowError({
                  show: true,
                  message: "We've notified our support team about your floor plan request. They'll contact you soon to assist with creating your floor plan. Let's continue with your room details."
                });
                
                // Continue to next step after a short delay
                setTimeout(() => {
                  setShowError({ show: false, message: '' });
                  setCurrentStep(prev => prev + 1);
                }, 3000);
              } else {
                setShowError({
                  show: true,
                  message: "We couldn't send the notification automatically. Please email support@pencildogs.com directly for assistance with your floor plan. Let's continue with your room details."
                });
                // Still continue to next step
                setTimeout(() => {
                  setShowError({ show: false, message: '' });
                  setCurrentStep(prev => prev + 1);
                }, 3000);
              }
                */
            }}
          >
            <h3 className="text-lg font-medium mb-2">No, I need help creating one</h3>
            <p className="text-gray-600 text-sm">
              Request assistance from our team to create a floor plan
            </p>
          </button>
        </div>
      </div>
    );

      case 'floorPlanUpload':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">{currentQuestion.label}</h2>
            <p className="text-gray-600 mb-4">{currentQuestion.description}</p>
            
            <FileUpload
              onUploadComplete={(urls) => {
                console.log('Floor plan URLs received:', urls);
                setFloorPlanUrls(urls);
              }}
              accept="application/pdf,image/jpeg,image/png"
              uploadType="floor_plan"
              projectFolder={projectFolder}
            />

            {floorPlanUrls.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg">
                Floor plan uploaded successfully!
              </div>
            )}
          </div>
        );
case 'pricingReview':
  console.log('reached pricing review');
  const squareFootage = parseFloat(homeInfo.totalSquareFootage);
  const ratePerSqFt = 1.00;
  let totalPrice = squareFootage * ratePerSqFt;
  
  const userEmail = localStorage.getItem('username')
  const isPencildogsUser = userEmail.endsWith('@pencildogs.com');
  console.log("ispencildogsuser" + isPencildogsUser);
  if (isPencildogsUser) 
  {
    totalPrice = 1;
  }
    
  const deposit = totalPrice * 0.6;
  const remaining = totalPrice * 0.4;
  console.log(squareFootage);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">{currentQuestion.label}</h2>
        <p className="text-gray-600 mb-4">{currentQuestion.description}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Project Cost Breakdown</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <h4 className="font-medium">Total Square Footage</h4>
                <p className="text-sm text-gray-600">
                  {squareFootage} sq ft × ${ratePerSqFt.toFixed(2)}/sq ft
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">${totalPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t space-y-4">
            <div className="flex justify-between items-center text-gray-600">
              <div>
                <h4 className="text-lg">Total Project Cost</h4>
                <p className="text-sm">Based on total square footage</p>
              </div>
              <div className="text-right">
                <p className="text-lg">${totalPrice.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <h4 className="text-lg font-semibold text-blue-600">Required Deposit (60%)</h4>
                <p className="text-sm text-gray-600">Due to start your project</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  ${deposit.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center text-gray-600 text-sm">
              <div>
                <h4>Remaining Balance (40%)</h4>
                <p>Due upon design completion</p>
              </div>
              <div className="text-right">
                <p>${remaining.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={handleNext}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Pay Deposit and Start Project</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <button
              onClick={handleSaveForLater}
              className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Save Project and Pay Later</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h1a2 2 0 012 2v7a2 2 0 01-2 2H7a2 2 0 01-2-2V8a2 2 0 012-2h1v5.586l-1.293-1.293z" />
              </svg>
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Important Notes:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Pricing is calculated based on total home square footage</li>
              <li>• Current rate: $1.00 per square foot</li>
              <li>• 60% deposit is required to begin the project</li>
              <li>• Remaining 40% will be due upon design completion</li>
              <li>• You can save your project now and pay the deposit later</li>
              <li>• Design work will not begin until the deposit is paid</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

        
 case 'roomDetails':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{currentQuestion.label}</h2>
              <p className="text-gray-600">{currentQuestion.description}</p>
            </div>

            {rooms.map((room) => (
              <RoomForm
                key={room.id}
                room={room}
                onUpdate={handleUpdateRoom}
                onRemove={() => handleRemoveRoom(room.id)}
                projectFolder={projectFolder}
              />
            ))}

            <div className="mt-6">
              <button
                type="button"
                onClick={handleAddRoom}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Add Another Room</span>
              </button>
            </div>

            {showValidation && rooms.some(room => !room.type || !room.squareFootage) && (
              <p className="text-red-500 text-sm mt-2">
                Please fill in all required fields for each room
              </p>
            )}
          </div>
        );


// In CreateDesign.js, add logging to track the floor plan URL:
 case 'floorPlanUpload':
  console.log("upload via createdesign.js");
        const handleFileUpload = async (files) => {
          if (!files || files.length === 0) return;

          const file = files[0];
          if (file.type === 'application/pdf') {
            const objectUrl = URL.createObjectURL(file);
            setPDFPreviewUrl(objectUrl);
            setUploadedImageUrl(null);
          } else {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('projectFolder', projectFolder);  // Add this line

            try {
              const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/upload-floor-plan`,
                formData,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                }
              );
              setUploadedImageUrl(response.data.url);
              setFloorPlanUrls([response.data.url]);
              setPDFPreviewUrl(null);
            } catch (error) {
              console.error('Upload failed:', error);
              setShowError({
                show: true,
                message: 'Failed to upload file. Please try again.'
              });
            }
          }
        };

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">{currentQuestion.label}</h2>
            <p className="text-gray-600 mb-4">{currentQuestion.description}</p>
            
            <div className="space-y-6">
              <FileUpload
                onFileSelect={handleFileUpload}
                accept=".pdf,image/*"
                maxSize={10000000} // 10MB
              />

              {pdfPreviewUrl && (
                <div className="mt-4">
                  <ReactPdfViewer
                    pdfUrl={pdfPreviewUrl}
                    onPageSelect={(page) => setSelectedPDFPage(page)}
                    onSnapshotUpload={(imageUrl) => {
                      setUploadedImageUrl(imageUrl);
                      setFloorPlanUrls([imageUrl]);
                    }}
                  />
                </div>
              )}

              {uploadedImageUrl && (
                <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg">
                  Floor plan uploaded successfully!
                </div>
              )}

              {showValidation && !uploadedImageUrl && (
                <p className="text-red-500 text-sm">
                  Please upload a floor plan or select a page from your PDF
                </p>
              )}
            </div>
          </div>
        );

      case 'roomTagging':
        const currentFloorPlanUrl = floorPlanUrls[0];
        
        if (!currentFloorPlanUrl) {
          return (
            <p className="text-red-600">{t('createDesign.steps.roomTagging.noFloorPlan')}</p>
          );
        }

        // Define room types with translations
        const roomTypes = [
          { 
            id: 'bedroom',
            type: 'bedroom',
            label: t('createDesign.roomTypes.bedroom'),
            buttonText: t('createDesign.roomTypes.bedroom'),
            displayText: t('createDesign.roomTypes.bedroom'),
            multiple: true 
          },
          { 
            id: 'masterBedroom',
            type: 'masterBedroom',
            label: t('createDesign.roomTypes.masterBedroom'),
            buttonText: t('createDesign.roomTypes.masterBedroom'),
            displayText: t('createDesign.roomTypes.masterBedroom'),
            multiple: false 
          },
          { 
            id: 'bathroom',
            type: 'bathroom',
            label: t('createDesign.roomTypes.bathroom'),
            buttonText: t('createDesign.roomTypes.bathroom'),
            displayText: t('createDesign.roomTypes.bathroom'),
            multiple: true 
          },
          { 
            id: 'kitchen',
            type: 'kitchen',
            label: t('createDesign.roomTypes.kitchen'),
            buttonText: t('createDesign.roomTypes.kitchen'),
            displayText: t('createDesign.roomTypes.kitchen'),
            multiple: false 
          },
          { 
            id: 'livingRoom',
            type: 'livingRoom',
            label: t('createDesign.roomTypes.livingRoom'),
            buttonText: t('createDesign.roomTypes.livingRoom'),
            displayText: t('createDesign.roomTypes.livingRoom'),
            multiple: false 
          },
          { 
            id: 'diningRoom',
            type: 'diningRoom',
            label: t('createDesign.roomTypes.diningRoom'),
            buttonText: t('createDesign.roomTypes.diningRoom'),
            displayText: t('createDesign.roomTypes.diningRoom'),
            multiple: false 
          },
          { 
            id: 'office',
            type: 'office',
            label: t('createDesign.roomTypes.office'),
            buttonText: t('createDesign.roomTypes.office'),
            displayText: t('createDesign.roomTypes.office'),
            multiple: true 
          },
          { 
            id: 'laundry',
            type: 'laundry',
            label: t('createDesign.roomTypes.laundry'),
            buttonText: t('createDesign.roomTypes.laundry'),
            displayText: t('createDesign.roomTypes.laundry'),
            multiple: false 
          }
        ];

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">
              {t('createDesign.steps.roomTagging.title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('createDesign.steps.roomTagging.description')}
            </p>
            <div className="bg-white rounded-lg shadow-sm">
              <RoomTagger
                ref={roomTaggerRef}
                floorPlanUrl={currentFloorPlanUrl}
                rooms={roomTypes}
                onTagsUpdate={(newTags) => {
                  setTaggedRooms(newTags);
                }}
                isPreviewMode={false}
                initialTags={taggedRooms}
                projectFolder={projectFolder}
                translations={{
                  title: t('createDesign.steps.roomTagging.title'),
                  description: t('createDesign.steps.roomTagging.description'),
                  noFloorPlan: t('createDesign.steps.roomTagging.noFloorPlan'),
                  roomTypes: roomTypes.reduce((acc, type) => ({
                    ...acc,
                    [type.id]: type.buttonText
                  }), {})
                }}
                displayNames={roomTypes.reduce((acc, type) => ({
                  ...acc,
                  [type.id]: type.displayText
                }), {})}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // ... rest of the component (navigation, dialogs, etc.) remains similar

return (
  <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">
          Step {currentStep + 1} of {questions.length}
        </p>
      </div>

      {renderCurrentStep()}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        {currentStep > 0 && (
          <button
            type="button"
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('createDesign.navigation.back')}
          </button>
        )}
        
        {/* Show next button for all steps except the final payment action in pricing review */}
{/* Navigation buttons */}
<div className="flex justify-between mt-8">
  {/* Show next button for all steps except when we're on pricingReview */}
  {questions[currentStep]?.type !== 'pricingReview' && (
    <button
      type="button"
      onClick={handleNext}
      disabled={false}
      className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
    >
      {t('createDesign.navigation.next')}
    </button>
  )}
</div>
      </div>
    </div>
  </div>
);
};

export default CreateDesign;