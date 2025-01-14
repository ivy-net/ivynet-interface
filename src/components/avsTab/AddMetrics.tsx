import React from "react";
import { AddMetricsUpdate } from "../shared/AddMetrics";
import { useNavigate } from "react-router-dom";  // Add this import

interface AddMetricsProps {
  onClose?: () => void;
  isOpen?: boolean;
  machineId?: string;
}

export const AddMetricsModal: React.FC<AddMetricsProps> = ({
  onClose,
  isOpen = true,
}) => {
  const navigate = useNavigate();  // Add this hook
  const title = "Not seeing metrics? Run or modify this script!";
  const code = `https://docs.ivynet.dev/docs/client/AVSstartup`;

  const handleClose = () => {
    navigate('/metrics');  // This will navigate back to the metrics page
    if (onClose) {
      onClose();
    }
  };

  return (
    <AddMetricsUpdate
      title={title}
      code={code}
      isOpen={isOpen}
      onClose={handleClose}
    />
  );
};