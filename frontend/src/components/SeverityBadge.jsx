import React from 'react';

const SeverityBadge = ({ severity }) => {
  const normalizedSeverity = severity?.toLowerCase() || 'low';
  
  return (
    <span className={`severity-badge ${normalizedSeverity}`}>
      {normalizedSeverity.charAt(0).toUpperCase() + normalizedSeverity.slice(1)}
    </span>
  );
};

export default SeverityBadge;
