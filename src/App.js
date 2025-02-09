import React from 'react';
import './styles.css';
import ProjectDashboard from './components/ProjectDashboard/ProjectDashboard';

// The App component serves as the root component that sets up the initial structure and routing for the application.
export default function App() {
  return (
    <div className="App">
      {/* Render the ProjectDashboard component */}
      <ProjectDashboard />
    </div>
  );
}