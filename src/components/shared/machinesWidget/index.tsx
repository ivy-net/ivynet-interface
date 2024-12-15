import { MachinesStatus, NodeDetail, AVS } from "../../../interfaces/responses";
import { WidgetItem } from "./widgetItem";

interface MachinesWidgetProps {
  data: MachinesStatus;
  details?: NodeDetail[];
  avs?: AVS[];
};

export const MachinesWidget: React.FC<MachinesWidgetProps> = ({ data, details, avs }) => {
  // Get the number of unique machines that have running AVS
  const runningMachines = new Set(avs?.filter(a => a.avs_name).map(a => a.machine_id)).size;

  // Get the total number of running AVS nodes
  const runningNodes = avs?.filter(a => a.avs_name).length ?? 0;

  // Get the number of AVS in active set
  const activeSetCount = avs?.filter(item => item.active_set === true).length ?? 0;

  // Get the number of unhealthy AVS
  const unhealthyCount = avs?.filter(item => item.errors && item.errors.length > 0).length ?? 0;

  return (
    <div className="grid grid-cols-4 gap-4">
    <WidgetItem
      title="AVS Nodes"
      description={`${runningNodes}`}
      to="/machines?filter=running"
    />
      <WidgetItem
        title="Machines"
        description={`${runningMachines}`}
        to="/machines?filter=running"
      />
      <WidgetItem
        title="Active Set"
        description={`${activeSetCount}`}
        to="/machines?filter=active"
        connected={true}
      />
      <WidgetItem
        title="Unhealthy"
        description={`${unhealthyCount}`}
        to="/machines?filter=unhealthy"
        connected={false}
      />
    </div>
  );
}
