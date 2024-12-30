import React from 'react';

const ERROR_DEFINITIONS = {
  'ActiveSetNoDeployment': {
    title: 'ActiveSetNoDeployment',
    description: 'The AVS is registered in the active set, but it is malfunctioning in some way and metrics are not being sent.',
    severity: 'critical',
    action: 'Check if the AVS container has crashed. This requires immediate attention.'
  },
  'CrashedNode': {
    title:'CrashedNode',
    description: 'The node is not running, but communication is still happening with the Ivynet Client.',
    severity: 'critical',
    action: 'Check node logs and restart the service if necessary.'
  },
  'IdleNodeNoCommunication': {
    title: 'IdleNodeNoCommunication',
    description: 'Metrics have not been sent in the last 15 minutes.',
    severity: 'high',
    action: 'Verify network connectivity and metrics reporting service.'
  },
  'LowPerformanceScore': {
    title: 'LowPerformanceScore',
    description: 'The performance score for the AVS is lower than 80/100.',
    severity: 'high',
    action: 'Review node performance metrics and optimize configuration.'
  },
  'NeedsUpdate': {
    title: 'NeedsUpdate',
    description: 'The node needs an update.',
    severity: 'high',
    action: 'Check update_status in API for specific update requirements.'
  },
  'NoChainInfo': {
    title: 'NoChainInfo',
    description: 'No chain information added to the AVS instance.',
    severity: 'high',
    action: 'Add chain information to establish active set status and version check.'
  },
  'NoOperatorId': {
    title: 'NoOperatorId',
    description: 'No operator address assigned to this AVS instance.',
    severity: 'high',
    action: 'Configure operator address to enable active set verification.'
  },
  'UnregisteredFromActiveSet': {
    title: 'UnregisteredFromActiveSet',
    description: 'Node is running but the AVS is not registered in the active set.',
    severity: 'high',
    action: 'Register the AVS in the active set if intended.'
  },
  'NoMetrics': {
    title: 'NoMetrics',
    description: 'AVS not producing metrics or metrics port not exposed.',
    severity: 'high',
    action: 'See Metrics Setup in documentation for potential solution.'
  }
} as const;

type ErrorKey = keyof typeof ERROR_DEFINITIONS;

interface NodeErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: string[];
  avsName: string;
}

const NodeErrorModal: React.FC<NodeErrorModalProps> = ({
  isOpen,
  onClose,
  errors,
  avsName
}) => {
  if (!isOpen) return null;

  const handleLearnMore = () => {
    window.open('https://docs.ivynet.dev/docs/client/clientDocs#node-error-definitions', '_blank');
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-widgetBg border border-textGrey rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-between p-4 border-b border-textGrey">
          <h2 className="text-xl font-semibold text-textPrimary">
            {`${avsName} Node Errors`}
          </h2>
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
          {errors.map((error, index) => {
            const errorInfo = ERROR_DEFINITIONS[error as ErrorKey];
            if (!errorInfo) return null;

            return (
              <div
                key={index}
                className="bg-black bg-opacity-20 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <h3 className={errorInfo.severity === 'critical' ? 'text-textWarning font-medium' : 'text-textWarning2 font-medium'}>
                    {errorInfo.title}
                  </h3>
                  <button
                    onClick={handleLearnMore}
                    className="text-ivygrey hover:text-textPrimary"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>

                <p className="text-sm text-textSecondary">
                  {errorInfo.description}
                </p>
                <div className="text-sm text-ivygrey2">
                  <span className="font-medium">Recommended: </span>
                  {errorInfo.action}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NodeErrorModal;
