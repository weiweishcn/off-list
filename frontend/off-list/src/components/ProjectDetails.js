import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import FloorPlanComments from './FloorPlanComments';
import FinalDesignsSection from './FinalDesignsSection';
import FileUpload from './FileUpload';
import axios from 'axios';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [s3Photos, setS3Photos] = useState({});

  const fetchS3Photos = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const response = await fetch(
        `${apiUrl}/api/projects/${id}/s3photos`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setS3Photos(data.photos);
    } catch (error) {
      console.error('Error fetching S3 photos:', error);
    }
  };

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL;
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
        await fetchS3Photos(); // Fetch S3 photos after getting project data
        
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id, navigate]);

  const handlePhotoUpload = async (roomId, urls) => {
    // Update local state
    setProject(prevProject => ({
      ...prevProject,
      rooms: prevProject.rooms.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            existing_photos: [
              ...(room.existing_photos || []),
              ...urls.map(url => ({ photo_url: url }))
            ]
          };
        }
        return room;
      })
    }));

    // Refresh S3 photos to include newly uploaded ones
    await fetchS3Photos();
  };

  const handleRemovePhoto = async (roomId, photoIndex) => {
    setProject(prevProject => ({
      ...prevProject,
      rooms: prevProject.rooms.map(room => {
        if (room.id === roomId) {
          const newPhotos = [...(room.existing_photos || [])];
          newPhotos.splice(photoIndex, 1);
          return {
            ...room,
            existing_photos: newPhotos
          };
        }
        return room;
      })
    }));
  };

  // Render room photos combining both DB and S3 sources
const renderRoomPhotos = (room) => {
  const dbPhotos = room.existing_photos || [];
  // Log state for debugging
  console.log('Room:', room.type);
  console.log('S3 Photos state:', s3Photos);
  console.log('DB Photos:', dbPhotos);

  // Get photos from S3
  const roomS3Photos = s3Photos['other'] || []; // Changed from room.type to 'other'
  const dbPhotoUrls = new Set(dbPhotos.map(photo => photo.photo_url));
  const uniqueS3Photos = roomS3Photos.filter(url => !dbPhotoUrls.has(url));

  console.log('Unique S3 Photos:', uniqueS3Photos);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Add More Photos</h3>
        <FileUpload
          onUploadComplete={(urls) => handlePhotoUpload(room.id, urls)}
          accept="image/jpeg,image/png,image/jpg"
          uploadType="existing"
          projectFolder={project.s3_folder_path}
          roomType={room.type}
          roomId={room.id}
        />
      </div>

      {/* All Photos Display */}
      {(dbPhotos.length > 0 || uniqueS3Photos.length > 0) && (
        <div>
          <h3 className="text-lg font-medium mb-4">Current Room Photos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* DB Photos */}
            {dbPhotos.map((photo, index) => (
              <div key={`db-${index}`} className="relative group">
                <img 
                  src={photo.photo_url} 
                  alt={`Room photo ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemovePhoto(room.id, index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove photo"
                >
                  ×
                </button>
              </div>
            ))}

            {/* S3 Photos */}
            {uniqueS3Photos.map((url, index) => (
              <div key={`s3-${index}`} className="relative group">
                <img 
                  src={url} 
                  alt={`Additional room photo ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspiration Photos */}
      {room.inspiration_photos?.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">
            {t('projectDetails.rooms.photos.inspiration')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {room.inspiration_photos.map((photo, index) => (
              <img 
                key={index}
                src={photo.photo_url} 
                alt={`Inspiration ${index + 1}`}
                className="rounded-lg object-cover h-48 w-full"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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
            {('Project ' + project.id )}
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

              {/* Photos Section */}
              {renderRoomPhotos(room)}
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