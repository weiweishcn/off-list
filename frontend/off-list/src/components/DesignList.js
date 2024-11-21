import React, { useState, useEffect } from 'react';

function DesignList() {
  const [designs, setDesigns] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://165.232.131.137:3001';
        console.log('Fetching from:', `${apiUrl}/api/design`);
        
        const response = await fetch(`${apiUrl}/api/design`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const textData = await response.text();
        console.log('Raw response:', textData);
        
        if (textData) {
          const jsonData = JSON.parse(textData);
          console.log('Parsed data:', jsonData);
          
          // Make sure we're accessing the designs array
          if (jsonData && jsonData.designs) {
            setDesigns(jsonData.designs);
          } else {
            throw new Error('Invalid data format');
          }
        } else {
          throw new Error('Empty response received');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!designs || designs.length === 0) return <div>No designs found</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {designs.map((design) => (
        <div key={design.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-64">
            {design.images && design.images[0] && (
              <img 
                src={design.images[0]} 
                alt={design.description}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="p-4">
            <div className="font-bold text-xl mb-2">
              Designer: {design.designer}
            </div>
            <p className="text-gray-700 mb-2">{design.description}</p>
            <div className="flex flex-wrap gap-2">
              {design.style && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  Style: {design.style}
                </span>
              )}
              {design.tag && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  Tag: {design.tag}
                </span>
              )}
              {design.color && design.color.map((c, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                  Color: {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DesignList;