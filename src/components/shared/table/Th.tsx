import React from "react";
import { Tooltip } from "react-tooltip";
import { getRandomClass } from "../../../utils";

export interface ThProps {
  children?: React.ReactNode;
  content?: string;
  className?: string;
  tooltip?: string;
  sortKey?: string;
  currentSort?: { key: string | null; direction: 'asc' | 'desc' | 'none' };
  onSort?: (sortConfig: { key: string; direction: 'asc' | 'desc' | 'none' }) => void;
}

export const Th: React.FC<ThProps> = ({
  content = undefined,
  children = undefined,
  className = "",
  tooltip,
  sortKey,
  currentSort,
  onSort
}) => {
  const uniqueClassName = getRandomClass();
  const isSorted = sortKey && currentSort?.key === sortKey;
  const direction = isSorted ? currentSort?.direction : 'none';

  const handleSort = () => {
    if (!sortKey || !onSort) return;

    let newDirection: 'asc' | 'desc' | 'none' = 'asc';
    if (direction === 'asc') newDirection = 'desc';
    if (direction === 'desc') newDirection = 'none';

    onSort({ key: sortKey, direction: newDirection });
  };

  const getSortIcon = () => {
    if (!sortKey) return null;

    return (
      <div className="flex flex-col">
        <svg
          className={`w-3 h-3 -mb-1 ${direction === 'asc' ? 'text-white' : 'text-textGrey'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m18 15-6-6-6 6"/>
        </svg>
        <svg
          className={`w-3 h-3 ${direction === 'desc' ? 'text-white' : 'text-textGrey'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
    );
  };

  return (
    <th
      className={`${className} text-left align-middle h-11 ${sortKey ? 'cursor-pointer hover:text-white' : ''}`}
      onClick={handleSort}
    >
      {content && (
        <div className="flex items-center gap-1">
<div className={`text-md text-textGrey ${className}`}>{content}</div>
          {getSortIcon()}
          {tooltip && (
            <div className="flex relative">
              <svg className={`w-4 h-4 ${uniqueClassName}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              <Tooltip
                anchorSelect={`.${uniqueClassName}`}
                place="top"
                className="!bg-gray-800 !text-sm !rounded-lg !shadow-lg"
              >
                {tooltip}
              </Tooltip>
            </div>
          )}
        </div>
      )}
      {children}
    </th>
  );
};
