const calculateRoomPrice = (room) => {
  // Base pricing logic - $1 per square foot
  const baseRate = 1;
  const squareFootage = parseFloat(room.squareFootage) || 0;
  
  // Calculate base price
  const basePrice = squareFootage * baseRate;
  
  // You can add additional pricing factors here
  // For example: complexity multipliers, style-based adjustments, etc.
  
  return {
    basePrice,
    squareFootage,
    ratePerSqFt: baseRate
  };
};

export const calculateTotalPrice = (rooms) => {
  const roomPrices = rooms.map(room => ({
    roomName: room.roomName,
    ...calculateRoomPrice(room)
  }));

  const total = roomPrices.reduce((sum, room) => sum + room.basePrice, 0);

  return {
    rooms: roomPrices,
    total
  };
};