import React from "react";
import { CodeModalUpdate } from "../shared/CodeModalUpdate";

interface RescanModalProps {
  onClose?: () => void;
  isOpen?: boolean;
  machineId?: string;
}

export const RescanModal: React.FC<RescanModalProps> = ({
  onClose,
  isOpen = true,
  machineId
}) => {
  const title = "Not seeing your latest AVSs? Rescan!";
  const code = `https://docs.ivynet.dev/docs/client/clientdocs/#scan-for-active-nodes`;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <CodeModalUpdate
      title={title}
      code={code}
      isOpen={isOpen}
      onClose={handleClose}
    />
  );
};
