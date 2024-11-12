import React from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyData } from '../data/propertyData';

const PropertyListingPage = () => {
  const navigate = useNavigate();

  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left side - Map placeholder */}
      <div className="w-1/2 bg-gray-200 p-4">
        <div className="h-full rounded-lg bg-white shadow-lg flex items-center justify-center">
          <p className="text-gray-500">Map Coming Soon</p>
        </div>
      </div>

      {/* Right side - Property listings */}
      <div className="w-1/2 p-4 overflow-y-auto">
        <div className="grid gap-4">
          {propertyData.map((property) => (
            <div 
              key={property.id} 
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handlePropertyClick(property.id)}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-semibold">${property.price.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">{property.location}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <span>{property.bedrooms} beds</span>
                  <span>{property.bathrooms} baths</span>
                  <span>{property.sqft.toLocaleString()} sqft</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{property.description}</p>
                <p className="text-xs text-gray-500">{property.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyListingPage;