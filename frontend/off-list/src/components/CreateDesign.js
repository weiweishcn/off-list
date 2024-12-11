import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from './FileUpload';
import axios from 'axios';
import RoomTagger from './RoomTagger'; // Import RoomTagger component
import RoomDetailsForm from './RoomDetailsForm';

const RoomForm = ({ room, onUpdate, onRemove }) => {
  return (
    <div className="p-4 border rounded-lg mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Room Details</h3>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-800"
        >
          Remove Room
        </button>
      </div>
      
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Room Type</label>
          <input
            type="text"
            value={room.type}
            onChange={(e) => onUpdate({ ...room, type: e.target.value })}
            placeholder="e.g., Kitchen, Living Room, Bathroom"
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Square Footage</label>
          <input
            type="number"
            value={room.squareFootage}
            onChange={(e) => onUpdate({ ...room, squareFootage: e.target.value })}
            placeholder="Enter square footage"
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Length (ft)</label>
            <input
              type="number"
              value={room.length}
              onChange={(e) => onUpdate({ ...room, length: e.target.value })}
              placeholder="Length"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Width (ft)</label>
            <input
              type="number"
              value={room.width}
              onChange={(e) => onUpdate({ ...room, width: e.target.value })}
              placeholder="Width"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Height (ft)</label>
            <input
              type="number"
              value={room.height}
              onChange={(e) => onUpdate({ ...room, height: e.target.value })}
              placeholder="Height"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateDesign = () => {
  const form = useRef();
  const [roomDetails, setRoomDetails] = useState({});
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [floorPlanUrls, setFloorPlanUrls] = useState([]);
  const [hasExistingFloorPlan, setHasExistingFloorPlan] = useState(null);
  const [rooms, setRooms] = useState([
    { id: 1, type: '', squareFootage: '', length: '', width: '', height: '' }
  ]);
  const [roomTags, setRoomTags] = useState([]);
  const [formData, setFormData] = useState({
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
  {
    label: "What rooms would you like to design?",
    type: 'rooms',
    description: "Add all the rooms you'd like to redesign"
  },
  {
    label: "Do you have an existing floor plan?",
    type: 'floorPlanChoice',
    description: "Let us know if you have a floor plan we can reference"
  },
  {
    label: "Upload your floor plan",
    type: 'floorPlanUpload',
    description: "Upload your floor plan (PDF or image)",
    show: hasExistingFloorPlan
  },
  {
    label: "Tag rooms on your floor plan",
    type: 'roomTagging',
    description: "Click on your floor plan to mark each room location",
    show: hasExistingFloorPlan && floorPlanUrls.length > 0
  },
  {
    label: "Room Details",
    type: 'roomDetails',
    description: "Provide specific details for each room you want to design",
    // This step should show up regardless of floor plan status, as long as we have rooms
    //show: rooms.length > 0
  }
].filter(q => q.show !== false);

  const handleAddRoom = () => {
    setRooms([
      ...rooms,
      { id: Date.now(), type: '', squareFootage: '', length: '', width: '', height: '' }
    ]);
  };

  const handleNext = () => {
    if (currentStep === questions.length - 1) {
      setShowPreview(true);
    } else {
      if (isCurrentStepValid()) {
        setCurrentStep(prev => prev + 1);
        setShowValidation(false);
      } else {
        setShowValidation(true);
      }
    }
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

  {/* Add to CreateDesign.js */}

const PreviewMode = ({ formData, rooms, floorPlanUrl, roomTags, onBack, onConfirm }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Review Your Design Request</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Rooms to Design</h3>
          <div className="grid gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="border rounded-lg p-4">
                <h4 className="font-medium">{room.type}</h4>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Square Footage: {room.squareFootage} sq ft</div>
                  {room.length && room.width && (
                    <div>Dimensions: {room.length}' × {room.width}'</div>
                  )}
                  {room.height && <div>Height: {room.height}'</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {floorPlanUrl && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Floor Plan with Tagged Rooms</h3>
            <RoomTagger
              floorPlanUrl={floorPlanUrl}
              rooms={rooms}
              onTagsUpdate={() => {}}
              isPreviewMode={true}
              initialTags={roomTags}
            />
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onBack}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Edit
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirm & Submit
          </button>
        </div>
      </div>
    </div>
  );
};

// Update the render logic:
if (showPreview) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <PreviewMode
          formData={formData}
          rooms={rooms}
          floorPlanUrl={floorPlanUrls[0]}
          roomTags={roomTags}
          onBack={() => setShowPreview(false)}
          onConfirm={() => {
            setShowConfirm(true);
          }}
        />
      </div>
    </div>
  );
}

const handleSubmit = async () => {
  try {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.REACT_APP_API_URL;
    
    // Create project and get project ID
    const projectResponse = await axios.post(`${apiUrl}/api/projects`, {
      rooms: rooms.map(room => ({
        ...room,
        details: roomDetails[room.id]
      })),
      hasFloorPlan: hasExistingFloorPlan,
      floorPlanUrls: floorPlanUrls,
      roomTags: roomTags
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    setShowSuccess(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  } catch (error) {
    console.error('Error creating project:', error);
    alert('Failed to create project. Please try again.');
  }
};

  const renderCurrentStep = () => {
    const currentQuestion = questions[currentStep];

    switch (currentQuestion.type) {
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
            
            <div className="flex space-x-4">
              <button
                className={`flex-1 p-4 rounded-lg border-2 ${
                  hasExistingFloorPlan === true
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => setHasExistingFloorPlan(true)}
              >
                Yes
              </button>
              <button
                className={`flex-1 p-4 rounded-lg border-2 ${
                  hasExistingFloorPlan === false
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => setHasExistingFloorPlan(false)}
              >
                No
              </button>
            </div>
          </div>
        );

case 'roomTagging':
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">{currentQuestion.label}</h2>
      <p className="text-gray-600 mb-4">{currentQuestion.description}</p>
      
      <div className="bg-white rounded-lg shadow-sm">
        <RoomTagger
          key={floorPlanUrls[0]}
          floorPlanUrl={floorPlanUrls[0]}
          rooms={rooms.filter(room => room.type)}
          onTagsUpdate={(data) => {
            if (data.taggedFloorPlanUrl) {
              // Update the floor plan URL to use the tagged version
              setFloorPlanUrls([data.taggedFloorPlanUrl]);
              setRoomTags(data.tags);
            } else {
              setRoomTags(data);
            }
          }}
          isPreviewMode={false}
          initialTags={roomTags}
        />
      </div>
    </div>
  );

      case 'roomDetails':
      return (
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{currentQuestion.label}</h2>
            <p className="text-gray-600">{currentQuestion.description}</p>
          </div>
          
          {rooms.map((room) => (
            <RoomDetailsForm
              key={room.id}
              room={room}
              showValidation={showValidation}
              onUpdate={(roomId, details) => {
                setRoomDetails(prev => ({
                  ...prev,
                  [roomId]: details
                }));
              }}
            />
          ))}
        </div>
      );

// In CreateDesign.js, add logging to track the floor plan URL:
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
      />

      {floorPlanUrls.length > 0 && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg">
          Floor plan uploaded successfully!
        </div>
      )}
    </div>
  );

case 'roomTagging':
  const currentFloorPlanUrl = floorPlanUrls[0];
  console.log('Current floor plan URL:', currentFloorPlanUrl);

  if (!currentFloorPlanUrl) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-2">{currentQuestion.label}</h2>
        <p className="text-red-600">No floor plan found. Please go back and upload a floor plan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">{currentQuestion.label}</h2>
      <p className="text-gray-600 mb-4">{currentQuestion.description}</p>
      
      <div className="bg-white rounded-lg shadow-sm">
        <RoomTagger
          key={currentFloorPlanUrl} // Add key to force remount when URL changes
          floorPlanUrl={currentFloorPlanUrl}
          rooms={rooms.filter(room => room.type)}
          onTagsUpdate={(newTags) => {
            console.log('Updating room tags:', newTags);
            setRoomTags(newTags);
          }}
          isPreviewMode={false}
          initialTags={roomTags}
        />
      </div>
    </div>
  );

      // Add other cases for remaining steps...

      default:
        return null;
    }
  };

const isCurrentStepValid = () => {
  const currentQuestion = questions[currentStep];
  
  switch (currentQuestion.type) {
    case 'rooms':
      return rooms.every(room => room.type && room.squareFootage);
    case 'floorPlanChoice':
      return hasExistingFloorPlan !== null;
    case 'floorPlanUpload':
      return !hasExistingFloorPlan || floorPlanUrls.length > 0;
    case 'roomTagging':
      return hasExistingFloorPlan && (!floorPlanUrls.length || roomTags.length > 0);
    case 'roomDetails':
      return rooms.every(room => {
        const details = roomDetails[room.id];
        return details?.style && 
               details?.existingPhotos?.length > 0 &&
               details?.description?.trim().length > 0;
      });
    default:
      return true;
  }
};

  // ... rest of the component (navigation, dialogs, etc.) remains similar

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* ... existing header with home button ... */}

      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Step {currentStep + 1} of {questions.length}
          </p>
        </div>

        {renderCurrentStep()}

        <div className="flex justify-between mt-8">
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
            onClick={() => {
              if (currentStep === questions.length - 1) {
                setShowConfirm(true);
              } else {
                setCurrentStep(prev => prev + 1);
              }
            }}
            disabled={!isCurrentStepValid()}
            className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {currentStep === questions.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>

        {/* ... existing dialogs ... */}
      </div>
    </div>
  );
};

export default CreateDesign;