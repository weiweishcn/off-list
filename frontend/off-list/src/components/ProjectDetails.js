import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import FloorPlanComments from './FloorPlanComments';
import FinalDesignsSection from './FinalDesignsSection';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {t('projectDetails.loading')}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">{t('projectDetails.notFound.title')}</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-800"
          >
            {t('projectDetails.navigation.backToDashboard')}
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
            {t('projectDetails.navigation.backToDashboard')}
          </button>
        </div>

        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {t('projectDetails.title', { id: project.id })}
          </h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <p>{t('projectDetails.status')}{project.status}</p>
            <p>{t('projectDetails.created')}{new Date(project.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Floor Plan Section with Comments */}
        {project.has_floor_plan && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{t('projectDetails.floorPlans.title')}</h2>
            
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
                    {t('projectDetails.floorPlans.tabs.yourFloorPlan')}
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
                    {t('projectDetails.floorPlans.tabs.taggedFloorPlan')}
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
                    {t('projectDetails.floorPlans.tabs.designerFloorPlan')}
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
                  <h3 className="text-lg font-medium mb-2">
                    {t('projectDetails.rooms.dimensions.title')}
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    <p>{t('projectDetails.rooms.dimensions.squareFootage', { value: room.square_footage })}</p>
                    {room.length && room.width && (
                      <p>{t('projectDetails.rooms.dimensions.dimensions', { length: room.length, width: room.width })}</p>
                    )}
                    {room.height && (
                      <p>{t('projectDetails.rooms.dimensions.height', { value: room.height })}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {t('projectDetails.rooms.designPreferences.title')}
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    <p>{t('projectDetails.rooms.designPreferences.style')}{room.design_preferences?.style}</p>
                    <p>{t('projectDetails.rooms.designPreferences.description')}{room.design_preferences?.description}</p>
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-4">
                {room.existing_photos?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      {t('projectDetails.rooms.photos.currentRoom')}
                    </h3>
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
                    <h3 className="text-lg font-medium mb-2">
                      {t('projectDetails.rooms.photos.inspiration')}
                    </h3>
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
        <FinalDesignsSection
          projectId={project.id}
          designs={project.final_designs}
          isDesigner={false}
        />
      </div>
    </div>
  );
};

export default ProjectDetails;