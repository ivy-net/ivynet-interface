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

  const filteredErrors = errors.filter(error => error !== "NoMetrics");

  const hasErrors = !isChecked && filteredErrors.length > 0;

  return (
    <>
      <div className="flex items-center justify-center">
        <button
          className={`p-2 rounded-lg transition-colors ${hasErrors ? 'hover:bg-red-500/10' : ''}`}
          onClick={() => hasErrors && setShowErrorModal(true)}
          disabled={!hasErrors}
        >
          <CheckedIcon isChecked={isChecked} />
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
