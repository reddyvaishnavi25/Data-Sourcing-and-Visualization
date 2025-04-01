import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TaskList from './pages/TaskList';
import CreateTask from './pages/CreateTask';
import TaskDetails from './pages/TaskDetails';
import Header from './components/Header';

function App() {
  return (
    <div className="app">
      <Header />
      
      <main>
        <div className="container">
          <Routes>
            <Route path="/" element={<TaskList />} />
            <Route path="/create" element={<CreateTask />} />
            <Route path="/tasks/new" element={<CreateTask />} />
            <Route path="/tasks/:taskId" element={<TaskDetails />} />
            <Route path="/tasks" element={<TaskList />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App; 