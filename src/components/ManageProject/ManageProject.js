import React from "react";
import "./ManageProject.css";

const ManageProject = ({ clientProjectArray, selectedProject, setSelectedProject, deleteProject }) => {
  return (
    <div className="project-list">
      {!selectedProject ? (
        <>
          <h2>List of Projects:</h2>
          <ul>
            {clientProjectArray.map((project) => (
              <li
                key={project.id}
                className="project-item"
                onClick={(e) => {
                  if (e.target.classList.contains("delete-project-button")) return; 
                  setSelectedProject(project);
                }}
              >
                <span className="project-name">{project.name}</span>
                <button
                  className="delete-project-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project.id);
                  }}
                >
                  🗑️ Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <button className="back-button" onClick={() => setSelectedProject(null)}>
            ← Back to Projects
          </button>
          <h2>{selectedProject.name}</h2>
        </>
      )}
    </div>
  );
};

export default ManageProject;
