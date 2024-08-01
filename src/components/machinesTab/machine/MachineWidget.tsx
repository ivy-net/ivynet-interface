import React from "react";
import { shortenAddress } from "../../../utils";
import machineIcon from "../../../images/machine.svg"
import { ConnectedIcon } from "../../shared/connectedIcon";

interface MachineWidgetProps {
  name: string;
  address: string;
  isConnected: boolean;
};

export const MachineWidget: React.FC<MachineWidgetProps> = ({ name, address, isConnected }) => {

  return (
    <div className="flex gap-1 items-center">
      <div className="p-2.5 h-[60px] w-[60px] flex justify-center items-center bg-sidebarIconHighlightColor/[0.15] rounded-full relative">
        <img src={machineIcon} alt="machine icon" />
      </div>
      <div className="flex flex-col py-1.5 px-3 gap-1">
        <div className="flex gap-2">
          <h2>{name}</h2>
          <ConnectedIcon isConnected={isConnected} />
        </div>
        <div className="text-sidebarColor text-base leading-6 font-light">{shortenAddress(address)}</div>
      </div>
    </div>
  );
}
