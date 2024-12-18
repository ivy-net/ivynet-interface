import React from 'react';
import chevronRight from "./../../../images/chevron-right.svg"
import { ConditionalLink } from "../conditionalLink";
import { ConnectedIcon } from "../connectedIcon";

interface WidgetItemProps {
  title: string;
  description: string | number;
  to?: string;
  connected?: boolean | null;
  size?: "sm" | "lg";
  className?: string;
};

export const WidgetItem: React.FC<WidgetItemProps> = ({ title, description, to, connected, size = "lg", className = "" }) => {
  const conditionalClasses = to ? "hover:bg-widgetHoverBg" : "";
  return (
    <ConditionalLink to={to}>
      <div className={`flex bg-widgetBg p-5 rounded-xl ${conditionalClasses} ${className}`}>
        <div className="flex flex-col gap-4">
          {size === "sm" && <h2>{description}</h2>}
          {size === "lg" && <div className="text-5xl font-semibold">{description}</div>}
          <div className="flex gap-1">
            {connected !== undefined && <ConnectedIcon isConnected={connected} />}
            <div className="text-textSecondary text-sm font-normal whitespace-nowrap">{title}</div>
          </div>
        </div>
        {to &&
          <div className="flex ml-auto">
            <img src={chevronRight} alt="chevron right" />
          </div>
        }
      </div>
    </ConditionalLink>
  );
}
