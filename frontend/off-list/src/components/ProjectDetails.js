import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import FloorPlanComments from './FloorPlanComments';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/projects/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Project data:', data);
        setProject(data);
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id, navigate]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Project not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">Project #{project.id}</h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <p>Status: {project.status}</p>
            <p>Created: {new Date(project.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Floor Plan Section with Comments */}
        {project.has_floor_plan && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Floor Plans</h2>
            
            <Tab.Group>
              <Tab.List className="flex space-x-4 border-b mb-6">
                {project.floor_plan_url && (
                  <Tab
                    className={({ selected }) =>
                      `px-4 py-2 font-medium focus:outline-none ${
                        selected
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`
                    }
                  >
                    Your Floor Plan
                  </Tab>
                )}
                {project.tagged_floor_plan_url && (
                  <Tab
                    className={({ selected }) =>
                      `px-4 py-2 font-medium focus:outline-none ${
                        selected
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`
                    }
                  >
                    Tagged Floor Plan
                  </Tab>
                )}
                {project.designer_floor_plan_url && (
                  <Tab
                    className={({ selected }) =>
                      `px-4 py-2 font-medium focus:outline-none ${
                        selected
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`
                    }
                  >
                    Designer's Floor Plan
                  </Tab>
                )}
              </Tab.List>
              
              <Tab.Panels>
                {project.floor_plan_url && (
                  <Tab.Panel>
                    <FloorPlanComments
                      projectId={project.id}
                      imageUrl={project.floor_plan_url}
                    />
                  </Tab.Panel>
                )}
                {project.tagged_floor_plan_url && (
                  <Tab.Panel>
                    <FloorPlanComments
                      projectId={project.id}
                      imageUrl={project.tagged_floor_plan_url}
                    />
                  </Tab.Panel>
                )}
                {project.designer_floor_plan_url && (
                  <Tab.Panel>
                    <FloorPlanComments
                      projectId={project.id}
                      imageUrl={project.designer_floor_plan_url}
                    />
                  </Tab.Panel>
                )}
              </Tab.Panels>
            </Tab.Group>
          </div>
        )}

        {/* Rooms Section */}
        <div className="space-y-6">
          {project.rooms?.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">{room.type}</h2>
              
              {/* Room Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Dimensions</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>Square Footage: {room.square_footage} sq ft</p>
                    {room.length && room.width && (
                      <p>Dimensions: {room.length}' × {room.width}'</p>
                    )}
                    {room.height && <p>Height: {room.height}'</p>}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Design Preferences</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>Style: {room.design_preferences?.style}</p>
                    <p>Description: {room.design_preferences?.description}</p>
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-4">
                {room.existing_photos?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Current Room Photos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {room.existing_photos.map((photo, photoIndex) => (
                        <img 
                          key={photoIndex}
                          src={photo.photo_url} 
                          alt={`Current Room ${photoIndex + 1}`}
                          className="rounded-lg object-cover h-48 w-full"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {room.inspiration_photos?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Inspiration Photos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {room.inspiration_photos.map((photo, photoIndex) => (
                        <img 
                          key={photoIndex}
                          src={photo.photo_url} 
                          alt={`Inspiration ${photoIndex + 1}`}
                          className="rounded-lg object-cover h-48 w-full"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Final Designs Section */}
        {project.final_designs && project.final_designs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Designer's Final Designs</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {project.final_designs.map((design, index) => (
                <img
                  key={index}
                  src={design.design_url}
                  alt={`Final Design ${index + 1}`}
                  className="rounded-lg object-cover h-48 w-full cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(design.design_url, '_blank')}
                  onError={(e) => {
                    console.error('Image failed to load:', e.target.src);
                    e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;