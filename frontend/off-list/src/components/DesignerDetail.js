import React from 'react';
import { useNavigate } from 'react-router-dom';
import { designerData } from '../data/designerData';

const DesignerDetailPage = () => {
  const navigate = useNavigate();

  const handlePropertyClick = (designerId) => {
    navigate(`/design/${designerId}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Right side - Designer lists */}
      <div className="w-1/2 p-4 overflow-y-auto">
        <div className="grid gap-4">
          {designerData.map((designer) => (
            <div 
              key={designer.id} 
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handlePropertyClick(designer.id)}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-semibold">{designer.name}</span>
                  <span className="text-sm text-gray-500">{designer.location}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <span>Education: {designer.education}</span>
                  <span>Expertise: {designer.expertise}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{designer.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesignerDetailPage;