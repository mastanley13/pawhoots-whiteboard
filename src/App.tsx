// import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { EmployeeResourcesPage } from './EmployeeResourcesPage'; // Corrected path for flat structure
import { Header } from './components/Header';
import BoardingBoard from './boarding/BoardingBoard';
import { Footer } from './components/Footer';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate replace to="/employee-resources" />} />
        <Route path="/employee-resources" element={<EmployeeResourcesPage />} />
        {(import.meta as any).env?.VITE_FEATURE_BOARDING && (
          <Route path="/boarding" element={<BoardingBoard />} />
        )}
        {/* Add other routes here if needed */}
      </Routes>
      <Footer />
    </>
  );
}

export default App; 
