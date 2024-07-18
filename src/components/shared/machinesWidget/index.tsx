import { WidgetItem } from "./widgetItem";

interface MachinesWidgetProps {
};

export const MachinesWidget: React.FC<MachinesWidgetProps> = ({ }) => {
  const fakeData = {
    totalMachines: 6,
    needUpgrade: 0,
    needUpdate: 3,
    newAvs: 3
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <WidgetItem title="Total Machines" amount={fakeData.totalMachines} to="/machines" />
      <WidgetItem title="Need Ivy Client Upgrade" amount={fakeData.needUpgrade} />
      <WidgetItem title="Need AVS Update" amount={fakeData.needUpdate} />
      <WidgetItem title="New Potential AVS" amount={fakeData.newAvs} to="/avs" />
    </div>
  );
}
