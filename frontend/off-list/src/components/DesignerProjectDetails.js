import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import FloorPlanComments from './FloorPlanComments';
import DesignComments from './DesignComments';
import FinalDesignsSection from './FinalDesignsSection';

const DesignerProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
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

      const apiUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001';
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
      const apiUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001';
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
      const apiUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001';
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {t('designerProjectDetails.loading')}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">
            {t('designerProjectDetails.notFound.title')}
          </h2>
          <button
            onClick={() => navigate('/designer/dashboard')}
            className="text-blue-600 hover:text-blue-800"
          >
            {t('designerProjectDetails.navigation.backToDashboard')}
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
            {t('designerProjectDetails.navigation.backToDashboard')}
          </button>
        </div>

        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {t('designerProjectDetails.header.projectId', { id: project.id })}
          </h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <p>{t('designerProjectDetails.header.status')}{project.status}</p>
            <p>{t('designerProjectDetails.header.client')}{project.client_email}</p>
            <p>
              {t('designerProjectDetails.header.created')}
              {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Floor Plan Section with Comments */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {t('designerProjectDetails.floorPlans.title')}
          </h2>
          
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
                  {t('designerProjectDetails.floorPlans.tabs.original')}
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
                  {t('designerProjectDetails.floorPlans.tabs.tagged')}
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
                {t('designerProjectDetails.floorPlans.tabs.designer')}
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
                      {t('designerProjectDetails.floorPlans.upload.title')}
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
                    {uploadingFloorPlan && (
                      <p className="mt-2 text-sm text-gray-500">
                        {t('designerProjectDetails.floorPlans.upload.uploading')}
                      </p>
                    )}
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
                  <h3 className="text-lg font-medium mb-2">
                    {t('designerProjectDetails.rooms.dimensions.title')}
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    <p>
                      {t('designerProjectDetails.rooms.dimensions.squareFootage', { 
                        value: room.square_footage 
                      })}
                    </p>
                    {room.length && room.width && (
                      <p>
                        {t('designerProjectDetails.rooms.dimensions.dimensions', {
                          length: room.length,
                          width: room.width
                        })}
                      </p>
                    )}
                    {room.height && (
                      <p>
                        {t('designerProjectDetails.rooms.dimensions.height', {
                          value: room.height
                        })}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {t('designerProjectDetails.rooms.designPreferences.title')}
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    <p>
                      {t('designerProjectDetails.rooms.designPreferences.style')}
                      {room.design_preferences?.style}
                    </p>
                    <p>
                      {t('designerProjectDetails.rooms.designPreferences.description')}
                      {room.design_preferences?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-4">
                {room.existing_photos?.length > 0 && room.existing_photos[0] && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      {t('designerProjectDetails.rooms.photos.currentRoom.title')}
                    </h3>
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
                    <h3 className="text-lg font-medium mb-2">
                      {t('designerProjectDetails.rooms.photos.inspiration.title')}
                    </h3>
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
        <FinalDesignsSection
          projectId={project.id}
          designs={project.final_designs}
          isDesigner={true}
          onUploadDesigns={handleFinalDesignsUpload}
          uploadingDesigns={uploadingDesigns}
        />
      </div>
    </div>
  );
};

export default DesignerProjectDetails;