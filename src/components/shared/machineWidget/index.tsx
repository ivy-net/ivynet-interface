import React from "react";
import { shortenAddress } from "../../../utils";
import machineIcon from "../../../images/machine.svg";
import { ConnectedIcon } from "../connectedIcon";
import { ConditionalLink } from "../conditionalLink";
import arrowUpRight from "./../../../images/arrow-up-right.svg";

interface MachineWidgetProps {
  name: string;
  address: string;
  isConnected?: boolean;
  to?: string;
  maxNameLength?: number;
}

export const MachineWidget: React.FC<MachineWidgetProps> = ({
  name,
  address,
  isConnected,
  to = "",
  maxNameLength = 12
}) => {
  const truncateName = (str: string) => {
    if (str.length <= maxNameLength) return str;
    return `${str.slice(0, maxNameLength)}...`;
  };
  const hoverClasses = to ? "hover:bg-widgetHoverBg" : "";

  return (
    <ConditionalLink to={to}>
      <div className={`flex items-center gap-2 px-1.5 rounded-lg w-fit ${hoverClasses}`}>
        <div className="relative p-2 h-8 w-8 bg-sidebarIconHighlightColor/[0.15] rounded-full">
          <img src={machineIcon} alt="machine icon" className="w-full h-full" />
          {isConnected !== undefined && (
            <div className="absolute -right-0.5 -bottom-0.5">
              <ConnectedIcon isConnected={isConnected} />
            </div>
          )}
        </div>

        <div className="flex flex-col py-1">
          <div className={`flex items-center gap-1 ${hoverClasses}`}>
            <span className="text-sm text-textPrimary font-light truncate max-w-[150px]">
              {truncateName(name)}
            </span>
            {to && <img src={arrowUpRight} alt="chevron right" className="w-3 h-3" />}
          </div>
          <span className="text-xs text-sidebarColor leading-tight">
            {shortenAddress(address)}
          </span>
        </div>
      </div>
    </ConditionalLink>
  );
}
