import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image, Text, Circle, Group } from 'react-konva';
import axios from 'axios';

// Room type colors mapping
const roomColors = {
  'Living Room': { fill: 'rgba(59, 130, 246, 0.8)', stroke: '#2563EB', text: '#1E40AF' },
  'Kitchen': { fill: 'rgba(16, 185, 129, 0.8)', stroke: '#059669', text: '#065F46' },
  'Bedroom': { fill: 'rgba(139, 92, 246, 0.8)', stroke: '#7C3AED', text: '#5B21B6' },
  'Bathroom': { fill: 'rgba(236, 72, 153, 0.8)', stroke: '#DB2777', text: '#9D174D' },
  'Dining Room': { fill: 'rgba(245, 158, 11, 0.8)', stroke: '#D97706', text: '#92400E' },
  'Office': { fill: 'rgba(75, 85, 99, 0.8)', stroke: '#4B5563', text: '#1F2937' },
  'default': { fill: 'rgba(156, 163, 175, 0.8)', stroke: '#6B7280', text: '#374151' }
};

const RoomTagger = ({ floorPlanUrl, rooms, onTagsUpdate, isPreviewMode = false, initialTags = [] }) => {
  const [image, setImage] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState(initialTags);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [taggedRoomTypes, setTaggedRoomTypes] = useState(
    new Set(initialTags.map(tag => tag.roomName))
  );

  const containerRef = useRef(null);
  const stageRef = useRef(null);

  const getColorScheme = (roomType) => {
    return roomColors[roomType] || roomColors.default;
  };

  useEffect(() => {
    const loadImage = async () => {
      if (!floorPlanUrl) {
        console.error('No floor plan URL provided');
        setError('No floor plan URL provided');
        setLoading(false);
        return;
      }

      try {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';

        const loadPromise = new Promise((resolve, reject) => {
          img.onload = () => {
            console.log('Image loaded successfully:', img.width, 'x', img.height);
            resolve(img);
          };
          img.onerror = (e) => {
            console.error('Image load error:', e);
            reject(new Error('Failed to load image'));
          };
        });

        img.src = floorPlanUrl;
        const loadedImage = await loadPromise;

        if (containerRef.current) {
          const containerWidth = containerRef.current.offsetWidth;
          const aspectRatio = loadedImage.width / loadedImage.height;
          let newHeight = containerWidth / aspectRatio;
          
          if (newHeight > 600) {
            newHeight = 600;
            const newWidth = newHeight * aspectRatio;
            setStageSize({
              width: newWidth,
              height: newHeight
            });
          } else {
            setStageSize({
              width: containerWidth,
              height: newHeight
            });
          }
        }

        setImage(loadedImage);
        setLoading(false);
      } catch (err) {
        console.error('Error in loadImage:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadImage();
  }, [floorPlanUrl]);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;
    setScale(Math.max(0.1, Math.min(newScale, 4)));

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setPosition(newPos);
  };

  const handleStageClick = (e) => {
    if (isPreviewMode || !selectedRoom) return;

    // Check if this room type has already been tagged
    if (taggedRoomTypes.has(selectedRoom.type)) {
      alert(`${selectedRoom.type} has already been tagged. Each room type can only be tagged once.`);
      return;
    }

    const stage = stageRef.current;
    if (!stage) return;

    const point = stage.getRelativePointerPosition();
    
    const newTag = {
      id: Date.now(),
      roomId: selectedRoom.id,
      roomName: selectedRoom.type,
      x: point.x,
      y: point.y
    };

    // Update tagged room types
    setTaggedRoomTypes(prev => new Set([...prev, selectedRoom.type]));
    
    const updatedTags = [...tags, newTag];
    setTags(updatedTags);
    onTagsUpdate(updatedTags);
    setSelectedRoom(null);
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = tags.filter(tag => tag.id !== tagToRemove.id);
    setTags(updatedTags);
    onTagsUpdate(updatedTags);
    // Remove from tagged room types
    setTaggedRoomTypes(prev => {
      const next = new Set(prev);
      next.delete(tagToRemove.roomName);
      return next;
    });
  };

  const handleConfirmTags = async () => {
    if (!stageRef.current) return;
    setIsUploading(true);

    try {
      // Get stage data URL with a white background
      const stage = stageRef.current;
      const dataUrl = stage.toDataURL({
        pixelRatio: 2, // Higher quality
        mimeType: 'image/png',
        backgroundColor: '#FFFFFF'
      });
      
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('uploadFiles', blob, 'tagged-floor-plan.png');
      
      // Upload to your backend
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const uploadResponse = await axios.post(
        `${apiUrl}/api/upload-floor-plan/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Get the uploaded image URL
      const uploadedUrl = uploadResponse.data.imageUrls[0];
      console.log('Tagged floor plan uploaded:', uploadedUrl);

      // Notify parent component
      if (onTagsUpdate) {
        onTagsUpdate({ 
          tags,
          taggedFloorPlanUrl: uploadedUrl
        });
      }

      alert('Floor plan with tags saved successfully!');
    } catch (error) {
      console.error('Error saving tagged floor plan:', error);
      alert('Error saving tagged floor plan. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading floor plan...</div>
          <div className="text-xs text-gray-500 mt-2 break-all max-w-md px-4">
            {floorPlanUrl}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <div className="text-center text-red-600 p-4">
          <p className="font-medium mb-2">Error loading floor plan</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2 text-gray-600 break-all max-w-md px-4">
            URL: {floorPlanUrl}
          </p>
        </div>
      </div>
    );
  }

// Return statement for RoomTagger component
return (
  <div className="space-y-4">
    <div className="bg-white p-4 rounded-lg shadow-sm">
      {!isPreviewMode && (
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-4">Tag Rooms on Floor Plan</h3>
          <div className="flex flex-wrap gap-2">
            {rooms.map((room) => {
              const colors = getColorScheme(room.type);
              const isTagged = taggedRoomTypes.has(room.type);
              return (
                <button
                  key={room.id}
                  onClick={() => {
                    if (isTagged) {
                      alert(`${room.type} has already been tagged. Each room type can only be tagged once.`);
                      return;
                    }
                    setSelectedRoom(room);
                  }}
                  className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                    isTagged
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : selectedRoom?.id === room.id
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  disabled={isTagged}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors.fill }}
                  />
                  {room.type}
                  {isTagged && <span className="ml-1">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div 
        ref={containerRef} 
        className="border rounded-lg overflow-hidden"
        style={{ maxHeight: '600px' }}
      >
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          onClick={handleStageClick}
          onWheel={handleWheel}
          scale={{ x: scale, y: scale }}
          position={position}
          draggable={true}
        >
          <Layer>
            <Image
              image={image}
              width={stageSize.width}
              height={stageSize.height}
            />
            {tags.map((tag) => {
              const colors = getColorScheme(tag.roomName);
              return (
                <Group
                  key={tag.id}
                  id={tag.id}
                  x={tag.x}
                  y={tag.y}
                  draggable={!isPreviewMode}
                  onDragEnd={(e) => {
                    const pos = e.target.position();
                    const updatedTags = tags.map(t => 
                      t.id === tag.id ? { ...t, x: pos.x, y: pos.y } : t
                    );
                    setTags(updatedTags);
                    onTagsUpdate(updatedTags);
                  }}
                >
                  <Circle
                    radius={8}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={2}
                  />
                  <Text
                    text={tag.roomName}
                    fill={colors.text}
                    fontSize={14}
                    fontStyle="bold"
                    offsetX={-10}
                    offsetY={-20}
                    padding={4}
                    background="#FFFFFF"
                  />
                  {!isPreviewMode && (
                    <Circle
                      radius={6}
                      fill="red"
                      x={15}
                      y={-15}
                      opacity={0.8}
                      cursor="pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  )}
                </Group>
              );
            })}
          </Layer>
        </Stage>
      </div>

      {!isPreviewMode && tags.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleConfirmTags}
            disabled={isUploading}
            className={`px-4 py-2 bg-green-600 text-white rounded-lg 
              ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}
              transition-colors`}
          >
            {isUploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Confirm Floor Plan Tagging'
            )}
          </button>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>Selected Room: {selectedRoom?.type || 'None'}</p>
        <p>Number of Tags: {tags.length}</p>
      </div>

      {!isPreviewMode && (
        <div className="mt-4 text-sm text-gray-600">
          <p>💡 Tips:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Click a room type, then click on the floor plan to place a tag</li>
            <li>Each room type can only be tagged once</li>
            <li>Click the red dot on a tag to remove it</li>
            <li>Drag tags to reposition them</li>
            <li>Use mouse wheel to zoom in/out</li>
          </ul>
        </div>
      )}
    </div>
  </div>
)}

export default RoomTagger;