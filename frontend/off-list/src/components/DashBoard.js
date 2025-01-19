import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StripeSubscription from './StripeSubscription';

function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [designRequests, setDesignRequests] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    // Check for auth token
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Get username from token or localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Fetch subscription status
    const checkSubscription = async () => {
      try {
        const response = await fetch('/api/subscription-status', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setSubscription(data.subscription);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };

    checkSubscription();

    const fetchProjects = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/projects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const projectsArray = Array.isArray(data) ? data : data.projects || [];

        const formattedRequests = projectsArray.map(project => ({
          id: project.id,
          status: project.status || 'Pending',
          type: project.rooms?.length > 0 ? project.rooms.map(r => r.type).join(', ') : 'N/A',
          submittedDate: new Date(project.created_at).toLocaleDateString(),
          designer: project.designer_id ? 'Assigned' : 'Not Assigned',
          action: `/project/${project.id}`
        }));

        setDesignRequests(formattedRequests);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  const handleSubscriptionComplete = async (data) => {
    setShowSubscriptionModal(false);
    const response = await fetch('/api/subscription-status', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const newData = await response.json();
    setSubscription(newData.subscription);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {t('dashboard.welcome', { username })}
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t('dashboard.actions.logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Status */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold mb-2">{t('dashboard.subscription.title')}</h2>
              <p className="text-gray-600">
                {subscription 
                  ? t('dashboard.subscription.active', { plan: subscription.plan })
                  : t('dashboard.subscription.noActive')
                }
              </p>
            </div>
            {!subscription && (
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {t('dashboard.subscription.subscribe')}
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div 
            onClick={() => navigate('/designRequest')}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
          >
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">{t('dashboard.createRequest.title')}</h2>
              <p className="text-gray-600">{t('dashboard.createRequest.description')}</p>
            </div>
          </div>

          <div 
            onClick={() => navigate('/contact')}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
          >
            <div className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">{t('dashboard.support.title')}</h2>
              <p className="text-gray-600">{t('dashboard.support.description')}</p>
            </div>
          </div>
        </div>

        {/* Design Requests Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">{t('dashboard.designRequests.title')}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.designRequests.table.projectId')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.designRequests.table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.designRequests.table.rooms')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.designRequests.table.submitted')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.designRequests.table.lastUpdated')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.designRequests.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {designRequests.length > 0 ? (
                  designRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{request.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {t(`dashboard.designRequests.status.${request.status.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.submittedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.designer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        <Link to={request.action} className="hover:text-blue-900">
                          {t('dashboard.actions.viewDetails')}
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      {t('dashboard.designRequests.empty')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscription Modal */}
        {showSubscriptionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{t('dashboard.subscription.title')}</h2>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <StripeSubscription onSubscriptionComplete={handleSubscriptionComplete} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;