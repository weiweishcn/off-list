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

function DesignerList() {
  const [Listing, setListing] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/designer')
      .then(response => response.json())
      .then(json => setListing(json))
    }
)

  return (
    <div>
        {Listing.map((design) => (
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span>Designer: {design.designer}</span>
                  <span>Bio: {design.bio}</span>
                  <span>Style: {design.style}</span>
                  <span>Tag: {design.tag}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                </div>
              </div>
          ))}
    </div>
  );
}

export default DesignerList;