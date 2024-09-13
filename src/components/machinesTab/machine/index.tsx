import React from "react";
import { Topbar } from "../../Topbar";
import { SectionTitle } from "../../shared/sectionTitle";
import { MachineStatus } from "./MachineStatus";
import { MachineWidget } from "./MachineWidget";
import { PerformanceWidget } from "./PerformanceHistory";

interface MachineProps {
};

export const Machine: React.FC<MachineProps> = () => {
  const fakeData = {
    name: "Node 1",
    address: "0x235eE805F962690254e9a440E01574376136ecb1",
    connected: true,
    updated: false,
    avs: { name: "AVS 1", client: "IvyNet Client 0.1.0.2", needsUpgrade: true, status: "AVS running", updated: true },
    status: {
      diskUsage: { total: "12TB", current: "232GB" },
      cpuUsage: "12%",
      memoryUsage: "28%",
      activeSet: "Yes"
    },
    issues: {
      date: { date_1: "Aug 28 24 14:25 UTC", date_2: "Aug 29 24 06:44 UTC" },
      issue: { issue_1: "Error 240: low memory capacity", issue_2: "Error 102: upgrade avs version" }
    }
  }


  return (
    <>
      <Topbar goBackTo="/nodes" />
      <div className="flex">
        <MachineWidget name={fakeData.name} address={fakeData.address} isConnected={fakeData.connected} />
        <div className="flex items-center ml-auto gap-4">
          <button className="py-2.5 px-4 bg-accent/[0.15] rounded-lg">Update client</button>
          {/* <OptionsButton className="p-2.5 border border-iconBorderColor rounded-lg" /> */}
        </div>
      </div>
      <div className="flex gap-6">
        <div className="flex flex-col">
          <div className="text-sidebarColor text-base font-medium">Connectivity</div>
          <div className="text-sidebarColor text-base font-medium">Client</div>
          <div className="text-sidebarColor text-base font-medium">AVS</div>
        </div>
        <div className="flex flex-col">
          <div className="text-textPrimary text-base font-light">{fakeData.connected}</div>
          <div className="text-textPrimary text-base font-light">{fakeData.avs.client}</div>
          <div className="flex items-center text-[#FFD60A] border border-[#FFD60A] text-xs px-2 leading-4 rounded-lg ml-4">Needs Upgrade</div>
          <div className="flex">
            <div className="text-textPrimary text-base font-light"> {fakeData.avs.name} </div>
            <div className="flex items-center text-[#FFD60A] border border-[#FFD60A] text-xs px-2 leading-4 rounded-lg ml-4">Needs Upgrade</div>
          </div>
        </div>
      </div>
      <SectionTitle title="Node Status"></SectionTitle>
      <div className="grid grid-cols-4 gap-4">
        <MachineStatus title="Disk Usage" connected={true}>
          <div className="flex items-end gap-1">
            <h2>{fakeData.status.diskUsage.current}</h2>
            <h4>/{fakeData.status.diskUsage.total}</h4>
          </div>
        </MachineStatus>
        <MachineStatus title="CPU Usage" status={fakeData.status.cpuUsage} connected={true} />
        <MachineStatus title="Memory Usage" status={fakeData.status.memoryUsage} connected={true} />
        <MachineStatus title="Active Set" status={fakeData.status.activeSet} connected={true} />
      </div>

      <SectionTitle title="Performance History"></SectionTitle>
      <h4>Previous Errors</h4>
      <div>
        <PerformanceWidget date={fakeData.issues.date.date_1} address={fakeData.address} issue={fakeData.issues.issue.issue_1} />
        <PerformanceWidget date={fakeData.issues.date.date_2} address={fakeData.address} issue={fakeData.issues.issue.issue_2} />
      </div>
    </>
  );
}
