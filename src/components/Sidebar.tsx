import { SidebarItem } from "./SidebarItem";
import { ReactComponent as Overview } from "../images/overview.svg"
import { ReactComponent as Machines } from "../images/machines.svg"
import { ReactComponent as AVS } from "../images/avs-tab.svg"
import { ReactComponent as Rewards } from "../images/rewards.svg"
import { ReactComponent as Settings } from "../images/settings.svg"
import { ReactComponent as Help } from "../images/help.svg"

interface SidebarProps {
};

export const Sidebar: React.FC<SidebarProps> = ({ }) => {
  return (
    <div className="flex flex-col w-sidebarWith p-5 gap-2">
      <div className="flex justify-left items-center gap-3 py-5">
        <img src="logo.png" alt="Ivy logo" />
        <div className="text-xl leading-6 font-semibold">Ivynet</div>
      </div>
      <div className="flex flex-col h-full">
        {/* <SidebarItem title="Overview" Logo={Overview} /> */}
        <SidebarItem title="Organization" Logo={Machines} />
        <SidebarItem title="Nodes" Logo={Machines} />
        <SidebarItem title="AVS" Logo={AVS} />
        {/* <SidebarItem title="Rewards" Logo={Rewards} /> */}
        <div className="mt-auto">
          <SidebarItem title="Settings" Logo={Settings} />
          <SidebarItem title="Help" Logo={Help} />
        </div>

      </div>
    </div>
  );
}


// stroke="#7E7BF5"
