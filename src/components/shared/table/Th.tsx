import React from "react";
import { Tooltip } from "react-tooltip";
import { getRandomClass } from "../../../utils";

export interface ThProps {
  children?: React.ReactNode
  content?: string
  className?: string;
  tooltip?: string;
};

export const Th: React.FC<ThProps> = ({ content = undefined, children = undefined, className = "", tooltip }) => {
  const uniqueClassName = getRandomClass()
  return (
    <th className={`${className} text-left align-middle h-11`}>
      {content &&
        <div className="flex items-center gap-1">
          <div className="text-sm text-textGrey">{content}</div>
          {tooltip && (
            <div className="flex relative">
              <svg className={`w-4 h-4 ${uniqueClassName}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              <Tooltip anchorSelect={`.${uniqueClassName}`} place="top" className="!bg-gray-800 !text-sm !rounded-lg !shadow-lg">
                {tooltip}
              </Tooltip>
            </div>
          )}
        </div>
      }
      {children}
    </th>
  );

}
