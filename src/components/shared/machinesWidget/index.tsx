import { MachinesStatus } from "../../../interfaces/responses";
import { WidgetItem } from "./widgetItem";

interface MachinesWidgetProps {
  data: MachinesStatus;
};

export const MachinesWidget: React.FC<MachinesWidgetProps> = ({ data }) => {
  const highPriorityMachines = data.erroring_machines.length + data.unhealthy_machines.length
  const idleMachines = data.idle_machines.length

  return (
    <div className="grid grid-cols-4 gap-4">
      <WidgetItem title="Total Nodes" description={data.total_machines} to="/nodes" />
      <WidgetItem title="High Priority Issues" description={highPriorityMachines} connected={true} />
      <WidgetItem title="Medium Priority Issues" description={idleMachines} connected={null} />
      <WidgetItem title="New Potential AVS" description={0} to="/avs" connected={true} />
    </div>
  );
}
