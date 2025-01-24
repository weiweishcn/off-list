import React, { useState, Suspense } from 'react';
import './App.css';
import "@radix-ui/themes/styles.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import PropertyDetails from './components/PropertyDetails';
import DesignerDetails from './components/DesignerDetail';
import DesignList from './components/DesignList';
import DesignerList from './components/DesignerList';
import ContactForm from './components/ContactForm';
import LoginPage from './components/LoginPage';
import Signup from './components/Signup';
import CreateDesign from './components/CreateDesign';
import DashBoard from './components/DashBoard';
import ContactUs from './components/ContactForm';
import DesignerDashboard from './components/DesignerDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProjectDetails from './components/ProjectDetails';
import DesignerProjectDetails from './components/DesignerProjectDetails';
import Navbar from './components/Navbar';

// Import i18n configuration
import './i18n/config';

import { Theme, ThemePanel } from '@radix-ui/themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Layout component to wrap routes that should have the navigation
const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

// Loading component for Suspense fallback
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-lg text-gray-600">Loading...</div>
  </div>
);

function App() {
  const [lightMode, setLightMode] = useState(true);

  return (
    <Suspense fallback={<Loading />}>
      <Router>
        <Theme appearance={lightMode ? 'light' : 'dark'} radius='medium'>
          <QueryClientProvider client={queryClient}>
            <div className="App">
              <Routes>
                {/* Routes that should have the navbar */}
                <Route path="/" element={<Layout><HomePage /></Layout>} />
                <Route path="/design/:id" element={<Layout><PropertyDetails /></Layout>} />
                <Route path="/designer/:id" element={<Layout><DesignerDetails /></Layout>} />
                <Route path="/design" element={<Layout><DesignList /></Layout>} />
                <Route path="/designer" element={<Layout><DesignerList /></Layout>} />
                <Route path="/contact" element={<Layout><ContactForm /></Layout>} />
                <Route path="/contactus" element={<Layout><ContactUs /></Layout>} />
                
                {/* Routes that shouldn't have the navbar (like auth pages and dashboards) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/designRequest" element={<CreateDesign />} />
                <Route path="/dashboard" element={<DashBoard />} />
                <Route path="/designer-dashboard" element={<DesignerDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/project/:id" element={<ProjectDetails />} />
                <Route path="/designer/projects/:id" element={<DesignerProjectDetails />} />
              </Routes>
            </div>
          </QueryClientProvider>

          {/* <ThemePanel /> */}
        </Theme>
      </Router>
    </Suspense>
  );
}

export default App;