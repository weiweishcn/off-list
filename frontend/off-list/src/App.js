import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PropertyListingPage from './components/PropertyListingPage';
import PropertyDetails from './components/PropertyDetails';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<PropertyListingPage />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;