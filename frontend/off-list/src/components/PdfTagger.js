import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Text, Circle, Group, Rect, Image } from 'react-konva';
import ReactPdfViewer from './PdfViewer';

const roomColors = {
  'Living Room': { fill: 'rgba(59, 130, 246, 0.8)', stroke: '#2563EB', text: '#1E40AF' },
  'Kitchen': { fill: 'rgba(16, 185, 129, 0.8)', stroke: '#059669', text: '#065F46' },
  'Bedroom': { fill: 'rgba(139, 92, 246, 0.8)', stroke: '#7C3AED', text: '#5B21B6' },
  'Bathroom': { fill: 'rgba(236, 72, 153, 0.8)', stroke: '#DB2777', text: '#9D174D' },
  'Dining Room': { fill: 'rgba(245, 158, 11, 0.8)', stroke: '#D97706', text: '#92400E' },
  'Office': { fill: 'rgba(75, 85, 99, 0.8)', stroke: '#4B5563', text: '#1F2937' },
  'default': { fill: 'rgba(156, 163, 175, 0.8)', stroke: '#6B7280', text: '#374151' }
};

const PdfTagger = ({ 
  floorPlanUrl, 
  rooms = [], 
  onTagsUpdate,
  isPreviewMode = false, 
  initialTags = []
}) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [tags, setTags] = useState(initialTags);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [roomCounts, setRoomCounts] = useState({});
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [pdfElement, setPdfElement] = useState(null);

  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const resizeCanvas = () => {
      if (wrapperRef.current) {
        const { offsetWidth, offsetHeight } = wrapperRef.current;
        setCanvasSize({
          width: offsetWidth,
          height: offsetHeight
        });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getColorScheme = (roomType) => {
    return roomColors[roomType] || roomColors.default;
  };

  // Handle when PDF viewer is ready and rendered
  const handlePdfRendered = (pdfElementRef) => {
    console.log('PDF rendered, element:', pdfElementRef);
    setPdfElement(pdfElementRef);
    
    if (pdfElementRef && wrapperRef.current) {
      const { offsetWidth, offsetHeight } = pdfElementRef;
      setCanvasSize({
        width: offsetWidth,
        height: offsetHeight
      });
    }
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;

    const pointerPos = stage.getPointerPosition();
    const oldScale = scale;

    const mousePointTo = {
      x: (pointerPos.x - stage.x()) / oldScale,
      y: (pointerPos.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;
    setScale(Math.max(0.1, Math.min(newScale, 4)));

    const newPos = {
      x: pointerPos.x - mousePointTo.x * newScale,
      y: pointerPos.y - mousePointTo.y * newScale,
    };
    setPosition(newPos);
  };

  const handleStageClick = (e) => {
    if (isPreviewMode || !selectedRoom) {
      console.log('Click ignored - preview mode or no room selected');
      return;
    }

    const stage = stageRef.current;
    if (!stage) return;

    const point = stage.getPointerPosition();
    
    // Convert point to relative coordinates
    const transform = stage.getAbsoluteTransform().copy().invert();
    const stagePoint = transform.point(point);

    console.log('Stage clicked:', { point, stagePoint });

    const baseType = selectedRoom.type;
    const nextNumber = (roomCounts[baseType] || 0) + 1;
    const roomName = nextNumber > 1 ? `${baseType} ${nextNumber}` : baseType;
    
    const newTag = {
      id: Date.now(),
      roomId: selectedRoom.id,
      roomName: roomName,
      x: stagePoint.x,
      y: stagePoint.y
    };

    console.log('Creating new tag:', newTag);
    
    setRoomCounts(prev => ({
      ...prev,
      [baseType]: nextNumber
    }));

    const updatedTags = [...tags, newTag];
    setTags(updatedTags);
    
    if (onTagsUpdate) {
      onTagsUpdate(updatedTags);
    }
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
          ref={wrapperRef}
          className="relative border rounded-lg overflow-hidden"
          style={{ width: '100%', height: '80vh' }}
        >
          <div className="absolute inset-0">
            <ReactPdfViewer 
              pdfUrl={floorPlanUrl}
              onLoad={(pdf) => {
                console.log('PDF loaded:', pdf);
                if (wrapperRef.current) {
                  const { offsetWidth, offsetHeight } = wrapperRef.current;
                  setCanvasSize({
                    width: offsetWidth,
                    height: offsetHeight
                  });
                  setPdfElement(wrapperRef.current);
                }
              }}
            />
          </div>

          {pdfElement && (
            <div 
              className="absolute inset-0"
              style={{ 
                pointerEvents: selectedRoom ? 'auto' : 'none',
                cursor: selectedRoom ? 'crosshair' : 'default'
              }}
            >
              <Stage
                ref={stageRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onMouseDown={handleStageClick}
                onTouchStart={handleStageClick}
                onWheel={handleWheel}
                scaleX={scale}
                scaleY={scale}
                x={position.x}
                y={position.y}
                draggable={!selectedRoom}
              >
                <Layer>
                  {tags.map((tag) => {
                    const colors = getColorScheme(tag.roomName);
                    return (
                      <Group
                        key={tag.id}
                        x={tag.x}
                        y={tag.y}
                        draggable={!isPreviewMode}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfTagger;