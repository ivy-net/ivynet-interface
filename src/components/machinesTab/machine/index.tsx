import React from "react";
import { Topbar } from "../../Topbar";
import { SectionTitle } from "../../shared/sectionTitle";
import { MachineStatus } from "./MachineStatus";
import { MachineWidget } from "./MachineWidget";
import useSWR from "swr";
import { AxiosResponse } from "axios";
import { NodeDetail, Response } from "../../../interfaces/responses";
import { apiFetch } from "../../../utils";
import { useParams } from "react-router-dom";
import byteSize from 'byte-size'


interface MachineProps {
};

export const Machine: React.FC<MachineProps> = () => {
  const { address } = useParams();
  const apiFetcher = (url: string) => apiFetch(url, "GET");

  const response = useSWR<AxiosResponse<Response<NodeDetail>>, any>(`client/${address}`, apiFetcher)
  const machine = response.data?.data.result

  const cpuUsage = (machine?.metrics.cpu_usage || 0).toString() + "%"
  const memoryUsageValue = machine?.metrics.memory_info ? (machine?.metrics.memory_info.usage / (machine?.metrics.memory_info.free + machine?.metrics.memory_info.usage)) : 0
  const memoryUsage = (memoryUsageValue * 100).toFixed(0) + "%"
  const diskUsed = machine && byteSize(machine.metrics.disk_info.usage).toString()
  const diskTotal = machine && byteSize(machine.metrics.disk_info.usage + machine.metrics.disk_info.free).toString()

  return (
    <>
      <Topbar goBackTo="/nodes" />
      <div className="flex">
        <MachineWidget name={machine?.name || ""} address={machine?.machine_id || ""} isConnected={machine?.status === "Healthy"} />
        <div className="flex items-center ml-auto gap-4">
          <button className="py-2.5 px-4 bg-accent/[0.15] rounded-lg">Update client</button>
          {/* <OptionsButton className="p-2.5 border border-iconBorderColor rounded-lg" /> */}
        </div>
      </div>
      <div className="flex gap-6">
        <div className="flex flex-col">
          {/* <div className="text-sidebarColor text-base font-medium">Connectivity</div> */}
          <div className="text-sidebarColor text-base font-medium">AVS</div>
          <div className="text-sidebarColor text-base font-medium">Client</div>
        </div>
        <div className="flex flex-col">
          <div className="flex">
            <div className="text-textPrimary text-base font-light">{machine?.metrics.deployed_avs.name}</div>
            {/* <div className="flex items-center text-[#FFD60A] border border-[#FFD60A] text-xs px-2 leading-4 rounded-lg ml-4">Needs Upgrade</div> */}
          </div>
          <div className="text-textPrimary text-base font-light">{`IvyNet Client ${machine?.metrics.deployed_avs.version}`}</div>
          {/* <div className="flex items-center text-[#FFD60A] border border-[#FFD60A] text-xs px-2 leading-4 rounded-lg ml-4">Needs Upgrade</div> */}
        </div>
      </div>
      <SectionTitle title="Node Status"></SectionTitle>
      <div className="grid grid-cols-4 gap-4">
        <MachineStatus title="Disk Usage" connected={true}>
          <div className="flex items-end gap-1">
            <h2>{diskUsed}</h2>
            {diskTotal && <h4>/{diskTotal}</h4>}
          </div>
        </MachineStatus>
        <MachineStatus title="CPU Usage" status={cpuUsage} connected={true} />
        <MachineStatus title="Memory Usage" status={memoryUsage} connected={true} />
        <MachineStatus title="Active Set" status={machine?.metrics.deployed_avs.active_set === "true" ? "Yes" : "No"} connected={machine?.metrics.deployed_avs.active_set === "true"} />
      </div>

      <SectionTitle title="Performance History"></SectionTitle>
      <h4>Previous Errors</h4>
      <div>
        {/* <PerformanceWidget date={fakeData.issues.date.date_1} address={fakeData.address} issue={fakeData.issues.issue.issue_1} />
        <PerformanceWidget date={fakeData.issues.date.date_2} address={fakeData.address} issue={fakeData.issues.issue.issue_2} /> */}
      </div>
    </>
  );
}
