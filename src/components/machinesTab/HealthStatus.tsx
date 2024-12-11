import React, { useState } from 'react';

interface HealthStatusProps {
  isConnected: boolean;
  errors: string[];
}

const HealthStatus: React.FC<HealthStatusProps> = ({ isConnected, errors = [] }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Don't show tooltip if there are no errors
  if (isConnected || errors.length === 0) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-positive"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="flex items-center justify-center"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="w-2 h-2 rounded-full bg-textWarning"></div>
      </div>

      {showTooltip && (
        <div className="absolute z-50 left-1/2 transform -translate-x-1/2 mt-2 w-64">
          <div className="bg-widgetBg border border-textGrey text-textPrimary p-3 rounded-lg shadow-lg">
            <div className="space-y-2">
              <p className="font-medium text-sm text-textSecondary">Errors:</p>
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-textWarning flex items-start">
                    <span className="mr-2">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthStatus;
