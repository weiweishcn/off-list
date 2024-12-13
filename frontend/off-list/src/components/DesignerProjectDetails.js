import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import FloorPlanComments from './FloorPlanComments';
import DesignComments from './DesignComments';

const DesignerProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingFloorPlan, setUploadingFloorPlan] = useState(false);
  const [uploadingDesigns, setUploadingDesigns] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id, navigate]);

  const fetchProjectDetails = async () => {
    try {
      console.log('Fetching project details...');
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

      if (!response.ok) throw new Error('Failed to fetch project details');
      
      const data = await response.json();
      console.log('Project data received:', data);
      console.log('Final designs:', data.final_designs);
      setProject(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFloorPlanUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('uploadFiles', file);
    setUploadingFloorPlan(true);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/designer/projects/${id}/floor-plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload floor plan');
      fetchProjectDetails();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUploadingFloorPlan(false);
    }
  };

  const handleFinalDesignsUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('uploadFiles', file);
    });
    setUploadingDesigns(true);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/designer/projects/${id}/final-designs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload designs');
      fetchProjectDetails();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUploadingDesigns(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Project not found</h2>
          <button
            onClick={() => navigate('/designer/dashboard')}
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
            onClick={() => navigate('/designer/dashboard')}
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
            <p>Client: {project.client_email}</p>
            <p>Created: {new Date(project.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Floor Plan Section with Comments */}
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
                  Original Floor Plan
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
              <Tab
                className={({ selected }) =>
                  `px-4 py-2 font-medium focus:outline-none ${
                    selected
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                Designer Floor Plan
              </Tab>
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
              <Tab.Panel>
                <div className="space-y-6">
                  {project.designer_floor_plan_url && (
                    <FloorPlanComments
                      projectId={project.id}
                      imageUrl={project.designer_floor_plan_url}
                    />
                  )}
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Upload New Floor Plan
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFloorPlanUpload}
                      disabled={uploadingFloorPlan}
                      className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    {uploadingFloorPlan && <p className="mt-2 text-sm text-gray-500">Uploading...</p>}
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>

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
                {room.existing_photos?.length > 0 && room.existing_photos[0] && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Current Room Photos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {room.existing_photos.map((photo, photoIndex) => (
                        <img 
                          key={photoIndex}
                          src={photo.photo_url} 
                          alt={`Current Room ${photoIndex + 1}`}
                          className="rounded-lg object-cover h-48 w-full"
                          onError={(e) => {
                            console.error('Image failed to load:', e.target.src);
                            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {room.inspiration_photos?.length > 0 && room.inspiration_photos[0] && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Inspiration Photos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {room.inspiration_photos.map((photo, photoIndex) => (
                        <img 
                          key={photoIndex}
                          src={photo.photo_url} 
                          alt={`Inspiration ${photoIndex + 1}`}
                          className="rounded-lg object-cover h-48 w-full"
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
          ))}
        </div>

        {/* Final Designs Section */}
        {project.final_designs && project.final_designs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Final Designs</h2>
            
            <Tab.Group>
            <Tab.List className="flex space-x-4 overflow-x-auto pb-2 mb-6 border-b">
                {project.final_designs.map((design, index) => (
                <Tab
                    key={design.id || index}
                    className={({ selected }) =>
                    `px-4 py-2 font-medium focus:outline-none shrink-0 ${
                        selected
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`
                    }
                >
                    Design {index + 1}
                </Tab>
                ))}
            </Tab.List>

            <Tab.Panels>
                {project.final_designs.map((design, index) => (
                <Tab.Panel key={design.id || index}>
                    {design.id ? (
                    <DesignComments
                        projectId={project.id}
                        designId={design.id}
                        imageUrl={design.design_url}
                    />
                    ) : (
                    <div className="text-red-600">Error: Design ID not available</div>
                    )}
                </Tab.Panel>
                ))}
            </Tab.Panels>
            </Tab.Group>

            {/* Upload section for DesignerProjectDetails only */}
            {handleFinalDesignsUpload && (
            <div className="mt-8 pt-6 border-t">
                <label className="block text-sm font-medium text-gray-700">
                Upload New Designs
                </label>
                <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFinalDesignsUpload}
                disabled={uploadingDesigns}
                className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                {uploadingDesigns && <p className="mt-2 text-sm text-gray-500">Uploading...</p>}
            </div>
            )}
        </div>
        )}
      </div>
    </div>
  );
};

export default DesignerProjectDetails;