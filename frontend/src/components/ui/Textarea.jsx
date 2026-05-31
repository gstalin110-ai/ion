import React from 'react';

const Textarea = ({ className = '', ...props }) => {
  return (
    <textarea
      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${className}`}
      {...props}
    />
  );
};

export default Textarea;
