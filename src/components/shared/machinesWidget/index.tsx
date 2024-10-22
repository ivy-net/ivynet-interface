import { MachinesStatus, NodeDetail } from "../../../interfaces/responses";
import { WidgetItem } from "./widgetItem";

interface MachinesWidgetProps {
  data: MachinesStatus;
  details?: NodeDetail[];
};

export const MachinesWidget: React.FC<MachinesWidgetProps> = ({ data, details }) => {
  let highPriorityMachines = 0;
  let mediumPriorityMachines = 0;

  if (details?.length) {
    highPriorityMachines = details.filter(node => node.status === "Unhealthy" || node.status === "Error" || node.metrics.disk_info.status === "Critical").length
    mediumPriorityMachines = details.filter(node => node.status === "Idle" || node.metrics.deployed_avs.active_set === "false" || node.metrics.disk_info.status === "Warning").length
  }
  // else {
  //   highPriorityMachines = data.erroring_machines.length + data.unhealthy_machines.length
  //   mediumPriorityMachines = data.idle_machines.length
  // }

  return (
    <div className="grid grid-cols-4 gap-4">
      <WidgetItem title="Total Nodes" description={data.total_machines} to="/nodes" />
      <WidgetItem title="High Priority Issues" description={highPriorityMachines} connected={false} />
      <WidgetItem title="Medium Priority Issues" description={mediumPriorityMachines} connected={null} />
      <WidgetItem title="New Potential AVS" description={0} to="/avs" connected={true} />
    </div>
  );
}
