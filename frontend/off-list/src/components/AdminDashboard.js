import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProjectsTable = ({ projects, title, sortConfig, onSort, designers, onAssignDesigner }) => {
  const { t } = useTranslation();
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState('');
  const navigate = useNavigate();

  const getNextSortDirection = (field) => {
    if (sortConfig.field !== field) return 'asc';
    if (sortConfig.direction === 'asc') return 'desc';
    return 'asc';
  };

  const renderSortIcon = (field) => {
    if (sortConfig.field !== field) return t('adminDashboard.projectTables.sort.both');
    return sortConfig.direction === 'asc' 
      ? t('adminDashboard.projectTables.sort.asc') 
      : t('adminDashboard.projectTables.sort.desc');
  };

  const handleAssignDesigner = async () => {
    await onAssignDesigner(selectedProject.id, selectedDesigner);
    setShowModal(false);
    setSelectedProject(null);
    setSelectedDesigner('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('name')}
              >
                {t('adminDashboard.projectTables.headers.projectName')} {renderSortIcon('name')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('client_email')}
              >
                {t('adminDashboard.projectTables.headers.client')} {renderSortIcon('client_email')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('designer_email')}
              >
                {t('adminDashboard.projectTables.headers.designer')} {renderSortIcon('designer_email')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('created_at')}
              >
                {t('adminDashboard.projectTables.headers.created')} {renderSortIcon('created_at')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('adminDashboard.projectTables.headers.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.client_email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {project.designer_email || t('adminDashboard.projectTables.unassigned')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(project.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                  {!project.completed && !project.designer_email && (
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {t('adminDashboard.projectTables.actions.assignDesigner')}
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/designer/projects/${project.id}`)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {t('adminDashboard.projectTables.actions.viewDetails')}
                  </button>
                  {project.floor_plan_url && (
                    <button
                      onClick={() => window.open(project.floor_plan_url, '_blank')}
                      className="text-green-600 hover:text-green-900"
                    >
                      {t('adminDashboard.projectTables.actions.viewFloorPlan')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Designer Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                {t('adminDashboard.projectTables.modal.title')}
              </h3>
              <select
                value={selectedDesigner}
                onChange={(e) => setSelectedDesigner(e.target.value)}
                className="w-full p-2 border rounded-md mb-4"
              >
                <option value="">{t('adminDashboard.projectTables.modal.selectDesigner')}</option>
                {designers.map((designer) => (
                  <option key={designer.id} value={designer.id}>
                    {designer.email}
                  </option>
                ))}
              </select>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedProject(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  {t('adminDashboard.projectTables.modal.cancel')}
                </button>
                <button
                  onClick={handleAssignDesigner}
                  disabled={!selectedDesigner}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {t('adminDashboard.projectTables.modal.assign')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    field: 'created_at',
    direction: 'desc'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL;
      
      const [projectsResponse, designersResponse] = await Promise.all([
        fetch(`${apiUrl}/api/admin/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/api/admin/designers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!projectsResponse.ok || !designersResponse.ok) {
        throw new Error(t('errors.fetchFailed'));
      }

      const [projectsData, designersData] = await Promise.all([
        projectsResponse.json(),
        designersResponse.json()
      ]);

      setProjects(projectsData);
      setDesigners(designersData);
    } catch (err) {
      console.error('Error:', err);
      setError(t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDesigner = async (projectId, designerId) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${apiUrl}/api/admin/projects/${projectId}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ designerId })
      });

      if (!response.ok) {
        throw new Error(t('errors.assignFailed'));
      }

      await fetchData();
    } catch (err) {
      console.error('Error:', err);
      setError(t('errors.assignFailed'));
    }
  };

  const handleSort = (field) => {
    const direction = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ field, direction });
  };

  const sortProjects = (projectsToSort) => {
    return [...projectsToSort].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];
      
      if (sortConfig.field === 'created_at') {
        return sortConfig.direction === 'asc' 
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      }
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
  };

  const completedProjects = sortProjects(projects.filter(p => p.completed));
  const uncompletedProjects = sortProjects(projects.filter(p => !p.completed));

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-600">{t('common.loading')}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('adminDashboard.title')}
            </h1>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/login');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t('navigation.logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Projects Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">
              {t('adminDashboard.projectsOverview.activeProjects')}
            </h3>
            <p className="text-3xl font-bold text-blue-600">{uncompletedProjects.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">
              {t('adminDashboard.projectsOverview.completedProjects')}
            </h3>
            <p className="text-3xl font-bold text-green-600">{completedProjects.length}</p>
          </div>
        </div>

        {/* Active Projects Table */}
        <ProjectsTable 
          projects={uncompletedProjects} 
          title={t('adminDashboard.projectTables.activeTitle')}
          sortConfig={sortConfig}
          onSort={handleSort}
          designers={designers}
          onAssignDesigner={handleAssignDesigner}
        />

        {/* Completed Projects Table */}
        <ProjectsTable 
          projects={completedProjects} 
          title={t('adminDashboard.projectTables.completedTitle')}
          sortConfig={sortConfig}
          onSort={handleSort}
          designers={designers}
          onAssignDesigner={handleAssignDesigner}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;