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

const stripePromise = loadStripe(import.meta.env.REACT_APP_STRIPE_PUBLIC_KEY);

const RoomForm = ({ room, onUpdate, onRemove }) => {
  const { t } = useTranslation();
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
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('createDesign.steps.roomDetails.dimensions.title')}
          </label>
          <input
            type="text"
            value={room.type}
            onChange={(e) => onUpdate({ ...room, type: e.target.value })}
            className="w-full p-2 border rounded-md"
          />
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
        </div>
      </div>
    </div>
  );
};


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
        `${import.meta.env.REACT_APP_API_URL}/api/projects/${projectId}/progress`,
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

const CreateDesign = () => {
  const { t } = useTranslation();
  
  // Your existing state declarations
  const form = useRef();
  const roomTaggerRef = useRef(null); // Add this ref at component level
  const navigate = useNavigate();
  const [showError, setShowError] = useState({ show: false, message: '' });
  const [currentStep, setCurrentStep] = useState(0);
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
    const [selectedPDFPage, setSelectedPDFPage] = useState(null);
  const [pdfPreviewUrl, setPDFPreviewUrl] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [rooms, setRooms] = useState([
    { id: 1, type: '', squareFootage: '', length: '', width: '', height: '' }
  ]);
  const [roomTags, setRoomTags] = useState([]);

  // Add these new state variables to CreateDesign component
const [projectId, setProjectId] = useState(null);
const [projectFolder, setProjectFolder] = useState(null);

  const formData = {
    designType,
    hasExistingFloorPlan,
    floorPlanUrls,
    taggedRooms,
    roomDetails
  };


  const { isSaving, lastSaved, saveProgress } = useAutoSave(projectId, currentStep, formData);


// Add this function to load saved progress
const loadSavedProgress = async (projectId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${import.meta.env.REACT_APP_API_URL}/api/projects/${projectId}`,
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

// Add initializeProject function
const initializeProject = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowError({
        show: true,
        message: 'Please log in to create a design'
      });
      return false;
    }

    const response = await axios.post(
      `${import.meta.env.REACT_APP_API_URL}/api/projects/initialize`,
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
    return true;

  } catch (error) {
    console.error('Error initializing project:', error);
    setShowError({
      show: true,
      message: error.response?.data?.message || 'Failed to initialize project'
    });
    return false;
  }
};

// Modify useEffect to initialize project on component mount
useEffect(() => {
  initializeProject();
}, []);


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
      const userEmail = localStorage.getItem('userEmail'); // Make sure you store user's email during login
      
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

  const questions = [
    {
      label: t('createDesign.steps.designType.title'),
      type: 'designType',
      description: t('createDesign.steps.designType.description')
    },
    {
      label: t('createDesign.steps.floorPlan.title'),
      type: 'floorPlanChoice',
      description: t('createDesign.steps.floorPlan.description')
    },
    {
      label: t('roomForm.upload.current'),
      type: 'floorPlanUpload',
      description: t('roomForm.upload.currentDesc'),
      show: hasExistingFloorPlan === true
    },
    {
      label: t('navigation.progress', { current: 3, total: 5 }),
      type: 'roomTagging',
      description: t('createDesign.steps.roomDetails.description'),
      show: hasExistingFloorPlan === true && floorPlanUrls.length > 0
    },
    {
      label: t('createDesign.steps.roomDetails.title'),
      type: 'roomDetails',
      description: t('createDesign.steps.roomDetails.description')
    },
    {
      label: t('createDesign.steps.pricing.title'),
      type: 'pricingReview',
      description: t('createDesign.steps.pricing.description')
    }
  ].filter(q => {
    // If show property exists, use it for filtering, otherwise show the question
    return q.hasOwnProperty('show') ? q.show : true;
  });


  const handleAddRoom = () => {
    setRooms([
      ...rooms,
      { id: Date.now(), type: '', squareFootage: '', length: '', width: '', height: '' }
    ]);
  };

  const handleUpdateRoom = (updatedRoom) => {
    setRooms(rooms.map(room => 
      room.id === updatedRoom.id ? updatedRoom : room
    ));
  };

  const handleRemoveRoom = (roomId) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter(room => room.id !== roomId));
    }
  };

const handleNext = async () => {
  console.log("handlenext triggered");
  if (!isCurrentStepValid()) {
    setShowValidation(true);
    return;
  }
  const currentQuestion = questions[currentStep];
  console.log("handlenext triggered");
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

  // If we're on the pricing review step, redirect to Stripe
  if (currentQuestion.type === 'pricingReview') {
    try {
      setShowError({ show: false, message: '' });
      
      // Calculate the final price
      const pricingData = calculateTotalPrice(taggedRooms.map(room => ({
        ...room,
        ...roomDetails[room.id]
      })));

      // Create a payment session on your backend
      const response = await axios.post(
        `${import.meta.env.REACT_APP_API_URL}/api/create-payment-session`,
        {
          amount: pricingData.total, // Amount in cents
          projectDetails: {
            designType,
            rooms: taggedRooms.map(room => ({
              ...room,
              details: roomDetails[room.id]
            })),
            pricing: pricingData
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Get the Stripe session ID from the response
      const { sessionId } = response.data;

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId
      });

      if (error) {
        setShowError({
          show: true,
          message: 'Payment initialization failed. Please try again.'
        });
      }
    } catch (error) {
      console.error('Payment session creation failed:', error);
      setShowError({
        show: true,
        message: error.response?.data?.message || 'Failed to initialize payment. Please try again.'
      });
    }
    return;
  }

  // Normal step progression for non-payment steps
  setCurrentStep(prev => prev + 1);
  setShowValidation(false);
};

const isCurrentStepValid = () => {
  const currentQuestion = questions[currentStep];
  
  switch (currentQuestion.type) {
    case 'designType':
      return designType !== null;
    case 'floorPlanChoice':
      return hasExistingFloorPlan !== null;
    case 'floorPlanUpload':
      return !hasExistingFloorPlan || floorPlanUrls.length > 0;
    case 'roomTagging':
      // Require at least one tagged room
      return taggedRooms.length > 0;
    case 'roomDetails':
      // Check if all tagged rooms have required details (style and squareFootage)
      return taggedRooms.every(room => {
        const details = roomDetails[room.id];
        return details?.style && 
               details?.squareFootage;
      });
    default:
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

      const apiUrl = import.meta.env.REACT_APP_API_URL;
      
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
  try {
    const token = localStorage.getItem('token');
    
    const projectData = {
      designType,
      status: 'draft',
      rooms: taggedRooms.map(room => ({
        ...room,
        details: roomDetails[room.id]
      })),
      hasFloorPlan: hasExistingFloorPlan,
      floorPlanUrls,
      pricing: calculateTotalPrice(taggedRooms.map(room => ({
        ...room,
        ...roomDetails[room.id]
      }))),
      depositPaid: false
    };

    const response = await axios.post(
      `${import.meta.env.REACT_APP_API_URL}/api/projects`, 
      projectData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 200) {
      navigate('/dashboard', { 
        state: { 
          message: 'Project saved successfully! You can complete payment later from your dashboard.' 
        }
      });
    }
  } catch (error) {
    console.error('Error saving project:', error);
    setShowError({
      show: true,
      message: error.response?.data?.message || 'Failed to save project. Please try again.'
    });
  }
};

  const renderCurrentStep = () => {
    const currentQuestion = questions[currentStep];

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
  const pricingData = calculateTotalPrice(taggedRooms.map(room => ({
    ...room,
    ...roomDetails[room.id]
  })));

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
            {pricingData.rooms.map((room, index) => (
              <div 
                key={index}
                className="flex justify-between items-center py-3 border-b last:border-0"
              >
                <div>
                  <h4 className="font-medium">{room.roomName}</h4>
                  <p className="text-sm text-gray-600">
                    {room.squareFootage} sq ft × ${room.ratePerSqFt.toFixed(2)}/sq ft
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${room.basePrice.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t space-y-4">
            <div className="flex justify-between items-center text-gray-600">
              <div>
                <h4 className="text-lg">Total Project Cost</h4>
                <p className="text-sm">
                  Total Area: {pricingData.rooms.reduce((sum, room) => sum + room.squareFootage, 0)} sq ft
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg">${pricingData.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <h4 className="text-lg font-semibold text-blue-600">Required Deposit (60%)</h4>
                <p className="text-sm text-gray-600">Due to start your project</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  ${(pricingData.total * 0.6).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center text-gray-600 text-sm">
              <div>
                <h4>Remaining Balance (40%)</h4>
                <p>Due upon design completion</p>
              </div>
              <div className="text-right">
                <p>${(pricingData.total * 0.4).toFixed(2)}</p>
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
              <li>• Pricing is calculated based on room square footage</li>
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

      {taggedRooms.map((room) => (
        <div key={room.id} className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 className="text-lg font-medium mb-4">{room.roomName} Details</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Style Preference</label>
              <select
                className="w-full p-2 border rounded-md"
                value={roomDetails[room.id]?.style || ''}
                onChange={(e) => {
                  setRoomDetails(prev => ({
                    ...prev,
                    [room.id]: {
                      ...prev[room.id],
                      style: e.target.value
                    }
                  }));
                }}
              >
                <option value="">Select a style</option>
                <option value="modern">Modern</option>
                <option value="traditional">Traditional</option>
                <option value="contemporary">Contemporary</option>
                <option value="minimalist">Minimalist</option>
                <option value="industrial">Industrial</option>
                <option value="scandinavian">Scandinavian</option>
              </select>
              {showValidation && !roomDetails[room.id]?.style && (
                <p className="text-red-500 text-sm mt-1">Please select a style</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Color Scheme</label>
              <select
                className="w-full p-2 border rounded-md"
                value={roomDetails[room.id]?.colorScheme || ''}
                onChange={(e) => {
                  setRoomDetails(prev => ({
                    ...prev,
                    [room.id]: {
                      ...prev[room.id],
                      colorScheme: e.target.value
                    }
                  }));
                }}
              >
                <option value="">Select color scheme</option>
                <option value="neutral">Neutral & Earthy</option>
                <option value="warm">Warm & Cozy</option>
                <option value="cool">Cool & Calm</option>
                <option value="bold">Bold & Vibrant</option>
                <option value="monochrome">Monochromatic</option>
              </select>
            </div>

            {/* Current Room Photos */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Current Room Photos
                <span className="block text-gray-500 text-xs mt-1">
                  Upload photos showing how the room currently looks
                </span>
              </label>
              <FileUpload
                onUploadComplete={(urls) => {
                  setRoomDetails(prev => ({
                    ...prev,
                    [room.id]: {
                      ...prev[room.id],
                      existingPhotos: urls
                    }
                  }));
                }}
                accept="image/jpeg,image/png,image/jpg"
                uploadType="existing"
                projectFolder={projectFolder}
                roomType={room.type}    // Add these
                roomId={room.id}        // Add these
              />
              {roomDetails[room.id]?.existingPhotos?.length > 0 && (
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {roomDetails[room.id].existingPhotos.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Current room ${index + 1}`}
                        className="w-full h-40 object-cover rounded-md"
                      />
                      <button
                        onClick={() => {
                          setRoomDetails(prev => ({
                            ...prev,
                            [room.id]: {
                              ...prev[room.id],
                              existingPhotos: prev[room.id].existingPhotos.filter((_, i) => i !== index)
                            }
                          }));
                        }}
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

            {/* Inspiration Photos */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Inspiration Photos
                <span className="block text-gray-500 text-xs mt-1">
                  Upload photos of designs you'd like to incorporate
                </span>
              </label>
              <FileUpload
                onUploadComplete={(urls) => {
                  setRoomDetails(prev => ({
                    ...prev,
                    [room.id]: {
                      ...prev[room.id],
                      inspirationPhotos: urls
                    }
                  }));
                }}
                accept="image/jpeg,image/png,image/jpg"
                uploadType="inspiration"
                projectFolder={projectFolder}
                roomType={room.type}    // Add these
                roomId={room.id}        // Add these
              />
              {roomDetails[room.id]?.inspirationPhotos?.length > 0 && (
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {roomDetails[room.id].inspirationPhotos.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Inspiration ${index + 1}`}
                        className="w-full h-40 object-cover rounded-md"
                      />
                      <button
                        onClick={() => {
                          setRoomDetails(prev => ({
                            ...prev,
                            [room.id]: {
                              ...prev[room.id],
                              inspirationPhotos: prev[room.id].inspirationPhotos.filter((_, i) => i !== index)
                            }
                          }));
                        }}
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

            <div>
              <label className="block text-sm font-medium mb-1">Specific Requirements</label>
              <textarea
                className="w-full p-2 border rounded-md h-24"
                placeholder="Describe any specific requirements or preferences for this room..."
                value={roomDetails[room.id]?.description || ''}
                onChange={(e) => {
                  setRoomDetails(prev => ({
                    ...prev,
                    [room.id]: {
                      ...prev[room.id],
                      description: e.target.value
                    }
                  }));
                }}
              />
              {showValidation && !roomDetails[room.id]?.description?.trim() && (
                <p className="text-red-500 text-sm mt-1">Please provide room requirements</p>
              )}
            </div>

            {/* Display dimensions from room tagging */}
            <div className="mt-4 space-y-4">
              <h4 className="text-sm font-medium">Room Dimensions</h4>
              
              <div>
                <label className="block text-sm font-medium mb-1">Square Footage</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter square footage"
                  value={roomDetails[room.id]?.squareFootage || ''}
                  onChange={(e) => {
                    setRoomDetails(prev => ({
                      ...prev,
                      [room.id]: {
                        ...prev[room.id],
                        squareFootage: e.target.value
                      }
                    }));
                  }}
                />
                {showValidation && !roomDetails[room.id]?.squareFootage && (
                  <p className="text-red-500 text-sm mt-1">Please enter square footage</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Length (ft)</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    placeholder="Length"
                    value={roomDetails[room.id]?.length || ''}
                    onChange={(e) => {
                      setRoomDetails(prev => ({
                        ...prev,
                        [room.id]: {
                          ...prev[room.id],
                          length: e.target.value
                        }
                      }));
                    }}
                  />
                  {showValidation && !roomDetails[room.id]?.length && (
                    <p className="text-red-500 text-sm mt-1">Required</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Width (ft)</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    placeholder="Width"
                    value={roomDetails[room.id]?.width || ''}
                    onChange={(e) => {
                      setRoomDetails(prev => ({
                        ...prev,
                        [room.id]: {
                          ...prev[room.id],
                          width: e.target.value
                        }
                      }));
                    }}
                  />
                  {showValidation && !roomDetails[room.id]?.width && (
                    <p className="text-red-500 text-sm mt-1">Required</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Height (ft)</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    placeholder="Height"
                    value={roomDetails[room.id]?.height || ''}
                    onChange={(e) => {
                      setRoomDetails(prev => ({
                        ...prev,
                        [room.id]: {
                          ...prev[room.id],
                          height: e.target.value
                        }
                      }));
                    }}
                  />
                  {showValidation && !roomDetails[room.id]?.height && (
                    <p className="text-red-500 text-sm mt-1">Required</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {taggedRooms.length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No rooms have been tagged yet. Please go back to the room tagging step.</p>
        </div>
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
                `${import.meta.env.REACT_APP_API_URL}/api/upload-floor-plan`,
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
        {/* Save indicator */}
        <div className="fixed bottom-4 right-4 flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-lg shadow">
          {isSaving ? (
            <span className="text-gray-600">{t('createDesign.navigation.saving')}</span>
          ) : lastSaved && (
            <span className="text-gray-600">
              {t('createDesign.navigation.lastSaved', { time: new Date(lastSaved).toLocaleTimeString() })}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            {t('createDesign.navigation.progress', { 
              current: currentStep + 1, 
              total: questions.length 
            })}
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
          {questions[currentStep].type !== 'pricingReview' && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isCurrentStepValid()}
              className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {t('createDesign.navigation.next')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateDesign;