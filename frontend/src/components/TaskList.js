import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

function TaskList({ tasks }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="card">
        <p className="status-message">No tasks found. Create a new task to get started.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Your Tasks</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td>{task.name}</td>
                <td>{task.type}</td>
                <td>
                  <StatusBadge status={task.status} />
                </td>
                <td>{new Date(task.created_at).toLocaleString()}</td>
                <td>
                  <Link to={`/tasks/${task.id}`} className="button">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TaskList; 