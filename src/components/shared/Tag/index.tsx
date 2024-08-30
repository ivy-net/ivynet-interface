import React from "react";
import { capitalize } from "../../../utils";

interface TagProps {
  label: string;
};

export const Tag: React.FC<TagProps> = ({ label }) => {

  return (
    <div className="px-3 py-0.5 rounded w-fit bg-widgetHoverBg text-textSecondary">{label}</div>
  );
}
