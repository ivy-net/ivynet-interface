import React from "react";
import { Topbar } from "../../Topbar";
import { SectionTitle } from "../../shared/sectionTitle";
import { MachineStatus } from "./MachineStatus";
import { MachineWidget } from "./MachineWidget";
import useSWR from "swr";
import { AxiosResponse } from "axios";
import { MachinesStatus, NodeDetail, Response, AVS, MachineDetails } from "../../../interfaces/responses";
import { apiFetch } from "../../../utils";
import { useParams } from "react-router-dom";
import byteSize from 'byte-size'
import { ConditionalLink } from "../../shared/conditionalLink";


interface MachineProps {
};

export const Machine: React.FC<MachineProps> = () => {
  const { address } = useParams();
  const apiFetcher = (url: string) => apiFetch(url, "GET");



  const machinesResponse = useSWR<AxiosResponse<MachineDetails[]>>(
    "machine",
    apiFetcher
  );

  const machineDetails = machinesResponse.data?.data?.find(
    (m: MachineDetails) => m.machine_id === address
  );

  const avsCount = machinesResponse.data?.data?.find(m => m.machine_id === address)?.avs_list?.length || 0;
  const avsActiveSet = machinesResponse.data?.data?.find(m => m.machine_id === address)?.avs_list?.length || 0;


  const currentMachine = machinesResponse.data?.data?.find(m => m.machine_id === address);
  const cores = currentMachine?.system_metrics.cores?.toString() || "0";
  const cpuUsage = (currentMachine?.system_metrics.cpu_usage || 0).toFixed(2).toString() + "%";
  const memoryUsageValue = currentMachine?.system_metrics.memory_info ?
    (currentMachine.system_metrics.memory_info.usage /
      (currentMachine.system_metrics.memory_info.usage + currentMachine.system_metrics.memory_info.free)) : 0;
  const memoryUsage = (memoryUsageValue * 100).toFixed(0) + "%";
  const diskUsed = currentMachine && byteSize(currentMachine.system_metrics.disk_info.usage).toString();
  const diskTotal = currentMachine && byteSize(
    currentMachine.system_metrics.disk_info.usage + currentMachine.system_metrics.disk_info.free).toString();

  return (
    <>
      <Topbar goBackTo="/machines" />
      <div className="flex">
        <MachineWidget name={machineDetails?.name?.replace(/"/g, '') || ""} address={machineDetails?.machine_id || ""} isConnected={machineDetails?.status === "Healthy"} />
        <div className="flex items-center ml-auto gap-4">
          <ConditionalLink to="https://docs.ivynet.dev/" openInNewTab>
            <button className="py-2.5 px-4 bg-accent/[0.15] rounded-lg">Update client</button>
          </ConditionalLink>
          {/* <OptionsButton className="p-2.5 border border-iconBorderColor rounded-lg" /> */}
        </div>
      </div>
      <div className="flex gap-6">
        <div className="flex flex-col">
          {/* <div className="text-sidebarColor text-base font-medium">Connectivity</div> */}
          <div className="text-sidebarColor text-base font-medium">AVS Running</div>
          <div className="text-sidebarColor text-base font-medium">AVS Active Sets</div>
        </div>
        <div className="flex flex-col">
          <div className="flex">
            <div className="text-textPrimary text-base font-light">{avsCount}</div>
            {/*<div className="text-textPrimary text-base font-light">{machine?.metrics.deployed_avs.name} {machine?.metrics.deployed_avs.version}</div>*/}
            {/* <div className="flex items-center text-[#FFD60A] border border-[#FFD60A] text-xs px-2 leading-4 rounded-lg ml-4">Needs Upgrade</div> */}
          </div>
          {/*currentMachine?.system_metrics.deployed_avs.version && <div className="text-textPrimary text-base font-light">{`${currentMachine?.system_metrics.deployed_avs.version}`}</div>}
          {/* <div className="flex items-center text-[#FFD60A] border border-[#FFD60A] text-xs px-2 leading-4 rounded-lg ml-4">Needs Upgrade</div> */}
        </div>
      </div>
      <SectionTitle title="System Status"></SectionTitle>
      <div className="grid grid-cols-4 gap-4">
        <MachineStatus title="Cores" status={cores} />
        <MachineStatus title="CPU Usage" status={cpuUsage} />
        <MachineStatus title="Disk Usage" connected={currentMachine?.system_metrics.disk_info.status === "Healthy"}>
          <div className="flex items-end gap-1">
            <h2>{diskUsed}</h2>
            {diskTotal && <h4>/{diskTotal}</h4>}
          </div>
        </MachineStatus>
        <MachineStatus title="Memory Usage" status={memoryUsage} connected={currentMachine?.system_metrics.memory_info.status === "Healthy"} />
        {/*}<MachineStatus title="Active Set" status={machine?.metrics.deployed_avs.active_set === "true" ? "Yes" : "No"} connected={machine?.metrics.deployed_avs.active_set === "true"} />*/}
      </div>

      <SectionTitle title="AVS Overview"></SectionTitle>
      <h4>TBD</h4>
      <div>
        {/* <PerformanceWidget date={fakeData.issues.date.date_1} address={fakeData.address} issue={fakeData.issues.issue.issue_1} />
        <PerformanceWidget date={fakeData.issues.date.date_2} address={fakeData.address} issue={fakeData.issues.issue.issue_2} /> */}
      </div>
    </>
  );
}
