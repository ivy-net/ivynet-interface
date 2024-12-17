import React, { useState } from 'react';
import { CheckedIcon } from "../shared/checkedIcon";  // Update the import path as needed

interface HealthStatusProps {
  isChecked: boolean;
  errors: string[];
}

const HealthStatus: React.FC<HealthStatusProps> = ({ isChecked, errors = [] }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <div
        className="flex items-center justify-center"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <CheckedIcon isChecked={isChecked} />
      </div>
      {showTooltip && !isChecked && errors.length > 0 && (
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
