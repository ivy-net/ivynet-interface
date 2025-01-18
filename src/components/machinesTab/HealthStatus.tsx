import React, { useState } from 'react';
import { CheckedIcon } from "../shared/checkedIcon";
import NodeErrorModal from './NodeErrorModal';

interface HealthStatusProps {
  isChecked: boolean;
  errors: string[];
  avsName?: string;
}

const HealthStatus: React.FC<HealthStatusProps> = ({
  isChecked,
  errors = [],
  avsName = "AVS"
}) => {
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Filter out NoMetrics from errors
  const filteredErrors = errors.filter(error => error !== "NoMetrics");

  // Show green checkmark if there are no errors after filtering out NoMetrics
  const effectivelyHealthy = filteredErrors.length === 0;

  // Only show error modal and make button clickable if there are actual errors
  const hasClickableErrors = filteredErrors.length > 0;

  return (
    <>
      <div className="flex items-center justify-center">
        <button
          className={`p-2 rounded-lg transition-colors ${hasClickableErrors ? 'hover:bg-red-500/10' : ''}`}
          onClick={() => hasClickableErrors && setShowErrorModal(true)}
          disabled={!hasClickableErrors}
        >
          <CheckedIcon isChecked={effectivelyHealthy} />
        </button>
      </div>

      <NodeErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        errors={errors}
        avsName={avsName}
      />
    </>
  );
};

export default HealthStatus;
