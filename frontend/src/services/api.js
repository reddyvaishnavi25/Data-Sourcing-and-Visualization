import axios from 'axios';

const API_URL = '/api';

// Task-related API calls
export const fetchTasks = async () => {
  try {
    const response = await axios.get(`${API_URL}/tasks`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const fetchTask = async (taskId) => {
  try {
    const response = await axios.get(`${API_URL}/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error);
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await axios.post(`${API_URL}/tasks`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Data-related API calls
export const fetchTaskData = async (taskId, filters = {}) => {
  try {
    // Convert filters object to query string parameters
    const queryString = Object.entries(filters)
      .filter(([_, value]) => value) // Filter out empty values
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    const url = `${API_URL}/tasks/${taskId}/data${queryString ? `?${queryString}` : ''}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for task ${taskId}:`, error);
    throw error;
  }
}; 