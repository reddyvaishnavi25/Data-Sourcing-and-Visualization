import React from 'react';

function StatusBadge({ status }) {
  // Convert status to the format used in CSS classes
  const statusClass = status.toLowerCase().replace(' ', '_');
  
  return (
    <span className={`badge badge-${statusClass}`}>
      {status}
    </span>
  );
}

export default StatusBadge; 