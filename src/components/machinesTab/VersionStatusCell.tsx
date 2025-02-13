import React, { useState } from 'react';
import { CheckedIcon } from "../shared/checkedIcon";
import { VersionStatusModal } from './VersionStatusModal';

interface VersionStatusCellProps {
  updateStatus: string;
  currentVersion: string;
  latestVersion: string;
  avsName?: string;
}

const VersionStatusCell: React.FC<VersionStatusCellProps> = ({
  updateStatus,
  currentVersion,
  latestVersion,
  avsName = "AVS"
}) => {
  const [showVersionModal, setShowVersionModal] = useState(false);

  // Determine if version is up to date
  const isUpToDate = updateStatus === 'UpToDate' || currentVersion === 'Local';

  // Determine if we should show clickable state (when there's a version mismatch)
  const hasVersionMismatch = updateStatus === 'Updateable';

  // Show modal on click regardless of status
  const isUnknown = updateStatus === 'Unknown';

  return (
    <>
      <div className="flex items-center justify-center">
        <button
          className={`p-2 rounded-lg transition-colors ${
            isUnknown ? 'hover:bg-gray-500/10' :
            hasVersionMismatch ? 'hover:bg-red-500/10' :
            'hover:bg-gray-500/10'
          }`}
          onClick={() => setShowVersionModal(true)}
        >
          {isUnknown ? (
            <span>---</span>
          ) : (
            <CheckedIcon isChecked={isUpToDate} />
          )}
        </button>
      </div>

      <VersionStatusModal
        isOpen={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        updateStatus={updateStatus}
        currentVersion={currentVersion}
        latestVersion={latestVersion}
        avsName={avsName}
      />
    </>
  );
};

export default VersionStatusCell;
