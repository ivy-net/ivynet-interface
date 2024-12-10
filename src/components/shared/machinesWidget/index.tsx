import { MachinesStatus, NodeDetail, AVS } from "../../../interfaces/responses";
import { WidgetItem } from "./widgetItem";

interface MachinesWidgetProps {
  data: MachinesStatus;
  details?: NodeDetail[];
  avs?: AVS[];
};


export const MachinesWidget: React.FC<MachinesWidgetProps> = ({ data, details, avs }) => {
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
      <WidgetItem title="Machines" description={`${new Set(avs?.map(a => a.machine_id)).size ?? 0}`} to="/machines" />{/* need to change this to avs */}
      <WidgetItem title="AVS Nodes" description={`${avs?.length ?? 0}`} to="/machines" />{/* need to change this to avs */}
      <WidgetItem title="Active Set" description={`${avs?.filter(item => item.active_set === true).length ?? 0}`} to="/machines" connected={true} />
      <WidgetItem title="Unhealthy" description={`${avs?.filter(item => item.errors.length > 0).length ?? 0}`} to="/machines" connected={false} />
      {/*<WidgetItem title="Unhealthy" description={highPriorityMachines} connected={false} />*/}
      {/*<WidgetItem title="Medium Priority Issues" description={mediumPriorityMachines} connected={null} />*/}
      {/*<WidgetItem title="New Potential AVS" description={0} connected={true} />*/}
    </div>
  );
}
