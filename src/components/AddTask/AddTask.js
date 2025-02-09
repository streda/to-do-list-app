import { useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import "./AddTask.css";

export default function AddTask({ inputText, setInputText, addTask }) {
  
  const handleAddItem = useCallback(() => {
    if (inputText.trim() !== "") { // ✅ Ensure non-empty input
      addTask({ name: inputText, done: false }); // ✅ Send `name` instead of `text`
      setInputText(""); // ✅ Clear input field after adding task
    } else {
      alert("Task name cannot be empty."); // ✅ Show error only for empty input
    }
  }, [inputText, addTask, setInputText]);

  useEffect(() => {
    const inputTextArea = document.getElementById("input-text-area");

    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        event.preventDefault(); // ✅ Prevent form submission
        handleAddItem(); // ✅ Call the function properly
      }
    };

    inputTextArea.addEventListener("keydown", handleKeyPress); // ✅ Change to "keydown" to ensure it detects input
    return () => {
      inputTextArea.removeEventListener("keydown", handleKeyPress); // ✅ Cleanup event listener
    };
  }, [inputText, handleAddItem]); // ✅ Ensure `inputText` and `handleAddItem` are updated correctly

  return (
    <div className="add-task">
      <input
        className="input-text-area"
        id="input-text-area"
        name="taskName"  // ✅ Add a unique name attribute
        type="text"
        placeholder="New Task"
        autoComplete="on"  // ✅ Helps browsers suggest stored inputs
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button onClick={handleAddItem} className="add-button" id="add-button">
        Add
      </button>
    </div>
  );
}

AddTask.propTypes = {
  inputText: PropTypes.string.isRequired,
  setInputText: PropTypes.func.isRequired,
  addTask: PropTypes.func.isRequired,
};

