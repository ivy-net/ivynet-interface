import { WidgetItem } from "../../shared/machinesWidget/widgetItem";

interface AvsInfoProps {
};

export const AvsInfo: React.FC<AvsInfoProps> = ({ }) => {
  const fakeData = {
    totalMachines: 6,
    needUpgrade: 0,
    needUpdate: 3,
    newAvs: 3
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <WidgetItem title="Stake Minimum" description="1 ETH" size="sm" className="!bg-bgButton" />
      <WidgetItem title="Nº of Operators" description="123" connected={true} size="sm" className="!bg-bgButton" />
      <WidgetItem title="Allowlist" description="Yes" connected={null} size="sm" className="!bg-bgButton" />
      <WidgetItem title="Rewards" description="Yes" connected={true} size="sm" className="!bg-bgButton" />
    </div>
  );
}
