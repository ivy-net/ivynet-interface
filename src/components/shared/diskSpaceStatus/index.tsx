import React from "react";
import { capitalize } from "../../../utils";
import { DiskStatus } from "../../../interfaces/data";

interface DiskSpaceStatusProps {
  status: DiskStatus
};

export const DiskSpaceStatus: React.FC<DiskSpaceStatusProps> = ({ status }) => {
  let statusStyling = ""

  switch (status) {
    case "Healthy":
      statusStyling = "text-green-700 bg-widgetHoverBg";
      break;
    case "Warning":
      statusStyling = "bg-widgetHoverBg text-yellow-500";
      break;
    case "Critical":
      statusStyling = "bg-widgetHoverBg text-textWarning bg-textWarning/[0.10]";
      break;
  }

  return (
    <div className={`px-3 py-0.5 rounded w-fit ${statusStyling}`}>{capitalize(status)}</div>
  );
}
