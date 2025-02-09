import React, { useState } from 'react';
import './AddProject.css';

const AddProject = ({ addProject }) => {  // ✅ Match the prop name with ProjectDashboard.js
  const [projectName, setProjectName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (projectName.trim()) {
      addProject({ name: projectName });  // ✅ Call the correct function
      setProjectName('');
    }
  };

  return (
    <form className="add-project-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Project Name"
      />
      <button type="submit">Add Project</button>
    </form>
  );
};

export default AddProject;
