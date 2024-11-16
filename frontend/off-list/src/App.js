import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/Home';
import PropertyDetails from './components/PropertyDetails';
import DesignerDetails from './components/DesignerDetail';
import DesignList from './components/DesignList';
import DesignerList from './components/DesignerList';
import ContactForm from './components/ContactForm';
import LoginPage from './components/LoginPage';
import CreateDesign from './components/CreateDesign';

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
        </Routes>
      </div>
    </Router>
  );
}

export default App;