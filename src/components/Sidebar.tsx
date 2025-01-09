import React from 'react'; 
import { Link } from 'react-router-dom';  
import { SidebarItem } from "./SidebarItem";
import { ReactComponent as Machines } from "../images/machines.svg"
import { ReactComponent as AVS } from "../images/avs-tab.svg"
import { ReactComponent as Settings } from "../images/settings.svg"
import { ReactComponent as Help } from "../images/help.svg"
import { ReactComponent as Org } from "../images/org.svg"
//import { AddUserModal } from "./settingsTab/AddUserModal";
//import { OverviewTab } from "./overviewTab";

type SidebarProps = Record<string, never>;

export const Sidebar: React.FC<SidebarProps> = () => {
  return (
    <div className="flex flex-col w-sidebarWith p-5 gap-2">
    <Link to="nodes" className="flex justify-left items-center gap-3 py-5 hover:opacity-80">
      <img src="logo.png" alt="Ivy logo" />
      <div className="text-xl leading-6 font-semibold">IvyNet</div>
    </Link>
    <div className="flex flex-col h-full">
        {/* <SidebarItem title="Overview" Logo={Machines} /> */}
        <SidebarItem title="Nodes" Logo={Machines} to="nodes" />
        {/* <SidebarItem title="Overview" Logo={OverviewTab} /> */}
        {/* <SidebarItem title="Metrics" Logo={AVS} to="metrics" /> */} 
        <SidebarItem title="Logs" Logo={Settings} to="logs" /> 
        <SidebarItem title="Addresses" Logo={Org} to="overview" />
        {/* <SidebarItem title="Rewards" Logo={Rewards} /> */}
        <div className="mt-auto">
        {/*  <SidebarItem title="Organization" Logo={Settings} />*/}
       <SidebarItem title="Invite" Logo={AVS} to="/adduser" /> 
          <SidebarItem title="Help" Logo={Help} to="./help" />
        </div>
      </div>
    </div>
  );
}


// stroke="#7E7BF5"
