import React from 'react';
import { useParams, Link } from 'react-router-dom';

const PropertyDetails = () => {
  const { id } = useParams();
  
  // This would eventually come from your API
  const property = {
    id: id,
    price: 450000,
    location: "Seattle, WA",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    description: "Beautiful modern home in prime location with recent updates throughout. This stunning property features an open concept living area, updated kitchen with stainless steel appliances, and a spacious primary suite. The backyard offers a perfect space for outdoor entertaining with a covered patio and professional landscaping. Located in a highly sought-after neighborhood with easy access to parks, shopping, and excellent schools.",
    type: "Single Family Home",
    yearBuilt: 2015,
    parking: "2 Car Garage",
    heating: "Central",
    cooling: "Central Air",
    features: [
      "Hardwood Floors",
      "Granite Countertops",
      "Stainless Steel Appliances",
      "Walk-in Closets",
      "Crown Molding"
    ]
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/" 
          className="inline-block mb-6 text-blue-600 hover:text-blue-800"
        >
          ← Back to Listings
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Image Placeholder */}
          <div className="h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Property Images Coming Soon</span>
          </div>
          
          {/* Property Details */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold">${property.price.toLocaleString()}</h1>
              <span className="text-gray-600">{property.location}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <span className="block text-gray-500">Beds</span>
                <span className="text-lg font-semibold">{property.bedrooms}</span>
              </div>
              <div className="text-center">
                <span className="block text-gray-500">Baths</span>
                <span className="text-lg font-semibold">{property.bathrooms}</span>
              </div>
              <div className="text-center">
                <span className="block text-gray-500">Sq Ft</span>
                <span className="text-lg font-semibold">{property.sqft.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">About This Property</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Property Details</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>Type: {property.type}</li>
                  <li>Year Built: {property.yearBuilt}</li>
                  <li>Parking: {property.parking}</li>
                  <li>Heating: {property.heating}</li>
                  <li>Cooling: {property.cooling}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                <ul className="space-y-2 text-gray-600">
                  {property.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Contact Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;