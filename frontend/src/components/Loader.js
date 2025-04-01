import React from 'react';

function Loader({ size = 'default' }) {
  const spinnerClass = size === 'small' ? 'loader-spinner loader-small' : 'loader-spinner';
  
  return (
    <div className="loader">
      <div className={spinnerClass}></div>
    </div>
  );
}

export default Loader; 