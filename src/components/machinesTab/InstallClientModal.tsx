import React from "react";
import { CodeModal } from "../shared/CodeModal";


interface InstallClientModalProps {
};

export const InstallClientModal: React.FC<InstallClientModalProps> = () => {
  const title = "Install Ivy Client on a New Machine";
  const code =
    `https://docs.ivynet.dev/docs/client/QuickstartGuide`
  return (
    <CodeModal title={title} code={code} />
  );
}
