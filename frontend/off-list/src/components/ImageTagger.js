import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Text, Circle, Group, Rect, Image } from 'react-konva';

const roomColors = {
  'Living Room': { fill: 'rgba(59, 130, 246, 0.8)', stroke: '#2563EB', text: '#1E40AF' },
  'Kitchen': { fill: 'rgba(16, 185, 129, 0.8)', stroke: '#059669', text: '#065F46' },
  'Bedroom': { fill: 'rgba(139, 92, 246, 0.8)', stroke: '#7C3AED', text: '#5B21B6' },
  'Bathroom': { fill: 'rgba(236, 72, 153, 0.8)', stroke: '#DB2777', text: '#9D174D' },
  'Dining Room': { fill: 'rgba(245, 158, 11, 0.8)', stroke: '#D97706', text: '#92400E' },
  'Office': { fill: 'rgba(75, 85, 99, 0.8)', stroke: '#4B5563', text: '#1F2937' },
  'default': { fill: 'rgba(156, 163, 175, 0.8)', stroke: '#6B7280', text: '#374151' }
};

const ImageTagger = ({ 
  imageUrl, 
  rooms = [], 
  onTagsUpdate,
  isPreviewMode = false, 
  initialTags = []
}) => {
  const [imageObj, setImageObj] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 2400, height: 1600 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState(initialTags);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [roomCounts, setRoomCounts] = useState({});

  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const imageRef = useRef(null);

  const getColorScheme = (roomType) => {
    return roomColors[roomType] || roomColors.default;
  };

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!imageUrl) {
        setError('No image URL provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Starting to load image from URL:', imageUrl);
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          if (!isMounted) return;

          console.log('Image loaded successfully:', {
            width: img.width,
            height: img.height
          });
          
          if (!img.width || !img.height) {
            console.error('Image loaded but has invalid dimensions');
            setError('Invalid image dimensions');
            setLoading(false);
            return;
          }

          setImageObj(img);
          
          if (containerRef.current) {
            const maxWidth = 2400;
            const maxHeight = 1600;
            
            const aspectRatio = img.width / img.height;
            let newWidth = Math.min(maxWidth, img.width);
            let newHeight = newWidth / aspectRatio;
            
            if (newHeight > maxHeight) {
              newHeight = maxHeight;
              newWidth = newHeight * aspectRatio;
            }
            
            setStageSize({
              width: newWidth,
              height: newHeight
            });
            
            const scaleX = (window.innerWidth * 0.9) / newWidth;
            const scaleY = (window.innerHeight * 0.8) / newHeight;
            setScale(Math.min(scaleX, scaleY));
          }
          setLoading(false);
        };
        
        img.onerror = (err) => {
          if (!isMounted) return;
          console.error('Error loading image:', err);
          setError('Failed to load image. Please check if the image URL is accessible.');
          setLoading(false);
        };
        
        img.src = imageUrl;
      } catch (err) {
        if (!isMounted) return;
        console.error('Error in loadImage:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;

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

    e.evt.preventDefault();
    e.cancelBubble = true;

    const stage = stageRef.current;
    if (!stage) return;

    const position = stage.getRelativePointerPosition();
    const baseType = selectedRoom.type;
    const nextNumber = (roomCounts[baseType] || 0) + 1;
    const roomName = nextNumber > 1 ? `${baseType} ${nextNumber}` : baseType;
    
    const newTag = {
      id: Date.now(),
      roomId: selectedRoom.id,
      roomName: roomName,
      x: position.x,
      y: position.y
    };

    setRoomCounts(prev => ({
      ...prev,
      [baseType]: nextNumber
    }));

    const updatedTags = [...tags, newTag];
    setTags(updatedTags);
    
    if (onTagsUpdate) {
      onTagsUpdate(updatedTags);
    }
    setSelectedRoom(null);
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = tags.filter(tag => tag.id !== tagToRemove.id);
    setTags(updatedTags);
    
    const newCounts = {};
    updatedTags.forEach(tag => {
      const baseType = tag.roomName.split(' ')[0];
      newCounts[baseType] = (newCounts[baseType] || 0) + 1;
    });
    setRoomCounts(newCounts);
    
    if (onTagsUpdate) {
      onTagsUpdate(updatedTags);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <div className="text-gray-600">Loading image...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <div className="text-center text-red-600 p-4">
          <p className="font-medium mb-2">Error loading image</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        {!isPreviewMode && (
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-4">Tag Rooms on Floor Plan</h3>
            <div className="flex flex-wrap gap-2">
              {rooms.map((room) => {
                const colors = getColorScheme(room.type);
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 
                      ${selectedRoom?.id === room.id
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors.fill }}
                    />
                    {room.type}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div 
          ref={containerRef} 
          className="border rounded-lg overflow-hidden w-full"
          style={{ maxHeight: '90vh', maxWidth: '2400px', margin: '0 auto' }}
        >
          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            onMouseDown={handleStageClick}
            onTouchStart={handleStageClick}
            onWheel={handleWheel}
            scale={{ x: scale, y: scale }}
            position={position}
            draggable={!selectedRoom}
          >
            <Layer>
              {imageObj && (
                <Image
                  image={imageObj}
                  ref={imageRef}
                  width={stageSize.width}
                  height={stageSize.height}
                />
              )}
              {tags.map((tag) => {
                const colors = getColorScheme(tag.roomName);
                return (
                  <Group
                    key={tag.id}
                    x={tag.x}
                    y={tag.y}
                    draggable={!isPreviewMode}
                    onDragEnd={(e) => {
                      const pos = e.target.position();
                      const updatedTags = tags.map(t => 
                        t.id === tag.id ? { ...t, x: pos.x, y: pos.y } : t
                      );
                      setTags(updatedTags);
                      if (onTagsUpdate) {
                        onTagsUpdate(updatedTags);
                      }
                    }}
                  >
                    <Circle
                      radius={8}
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={2}
                    />
                    <Group>
                      <Rect
                        fill="white"
                        offsetX={-10}
                        offsetY={-20}
                        height={24}
                        width={100}
                        shadowColor="black"
                        shadowBlur={2}
                        shadowOffset={{ x: 1, y: 1 }}
                        shadowOpacity={0.2}
                      />
                      <Text
                        text={tag.roomName}
                        fill={colors.text}
                        fontSize={14}
                        fontFamily="Arial"
                        offsetX={-10}
                        offsetY={-20}
                        padding={4}
                      />
                    </Group>
                    {!isPreviewMode && (
                      <Circle
                        radius={6}
                        fill="red"
                        x={15}
                        y={-15}
                        opacity={0.8}
                        onClick={() => handleRemoveTag(tag)}
                      />
                    )}
                  </Group>
                );
              })}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
};

export default ImageTagger;