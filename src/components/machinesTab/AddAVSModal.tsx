import React from "react";
import { CodeModalUpdate } from "../shared/CodeModalUpdate";

interface AddAVSModalProps {
  onClose?: () => void;
  isOpen?: boolean;
  machineId?: string;
}

export const AddAVSModal: React.FC<AddAVSModalProps> = ({
  onClose,
  isOpen = true,
}) => {
  const title = "Add AVS on Machine";
  const code = `https://docs.ivynet.dev/docs/client/clientdocs/#usage`;

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
