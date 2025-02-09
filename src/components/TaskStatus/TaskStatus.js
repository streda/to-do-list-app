import "./TaskStatus.css";

//! A function that deals with the "ALL", "Active", and "Completed" tasks

export default function TaskStatus({ assignmentStatus, setAssignmentStatus }) {
  const viewAssignmentsStatus = ["All", "Active", "Completed"];

  return (
    <div className="filter-task-status">
      {
        viewAssignmentsStatus.map((item, index) => {
          return (
            <div
              className="todoFilterParam"
              key={index}
            >
              <button
                onClick={() => setAssignmentStatus(item)}
                className={`filter-task-status-btn ${
                  assignmentStatus === item ? "active" : ""
                }`}
              >
                {item}

              </button>
            </div>
          );
        })
      }

    </div>
  );
}
