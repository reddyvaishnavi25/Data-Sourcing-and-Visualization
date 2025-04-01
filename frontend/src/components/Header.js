import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <div className="container">
        <nav>
          <div className="logo">
            <Link to="/">
              <h1>E-Commerce Data Sourcing and Data Visualization</h1>
            </Link>
          </div>
          <ul className="nav-links">
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/tasks">Tasks</Link>
            </li>
            <li>
              <Link to="/tasks/new" className="button">New Task</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header; 