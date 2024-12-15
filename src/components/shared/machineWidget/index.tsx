import React, { useState } from 'react';
import { shortenAddress } from "../../../utils";
import machineIcon from "../../../images/machine.svg";
import copyIcon from "../../../images/copy.svg";
import { ConnectedIcon } from "../connectedIcon";
import { ConditionalLink } from "../conditionalLink";
import arrowUpRight from "./../../../images/arrow-up-right.svg";

interface MachineWidgetProps {
  name: string;
  address: string;
  isConnected?: boolean;
  to?: string;
  maxNameLength?: number;
  showCopy?: boolean;
  isHeader?: boolean;
}

export const MachineWidget: React.FC<MachineWidgetProps> = ({
  name,
  address,
  isConnected,
  to = "",
  maxNameLength = 12,
  showCopy = false,
  isHeader = false
}) => {
  const [copied, setCopied] = useState(false);

  const truncateName = (str: string) => {
    if (isHeader) return str;
    if (str.length <= maxNameLength) return str;
    return `${str.slice(0, maxNameLength)}...`;
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const hoverClasses = to ? "hover:bg-widgetHoverBg" : "";

  const content = (
    <div className={`flex items-center gap-3 px-1.5 rounded-lg w-fit ${hoverClasses}`}>
      <div className={`relative p-2 ${isHeader ? 'h-10 w-10' : 'h-8 w-8'} bg-sidebarIconHighlightColor/[0.15] rounded-full`}>
        <img src={machineIcon} alt="machine icon" className="w-full h-full" />
        {isConnected !== undefined && (
          <div className="absolute -right-0.5 -bottom-0.5">
            <ConnectedIcon isConnected={isConnected} />
          </div>
        )}
      </div>
      <div className="flex flex-col py-1">
        <div className={`flex items-center gap-1 ${hoverClasses}`}>
          <span className={`text-textPrimary font-light ${isHeader ? 'text-lg' : 'text-sm'}`}>
            {truncateName(name)}
          </span>
          {to && <img src={arrowUpRight} alt="chevron right" className="w-3 h-3" />}
        </div>
        {isHeader ? (
          <div className="flex items-center gap-1">
            <span className="text-sm text-sidebarColor leading-tight">{address}</span>
            {showCopy && (
              <div className="relative flex items-center">
                <button
                  onClick={handleCopy}
                  className="ml-1 p-1 hover:bg-bgButton rounded transition-colors"
                  title="Copy machine ID"
                >
                  <img
                    src={copyIcon}
                    alt="copy"
                    className={`w-4 h-4 ${copied ? 'text-positive' : 'text-textSecondary'}`}
                  />
                </button>
                {copied && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    Copied!
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-sidebarColor leading-tight">
            {shortenAddress(address)}
          </span>
        )}
      </div>
    </div>
  );

  return to ? <ConditionalLink to={to}>{content}</ConditionalLink> : content;
};
