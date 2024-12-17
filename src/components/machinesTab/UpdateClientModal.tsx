import React from "react";
import { CodeModalUpdate} from "../shared/CodeModalUpdate";


interface UpdateClientModalProps {
}

export const UpdateClientModal: React.FC<UpdateClientModalProps> = () => {
  const title = "Ivy Client Update";
  const code =
    `https://docs.ivynet.dev/docs/client/QuickstartGuide`
  return (
    <CodeModalUpdate title={title} code={code} />
  );
}
