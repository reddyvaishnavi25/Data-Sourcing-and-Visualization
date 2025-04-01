import React from 'react';

function ErrorMessage({ message }) {
  return (
    <div className="error-container">
      <div className="error-message">
        {message || 'An error occurred. Please try again.'}
      </div>
    </div>
  );
}

export default ErrorMessage; 