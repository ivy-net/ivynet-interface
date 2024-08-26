import React from "react";
import { MachineRequirement } from "./MachineRequirement";

interface MachineRequirementsProps {
};

export const MachineRequirements: React.FC<MachineRequirementsProps> = ({ }) => {

  return (
    <div className="flex flex-col gap-4">
      <h4>Machine Requirements</h4>
      <div>
        <div className="flex gap-28">
          <div className="flex flex-col w-1/2 gap-2">
            <MachineRequirement title="CPU" requirement="2 Cores" />
            <MachineRequirement title="Memory" requirement="32 GB" />
          </div>
          <div className="flex flex-col w-1/2 gap-2">
            <MachineRequirement title="Storage" requirement="12 TB" />
            <MachineRequirement title="Bandwith" requirement="124 TB" />
          </div>
        </div>
      </div>
    </div>
  );
}
