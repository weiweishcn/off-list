import React, {useState, useEffect} from 'react';
import { useNavigate, Link } from 'react-router-dom';

function HomePage() {

  const navigate = useNavigate();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/design')
      .then(response => response.json())
      .then(json => setData(json))
    }
)
  const handlePropertyClick = (propertyId) => {
    navigate(`/design/${propertyId}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left side - Designer list*/}
      <div className="w-1/2 bg-gray-200 p-4">
        <div className="h-full rounded-lg bg-white shadow-lg flex items-center justify-center">
            <button
                type="button"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href='./login';
                  }}
            > login / signup
            </button>
            <button
                type="button"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href='./subscribe';
                  }}
            > subscribe
            </button>
            <button
                type="button"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href='./designRequest';
                  }}
            > create design request
            </button>
            <button
                type="button"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href='./Designer';
                  }}
            > Designer List
            </button>
              <button
                type="button"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href='./contact';
                  }}
            > contact us
            </button>
        </div>
      </div>

      {/* Right side - Design listings */}
      <div className="w-1/2 p-4 overflow-y-auto">
        <div className="grid gap-4">
          {data.map((design) => (
            <div 
              key={design.id} 
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handlePropertyClick(design.id)}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-semibold">{design.type}</span>
                  <img src={design.images[0]} width="400" 
     height="500"/>
                  <span className="text-sm text-gray-500">{design.location}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <span>Style: {design.style}</span>
                  <span>Designer: {design.designer}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{design.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;