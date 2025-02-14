import React, { useEffect, useState, useCallback } from 'react';
import AddTask from '../AddTask/AddTask';
import TaskStatus from '../TaskStatus/TaskStatus';
import ManageTask from '../ManageTask/ManageTask';
import AddProject from '../AddProject/AddProject';
import ManageProject from '../ManageProject/ManageProject';
import './ProjectDashboard.css';

const API_BASE_URL = "https://api.to-dolist.xyz";

const ProjectDashboard = () => {
  const [clientProjectArray, setClientProjectArray] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [assignmentStatus, setAssignmentStatus] = useState('All');
  const [inputText, setInputText] = useState('');

  const fetchTasks = useCallback(async (projectId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setAssignments(data); 
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setClientProjectArray(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      setAssignments([]);
      fetchTasks(selectedProject.id);
    }
  }, [selectedProject, fetchTasks]);

  const addProject = async (addNewProject) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addNewProject),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const addedProject = await response.json();
      setClientProjectArray((prev) => [...prev, addedProject]);
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const addTask = async (newTask) => {
    if (!selectedProject) return;
    try {
      if (!newTask.name || newTask.name.trim() === "") return;
      const response = await fetch(`${API_BASE_URL}/projects/${selectedProject.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchTasks(selectedProject.id);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const updateTask = async (updatedTask) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const newTask = await response.json();
      setAssignments((prev) => prev.map(task => task.id === newTask.id ? newTask : task));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      setAssignments((prev) => prev.filter(task => task.id !== taskId));
      await fetchTasks(selectedProject.id);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      setClientProjectArray((prev) => prev.filter((project) => project.id !== projectId));
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject(null);
        setAssignments([]);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleSelectProject = (project) => {
    if (!project) {
      setSelectedProject(null);
      return;
    }
    setSelectedProject(project);
    setAssignments([]);
    fetchTasks(project.id);
  };

  return (
    <div className="dashboard-container">
      {!selectedProject && <AddProject addProject={addProject} />}
      <ManageProject 
        clientProjectArray={clientProjectArray} 
        selectedProject={selectedProject} 
        setSelectedProject={handleSelectProject} 
        deleteProject={deleteProject}
      />
      {selectedProject && (
        <>
          <AddTask inputText={inputText} setInputText={setInputText} addTask={addTask} />
          <TaskStatus assignmentStatus={assignmentStatus} setAssignmentStatus={setAssignmentStatus} />
          <ManageTask assignments={assignments} setAssignments={setAssignments} assignmentStatus={assignmentStatus} updateTask={updateTask} deleteTask={deleteTask} />
        </>
      )}
    </div>
  );
};

export default ProjectDashboard;
