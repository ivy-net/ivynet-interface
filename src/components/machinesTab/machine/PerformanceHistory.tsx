import React from "react";
import { shortenAddress } from "../../../utils";
import machineIcon from "../../../images/machine.svg"


interface PerformanceWidgetProps {
  date: string;
  address: string;
  issue: string;
};


export const PerformanceWidget: React.FC<PerformanceWidgetProps> = ({ date, address, issue }) => {

  return (
    <div className="flex gap-1 items-center">
      <div className="p-2.5 h-[60px] w-[60px] flex justify-center items-center bg-sidebarIconHighlightColor/[0.15] rounded-full relative">
        <img src={machineIcon} alt="machine icon" />
      </div>
      <div className="flex flex-col py-1.5 px-3 gap-1">
        <div className="flex gap-2">
          <h4>{date}</h4>
        </div>
        <div className="text-sidebarColor text-base leading-6 font-light">{shortenAddress(address)}</div>
      </div>
      <div className="text-sidebarColor text-base leading-6 font-bold">{issue}</div>
    </div>
  );
}
