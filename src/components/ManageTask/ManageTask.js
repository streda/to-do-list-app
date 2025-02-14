import React from "react";
import PropTypes from "prop-types";
import Item from "./Item";
import "./ManageTask.css";

const API_BASE_URL = "https://api.to-dolist.xyz";
const ManageTask = ({ assignments, setAssignments, assignmentStatus, deleteTask }) => {
  const assignmentArray = assignments.filter((item) =>
  assignmentStatus === "Active"
    ? item.status !== "Completed" // ✅ Show only Pending tasks
    : assignmentStatus === "Completed"
    ? item.status === "Completed" // ✅ Show only Completed tasks
    : item // Show all tasks
);

  const toggleCheckBox = async (taskId) => {
  try {
    // Find the task to update
    const taskToUpdate = assignments.find((task) => task.id === taskId);
    if (!taskToUpdate) return;

    const updatedStatus = taskToUpdate.status === "Completed" ? "Pending" : "Completed";
    console.log("Updating status to:", updatedStatus);

    // ✅ 1. Update UI immediately
    setAssignments((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: updatedStatus } : task
      )
    );

    // ✅ 2. Update in the backend
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: updatedStatus }),
    });

    if (!response.ok) throw new Error("Failed to update task status.");

    const updatedTask = await response.json();
    console.log("✅ Updated Task:", updatedTask);

    // ✅ 3. Ensure fresh state update
    setAssignments((prev) =>
      prev.map((task) =>
        task.id === taskId ? updatedTask : task
      )
    );

  } catch (error) {
    console.error("Error updating task status:", error);
  }
};

  const onDeleteItem = async (taskId) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const onEditText = async (editText, taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editText }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task.");
      }

      setAssignments((prev) =>
        prev.map((item) =>
          item.id === taskId ? { ...item, name: editText } : item
        )
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  if (assignmentArray.length === 0) {
    return (
      <ul className="assignment-list">
        <div className="empty-assignment-list">
          {assignments.length === 0 ? (
            <p>You are all caught up! <br /></p>
          ) : (
            <p>You don't have any {assignmentStatus.toLowerCase()} tasks</p>
          )}
        </div>
      </ul>
    );
  }

  return (
    <ul className="assignment-list">
      {assignmentArray.map((item) => (
        <Item
          key={item.id}
          item={item}
          toggleCheckBox={() => toggleCheckBox(item.id)} // ✅ Ensure function is properly called
          onEditText={onEditText}
          onDeleteItem={onDeleteItem}
        />
      ))}
    </ul>
  );
};

ManageTask.propTypes = {
  assignments: PropTypes.array.isRequired,
  setAssignments: PropTypes.func.isRequired,
  assignmentStatus: PropTypes.string.isRequired,
  deleteTask: PropTypes.func.isRequired,
};

export default ManageTask;
