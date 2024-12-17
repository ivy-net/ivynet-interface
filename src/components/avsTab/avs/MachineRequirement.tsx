import React from "react";

interface MachineRequirementProps {
  title: string;
  requirement: string;
}

export const MachineRequirement: React.FC<MachineRequirementProps> = ({ title, requirement }) => {

  return (
    <div className="flex">
      <div className="text-base leading-5 text-sidebarColor font-medium">{title}</div>
      <div className="ml-auto text-base leading-5 text-textSecondary font-medium">{requirement}</div>
    </div>
  );
}
