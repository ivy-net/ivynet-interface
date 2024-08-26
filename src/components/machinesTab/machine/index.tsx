import React from "react";
import { Topbar } from "../../Topbar";
import { OptionsButton } from "../../shared/optionsButton";
import { SectionTitle } from "../../shared/sectionTitle";
import { MachineStatus } from "./MachineStatus";
import { MachineWidget } from "./MachineWidget";

interface MachineProps {
};

export const Machine: React.FC<MachineProps> = ({ }) => {
  const fakeData = {
    name: "Node 1",
    address: "0x235eE805F962690254e9a440E01574376136ecb1",
    connected: true,
    updated: false,
    avs: { name: "AVS 1", client: "IvyNet Client 0.1.0.2", needsUpgrade: true, status: "AVS running", updated: true },
    status: {
      diskUsage: { total: "12TB", current: "232GB" },
      health: "Good",
      activeSet: "123"
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
          <div className="text-sidebarColor text-base font-medium">AVS</div>
          <div className="text-sidebarColor text-base font-medium">Client</div>
        </div>
        <div className="flex flex-col">
          <div className="text-textPrimary text-base font-light">{fakeData.avs.name}</div>
          <div className="flex">
            <div className="text-textPrimary text-base font-light">{fakeData.avs.client}</div>
            <div className="flex items-center text-[#FFD60A] border border-[#FFD60A] text-xs px-2 leading-4 rounded-lg ml-4">Needs Upgrade</div>
          </div>
        </div>
      </div>
      <SectionTitle title="Status"></SectionTitle>
      <div className="grid grid-cols-4 gap-4">
        <MachineStatus title="Disk Usage" connected={true}>
          <div className="flex items-end gap-1">
            <h2>{fakeData.status.diskUsage.current}</h2>
            <h4>/{fakeData.status.diskUsage.total}</h4>
          </div>
        </MachineStatus>
        <MachineStatus title="Active Set" status={fakeData.status.activeSet} connected={true} />
        <MachineStatus title="Health" status={fakeData.status.health} connected={true} />
        <MachineStatus title="AVS Running" status={fakeData.avs.name} />
      </div>

      <SectionTitle title="Performance"></SectionTitle>
      <h4>New Task Received</h4>
      <h4>Signed Task Response</h4>

    </>
  );
}
