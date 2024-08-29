import { SectionTitle } from "../shared/sectionTitle";
import { Topbar } from "../Topbar";
import { OrgTable } from "./OrgTable";


interface OrgTabProps {
};

export const OrgTab: React.FC<OrgTabProps> = ({ }) => {

  return (
    <>
      <Topbar title="Overview" />
      <SectionTitle title="Stats" className="text-textPrimary" />
      <OrgTable />
    </>
  );
}
