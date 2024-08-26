import { WidgetItem } from "./widgetItem";

interface MachinesWidgetProps {
  data: any;
};

export const MachinesWidget: React.FC<MachinesWidgetProps> = ({ data }) => {

  return (
    <div className="grid grid-cols-4 gap-4">
      <WidgetItem title="Total Nodes" description={data.totalMachines} to="/nodes" />
      <WidgetItem title="Need Ivy Client Upgrade" description={data.needUpgrade} connected={true} />
      <WidgetItem title="Need AVS Update" description={data.needUpdate} connected={null} />
      <WidgetItem title="New Potential AVS" description={data.newAvs} to="/avs" connected={true} />
    </div>
  );
}
