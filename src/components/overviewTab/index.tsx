import { Topbar } from "../Topbar";
import { MachinesWidget } from "../shared/machinesWidget";

interface OverviewTabProps {
};

export const OverviewTab: React.FC<OverviewTabProps> = ({ }) => {
  return (
    <>
      <Topbar title="Overview" />
      <MachinesWidget />
    </>
  );
}
