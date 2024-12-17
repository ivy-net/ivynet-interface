import React from "react";
import { ConditionalLink } from "../conditionalLink";
import arrowUpRight from "./../../../images/tag-arrow-up-right.svg"

interface TagProps {
  label: string;
  to?: string;
}

export const Tag: React.FC<TagProps> = ({ label, to }) => {
  const hoverClasses = to !== undefined ? "hover:bg-textGrey" : "";

  return (
    <ConditionalLink to={to}>
      <div className={`flex items-center w-fit gap-1 bg-tagBg text-tagColor text-lg leading-6 rounded-2xl px-3 py-1.5 ${hoverClasses}`}>
        {/* <div className="text-sm text-white">{label}</div> */}
        <div className="w-fit font-bold">{label}</div>
        {to !== undefined && <img src={arrowUpRight} alt="chevron right" />}
      </div>
    </ConditionalLink>
  );
}
