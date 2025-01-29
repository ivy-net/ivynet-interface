import React from "react";
import avsIcon from "../../../images/avs.svg"
//import { ConditionalLink } from "../conditionalLink";
import arrowUpRight from "./../../../images/arrow-up-right.svg"

// Fixed the type annotation that was causing the linting error
const truncateString = (str: string, maxLength = 18) => {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};

interface AvsWidgetProps {
  name: string;
  description?: string;
  to?: string;
};

export const AvsWidget: React.FC<AvsWidgetProps> = ({ name, description = "", to = "" }) => {
  const hoverClasses = to ? "hover:bg-widgetHoverBg" : "";
  const displayName = truncateString(name);

  return (
//    <ConditionalLink to={to}>
      <div className={`flex gap-1 p-2 rounded-lg items-center w-fit ${hoverClasses}`}>
        <div className={`flex gap-1 items-center ${hoverClasses}`}>
          <div className="p-2.5 h-[40px] w-[40px] bg-sidebarIconHighlightColor/[0.15] rounded-full relative">
            <img src={avsIcon} alt="avs icon" />
          </div>
          <div className="flex flex-col py-1.5 px-2">
            <div className="text-textPrimary text-base font-light" title={name}>{displayName}</div>
            <div className="text-sidebarColor text-sm leading-4">{description}</div>
          </div>
          {to && <img src={arrowUpRight} alt="chevron right" className="-ml-1.5" />}
        </div>
      </div>
//    </ConditionalLink>
  );
}
