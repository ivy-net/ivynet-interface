import React from "react";
import { CodeModalUpdate } from "../shared/CodeModalUpdate";


interface AddAVSModalProps {
};

export const AddAVSModal: React.FC<AddAVSModalProps> = () => {
  const title = "Add AVS on Machine";
  const code =
  `https://docs.ivynet.dev/docs/client/QuickstartGuide`
  return (
    <CodeModalUpdate title={title} code={code} />
  );
}
