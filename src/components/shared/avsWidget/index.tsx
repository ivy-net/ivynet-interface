import React from "react";
import avsIcon from "../../../images/avs.svg"

interface AvsWidgetProps {
  name: string;
  description: string;
};

export const AvsWidget: React.FC<AvsWidgetProps> = ({ name, description }) => {

  return (
    <div className="flex gap-1 items-center">
      <div className="p-2.5 h-[40px] w-[40px] bg-sidebarIconHighlightColor/[0.15] rounded-full relative">
        <img src={avsIcon} alt="avs icon" />
      </div>
      <div className="flex flex-col py-1.5 px-3">
        <div className="text-textPrimary text-base font-light">{name}</div>
        <div className="text-sidebarColor text-sm leading-4">{description}</div>
      </div>
    </div>
  );
}
