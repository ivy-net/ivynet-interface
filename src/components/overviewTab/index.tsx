import { Topbar } from "../Topbar";
import { MachinesWidget } from "../shared/machinesWidget";
import { SectionTitle } from "../shared/sectionTitle";

interface OverviewTabProps {
};

export const OverviewTab: React.FC<OverviewTabProps> = ({ }) => {
  return (
    <>
      <Topbar title="Overview" />
      <SectionTitle title="Node Status" className="text-textPrimary" />
      <MachinesWidget />
      <SectionTitle title="Rewards" className="text-textPrimary" />
    </>
  );
}
