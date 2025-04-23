// import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { EmployeeResourcesPage } from './EmployeeResourcesPage'; // Corrected path for flat structure

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/employee-resources" />} />
      <Route path="/employee-resources" element={<EmployeeResourcesPage />} />
      {/* Add other routes here if needed */}
    </Routes>
  );
}

export default App; 