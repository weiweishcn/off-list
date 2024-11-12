import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PropertyListingPage = () => {
  const [properties, setProperties] = useState([
    {
      id: 1,
      price: 450000,
      location: "Seattle, WA",
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
      description: "Beautiful modern home in prime location",
      type: "Single Family Home"
    },
    // Add more sample properties here
  ]);

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
          {properties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>${property.price.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">{property.location}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{property.bedrooms} beds</span>
                  <span>{property.bathrooms} baths</span>
                  <span>{property.sqft.toLocaleString()} sqft</span>
                </div>
                <p className="mt-2 text-sm text-gray-700">{property.description}</p>
                <p className="mt-1 text-xs text-gray-500">{property.type}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyListingPage;