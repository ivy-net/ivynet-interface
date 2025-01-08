import React from "react";
import { WidgetItem } from "../shared/machinesWidget/widgetItem";

interface OrgWidgetProps {
  data: any;
};

export const OrgWidget: React.FC<OrgWidgetProps> = ({ data }) => {
  const total = data[data.length - 1]
  return (
    <div className="grid grid-cols-4 gap-4">
      <WidgetItem title="Total Nodes" description={total.machines} to="/nodes" />
      <WidgetItem title="Total Stake" description={total.totalStake[0]} />
      <WidgetItem title="Total AVS Running" description={total.avsRunning} to="/avs" />
      <WidgetItem title="Total AVS Active Sets" description={total.avsActiveSets} />
    </div>
  );
}
