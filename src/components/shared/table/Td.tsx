import React from "react";
import { ConditionalLink } from "../conditionalLink";
import arrowUpRight from "./../../../images/arrow-up-right.svg"

import { ConnectedIcon } from "../connectedIcon";
import { CheckedIcon } from "../checkedIcon";
import { DiskSpaceStatus } from "../diskSpaceStatus";


interface TdProps {
  isConnected?: boolean
  isChecked?: boolean
  diskStatus?: "fair" | "critical" | "good"
  content?: string
  to?: string;
  children?: React.ReactNode
};

export const Td: React.FC<TdProps> = ({ content, children, to, isConnected, isChecked, diskStatus }) => {
  const hoverClasses = to ? "hover:bg-widgetHoverBg" : "";
  const hasConnectedIcon = isConnected !== undefined;
  const hasCheckedIcon = isChecked !== undefined;
  const hasDiskStatus = diskStatus !== undefined;

  return (
    <td className="h-[72px]">

      {content &&
        <ConditionalLink to={to}>
          <div className={`flex w-fit gap-1 rounded-lg p-2 ${hoverClasses}`}>
            <div className="text-sm text-white">{content}</div>
            {to && <img src={arrowUpRight} alt="chevron right" />}
          </div>
        </ConditionalLink>
      }

      {hasConnectedIcon && <ConnectedIcon isConnected={isConnected} />}

      {hasCheckedIcon && <CheckedIcon isChecked={isChecked} />}

      {hasDiskStatus && <DiskSpaceStatus status={diskStatus} />}

      {children}
    </td >
  );
}
