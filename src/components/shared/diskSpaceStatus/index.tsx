import React from "react";
import { capitalize } from "../../../utils";

interface DiskSpaceStatusProps {
  status: "fair" | "critical" | "good"
};

export const DiskSpaceStatus: React.FC<DiskSpaceStatusProps> = ({ status }) => {
  let statusStyling = ""

  switch (status) {
    case "good":
      statusStyling = "text-green-700 bg-widgetHoverBg";
      break;
    case "fair":
      statusStyling = "bg-widgetHoverBg text-yellow-500";
      break;
    case "critical":
      statusStyling = "bg-widgetHoverBg text-textWarning bg-textWarning/[0.10]";
      break;
  }

  return (
    <div className={`px-3 py-0.5 rounded w-fit ${statusStyling}`}>{capitalize(status)}</div>
  );
}
