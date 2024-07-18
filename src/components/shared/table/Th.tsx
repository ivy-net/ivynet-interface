import React from "react";

interface ThProps {
  children?: React.ReactNode
  content?: string
};

export const Th: React.FC<ThProps> = ({ content = undefined, children = undefined }) => {

  return (
    <th className="text-left align-middle h-11">
      {content && <div className="text-sm text-textGrey">{content}</div>}
      {children}
    </th>
  );
}
