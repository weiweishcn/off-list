import React from 'react';
import './App.css';
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

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/design/:id" element={<PropertyDetails />} />
          <Route path="/designer/:id" element={<DesignerDetails />} />
          <Route path="/design" element={<DesignList />} />
          <Route path="/designer" element={<DesignerList />} />
          <Route path="/contact" element={<ContactForm />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/designRequest" element={<CreateDesign />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/designer-dashboard" element={<DesignerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;