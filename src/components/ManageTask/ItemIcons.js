import React from "react";
import { RiDeleteBin2Line, RiFileEditLine, RiSave2Line, RiCheckboxLine, RiCheckboxBlankLine } from "react-icons/ri";
import PropTypes from 'prop-types';

const ItemIcons = ({ item, toggleCheckBox, onDeleteItem, onEditText, assignmentEditMode }) => {

  // ✅ Reusable IconButton component
  const IconButton = ({ onClick, Icon }) => (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer" }}>
      <Icon />
    </button>
  );
  return (
    <div className="todoIcons">
      <IconButton
        onClick={() => toggleCheckBox(item.id)}
        Icon={item.status === "Completed" ? RiCheckboxLine : RiCheckboxBlankLine} // ✅ Fix to use `status`
      />
      <IconButton
        onClick={onEditText} //^ Toggle Edit or Save Icon
        Icon={assignmentEditMode ? RiSave2Line : RiFileEditLine}
      />
      
      <IconButton
        onClick={() => onDeleteItem(item.id)}
        Icon={RiDeleteBin2Line}
      />
    </div>
  );
};

ItemIcons.propTypes = {
  item: PropTypes.object.isRequired,
  toggleCheckBox: PropTypes.func.isRequired,
  onDeleteItem: PropTypes.func.isRequired,
  onEditText: PropTypes.func.isRequired,
  assignmentEditMode: PropTypes.bool.isRequired

};

export default ItemIcons;

