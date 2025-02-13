import React from 'react';

interface VersionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateStatus: string;
  currentVersion: string;
  latestVersion: string;
  avsName: string;
}

const truncateVersion = (version: string): string => {
  if (!version) return version;
  if (version.length <= 20) return version;
  return `${version.slice(0, 20)}`;
};

export const VersionStatusModal: React.FC<VersionStatusModalProps> = ({
  isOpen,
  onClose,
  updateStatus,
  currentVersion,
  latestVersion,
  avsName
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const displayCurrentVersion = currentVersion === "0.0.0" ? "---" :
                              currentVersion === "Local" ? "Local" :
                              (currentVersion === "latest" && latestVersion === "latest") ? "outdated" :
                              truncateVersion(currentVersion);

  const displayLatestVersion = (currentVersion === "Othentic" || currentVersion === "Local") ?
                              "Local" :
                              truncateVersion(latestVersion);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-widgetBg border border-textGrey rounded-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-textGrey">
          <h2 className="text-xl font-semibold text-textPrimary">{`${avsName} Version Status`}</h2>
          <button
            onClick={onClose}
            className="text-textGrey hover:text-textPrimary"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-textSecondary">Update Status:</span>
              <span className="text-textPrimary">{updateStatus}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textSecondary">Version Running:</span>
              <span className="text-textPrimary">{displayCurrentVersion || '---'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textSecondary">Latest Version:</span>
              <span className="text-textPrimary">{displayLatestVersion || '---'}</span>
            </div>
          </div>

          {updateStatus === 'Unknown' && (
            <div className="mt-4 p-3 bg-black bg-opacity-20 rounded-lg">
              <p className="text-sm text-textSecondary">
                Note: Version information is currently N/A if AVS lacks docker container or requires local build. Not all AVS use semantic versioning.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
