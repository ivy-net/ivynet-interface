import React, { useState } from 'react';
import { CheckedIcon } from "../shared/checkedIcon";

interface HealthStatusProps {
  isChecked: boolean;
  errors: string[];
}

const HealthStatus: React.FC<HealthStatusProps> = ({ isChecked, errors = [] }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleErrorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('https://docs.ivynet.dev/docs/client/clientDocs#node-error-definitions', '_blank');
  };

  // Only show interactive elements if there are errors
  const hasErrors = !isChecked && errors.length > 0;

  return (
    <div
      className="relative group"
      onMouseLeave={() => hasErrors && setShowTooltip(false)}
    >
      {/* Icon container - only add interactive classes if there are errors */}
      <div
        className={`flex items-center justify-center p-3 -m-3 ${hasErrors ? 'cursor-pointer' : ''}`}
        onMouseEnter={() => hasErrors && setShowTooltip(true)}
      >
        <CheckedIcon isChecked={isChecked} />
      </div>

      {/* Tooltip - only shown when there are errors */}
      {showTooltip && hasErrors && (
        <div
          className="absolute z-50 left-1/2 transform -translate-x-1/2 mt-2 w-64"
          onMouseEnter={() => setShowTooltip(true)}
        >
          <div className="bg-widgetBg border border-textGrey text-textPrimary p-3 rounded-lg shadow-lg">
            <div className="space-y-2">
              <p className="font-medium text-sm text-textSecondary">Errors:</p>
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li
                    key={index}
                    className="text-sm text-textWarning flex items-start cursor-pointer hover:text-textGrey transition-colors duration-200"
                    onClick={handleErrorClick}
                  >
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
