import React from "react";
import { shortenAddress } from "../../../utils";
import machineIcon from "../../../images/machine.svg"
import { ConnectedIcon } from "../connectedIcon";

interface MachineWidgetProps {
  name: string;
  address: string;
  isConnected: boolean;
  to: string;
};

export const MachineWidget: React.FC<MachineWidgetProps> = ({ name, address, isConnected, to, }) => {

  return (
    <div className="flex gap-1 items-center">
      <div className="p-2.5 h-[40px] w-[40px] bg-sidebarIconHighlightColor/[0.15] rounded-full relative">
        <img src={machineIcon} alt="machine icon" />
        <div className="absolute right-0 bottom-0">
          <ConnectedIcon isConnected={isConnected} />
        </div>
      </div>
      <div className="flex flex-col py-1.5 px-3">
        <div className="text-textPrimary text-base font-light">{name}</div>
        <div className="text-sidebarColor text-sm leading-4">{shortenAddress(address)}</div>
      </div>
    </div>
  );
}
