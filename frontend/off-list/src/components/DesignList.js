import React, { useState, useEffect } from 'react';

function obj_to_array(obj){
    var result = [];
    for(var i in obj){ 
        var tmp = {}; 
        tmp[i] = obj[i]; 
        result.push(tmp); 
    }
    return result;
 }

function DesignList() {
  const [Listing, setListing] = useState([]);

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://165.232.131.137:3001';
    fetch(`${apiUrl}/api/design`)
      .then(response => response.json())
      .then(json => setListing(json))
    }
)

  return (
    <div>
        {Listing.map((design) => (
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <img src={design.images[0]} width="400" 
     height="500"/>
                  <span>Designer: {design.designer}</span>
                  <span>Description: {design.description}</span>
                  <span>designProfolio: {design.designProfolio}</span>
                  <span>color: {design.color}</span>
                  <span>Tag: {design.tag}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                </div>
              </div>
          ))}
    </div>
  );
}

export default DesignList;