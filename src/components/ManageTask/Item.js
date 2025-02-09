import React, { useState, useRef, useEffect } from "react";
import PropTypes from 'prop-types';
import ItemIcons from "./ItemIcons";
import "./Item.css";

const Item = ({ item, toggleCheckBox, onEditText, onDeleteItem }) => {
  // Create States that are specific to this component
  const [assignmentText, setAssignmentText] = useState(item.name);
  const [assignmentEditMode, setAssignmentEditMode] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (assignmentEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [assignmentEditMode]);

  useEffect(() => {
  setAssignmentText(item.name); // ✅ Sync local state when item updates
}, [item.name]);


  const handleEditText = async (editText, id) => {
    if (!editText.trim()) return; // Prevent saving empty names
  await onEditText(editText, id); // ✅ Update the task name in the parent component
  setAssignmentEditMode(false); // ✅ Exit edit mode
  };

  const handleKeyPress = (e) => {
  if (e.key === "Enter") {
    handleEditText(assignmentText, item.id); // ✅ Call save function on Enter key
  }
};

  const handleEditClick = () => {
    if (assignmentEditMode) {
      handleEditText(assignmentText, item.id); // Call handleEditText to update the text
    } else { 
      setAssignmentEditMode(true); // Enter edit mode
    }
  };

  return (
    <li>
      <div className="todoItem" style={{ backgroundColor: `${item.color}` }}>
        {assignmentEditMode ? (
          <div className='todoEdit'>
            <input
              ref={inputRef}
              type='text'
              value={assignmentText}
              onChange={e => setAssignmentText(e.target.value)}
              onKeyDown={handleKeyPress} // ✅ Listen for Enter key
            />
          </div>
        ) : (
          <div className={item.status === "Completed"  ? 'todoText done' : 'todoText active'}>
            {/* <p>{item.name}</p> */}
            <p>{assignmentEditMode ? assignmentText : item.name}</p>
          </div>
        )}
        <ItemIcons
          item={item}

          //^ Use Parent Handlers
          toggleCheckBox={toggleCheckBox} 
          onDeleteItem={onDeleteItem} 
   
          //^ Use Local Handlers
          onEditText={handleEditClick} // Pass down assignmentEditMode to ItemIcons.js as props 
          assignmentText={assignmentText} // Pass assignmentText as a prop
          assignmentEditMode={assignmentEditMode} // Pass down assignmentEditMode to ItemIcons.js as props 
        />
      </div>
    </li>
  );
};

Item.propTypes = {
  item: PropTypes.object.isRequired,
  toggleCheckBox: PropTypes.func.isRequired,
  onDeleteItem: PropTypes.func.isRequired,
  onEditText: PropTypes.func.isRequired,
};

export default Item;
