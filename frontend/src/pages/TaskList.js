import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTasks } from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const tasksData = await fetchTasks();
        setTasks(tasksData);
        setError(null);
      } catch (err) {
        setError('Failed to load tasks. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
    
    // Poll for updates every 5 seconds
    const intervalId = setInterval(loadTasks, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading && tasks.length === 0) {
    return <Loader size="large" />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="page-container">
      <div className="page-title">
        <h1>Tasks Dashboard</h1>
        <Link to="/tasks/new" className="button">Create New Task</Link>
      </div>
      
      {tasks && tasks.length > 0 ? (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
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
      ) : (
        <div className="card">
          <p className="status-message">No tasks found. Create a new task to get started.</p>
        </div>
      )}
    </div>
  );
}

export default TaskList; 