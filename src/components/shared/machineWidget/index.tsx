import React from "react";
import { shortenAddress } from "../../../utils";
import machineIcon from "../../../images/machine.svg"
import { ConnectedIcon } from "../connectedIcon";
import { ConditionalLink } from "../conditionalLink";
import arrowUpRight from "./../../../images/arrow-up-right.svg"


interface MachineWidgetProps {
  name: string;
  address: string;
  isConnected?: boolean;
  to?: string;
};

export const MachineWidget: React.FC<MachineWidgetProps> = ({ name, address, isConnected, to = "" }) => {
  const hoverClasses = to ? "hover:bg-widgetHoverBg" : "";

  return (
    <ConditionalLink to={to}>
      <div className={`flex gap-1 px-2 rounded-lg items-center w-fit ${hoverClasses}`}>
        <div className="p-2.5 h-[40px] w-[40px] bg-sidebarIconHighlightColor/[0.15] rounded-full relative">
          <img src={machineIcon} alt="machine icon" />
          {isConnected !== undefined && <div className="absolute right-0 bottom-0">
            <ConnectedIcon isConnected={isConnected} />
          </div>}
        </div>

        <div className="flex flex-col py-1.5 px-3">
          <div className={`flex w-fit gap-1 rounded-lg ${hoverClasses}`}>
            <div className="text-textPrimary text-base font-light">{name}</div>
            {/* <div className="text-sm text-white">{content}</div> */}
            {to && <img src={arrowUpRight} alt="chevron right" />}
          </div>
          <div className="text-sidebarColor text-sm leading-4">{shortenAddress(address)}</div>
        </div>
      </div>
    </ConditionalLink>
  );
}
