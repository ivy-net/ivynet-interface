import React, { useState } from "react";
import { Topbar } from "../../Topbar";
import { SectionTitle } from "../../shared/sectionTitle";
import { MachineStatus } from "./MachineStatus";
import useSWR from "swr";
import { AxiosResponse } from "axios";
import { MachinesStatus, NodeDetail, Response, AVS, MachineDetails } from "../../../interfaces/responses";
import { apiFetch } from "../../../utils";
import { useParams } from "react-router-dom";
import byteSize from 'byte-size';
import { ConditionalLink } from "../../shared/conditionalLink";
import { Table } from "../../shared/table";
import { Tr } from "../../shared/table/Tr";
import { Th } from "../../shared/table/Th";
import { Td } from "../../shared/table/Td";
import { AvsWidget } from "../../shared/avsWidget";
import { MachineWidget } from "../../shared/machineWidget";
import { getChainLabel } from "../../../utils/UiMessages";
import { AddAVSModal } from "../AddAVSModal";
import HealthStatus from '../HealthStatus';
import { SearchBar } from "../../shared/searchBar";

interface MachineProps {}

export const Machine: React.FC<MachineProps> = () => {
  const [showAddAvsModal, setShowAddAvsModal] = useState(false);
  const closeModal = () => {
    setShowAddAvsModal(false);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const { address } = useParams();
  const apiFetcher = (url: string) => apiFetch(url, "GET");

  const machinesResponse = useSWR<AxiosResponse<MachineDetails[]>>("machine", apiFetcher);

  const avsResponse = useSWR<AxiosResponse<AVS[]>>('avs', apiFetcher, {
    onSuccess: (data) => console.log("AVS data received:", data?.data),
    onError: (error) => []
  });
  const avsList = avsResponse.data?.data || [];
  let filteredAvsList = avsList.filter(avs => avs.machine_id === address);

  if (searchTerm) {
    filteredAvsList = filteredAvsList.filter(avs =>
      avs.avs_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const machineResponse = useSWR<AxiosResponse<MachineDetails[]>, any>(`machine`, apiFetcher);
  const machineList = machineResponse.data?.data || [];
  const machine = machineList.find(machine => machine.machine_id === address);
  const machineName = machine?.name.replace(/"/g, '') || "";

  const avsCount = machine?.avs_list?.length || 0;
  const avsActiveSet = machine?.avs_list?.length || 0;

  const cores = machine?.system_metrics.cores?.toString() || "0";
  const cpuUsage = (machine?.system_metrics.cpu_usage || 0).toFixed(2).toString() + "%";
  const memoryUsageValue = machine?.system_metrics.memory_info ?
    (machine.system_metrics.memory_info.usage /
      (machine.system_metrics.memory_info.usage + machine.system_metrics.memory_info.free)) : 0;
  const memoryUsage = (memoryUsageValue * 100).toFixed(0) + "%";
  const diskUsed = machine && byteSize(machine.system_metrics.disk_info.usage).toString();
  const diskTotal = machine && byteSize(
    machine.system_metrics.disk_info.usage + machine.system_metrics.disk_info.free).toString();

    const getTimeStatus = (timestamp: string | null | undefined): JSX.Element => {
      if (!timestamp) {
        return (
          <div className="flex items-center justify-center relative group">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap">
              <div className="font-medium">Latest Metrics Update:</div>
              <div className="text-gray-300">Not Available</div>
            </div>
          </div>
        );
      }

      // Parse the timestamp and force UTC
      const updateTimeUTC = new Date(timestamp);

      // Get current time and convert to UTC
      const now = new Date();
      const nowUTC = new Date(now.getUTCFullYear(),
                             now.getUTCMonth(),
                             now.getUTCDate(),
                             now.getUTCHours(),
                             now.getUTCMinutes(),
                             now.getUTCSeconds());

      // Calculate the time difference in milliseconds
      const diffMs = nowUTC.getTime() - updateTimeUTC.getTime();

      // Convert the time difference to minutes
      const diffMinutes = diffMs / (1000 * 60);
      // Format the timestamp for the tooltip
      const formattedTime = timestamp.split('.')[0].replace('T', ' ') + ' UTC';

      let dotColorClass = 'bg-positive';
      if (diffMinutes >= 30) {
          dotColorClass = 'bg-textWarning';
      } else if (diffMinutes >= 15) {
          dotColorClass = 'bg-ivygrey';
      }

      return (
        <div className="flex items-center justify-center relative group">
          <div className={`w-2 h-2 rounded-full ${dotColorClass}`} />
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap">
            <div className="font-medium">Latest Metrics Received:</div>
            <div className="text-gray-300">{formattedTime}</div>
          </div>
        </div>
      );
    };
  const formatAddress = (address: string | null | undefined): string => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <>
      <Topbar goBackTo="/machines" />
      <div className="flex">
      <MachineWidget
        name={machineName}
        address={machine?.machine_id || ""}
        isConnected={machine?.status === "Healthy"}
        showCopy={true}
        isHeader={true}  // New prop to indicate this is the header version
      />
        <div className="flex items-center ml-auto gap-4">
          <SearchBar onSearch={setSearchTerm} />
          <button
            onClick={() => setShowAddAvsModal(true)}
            className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
          >
            Add AVS
          </button>
        </div>
      </div>
      {showAddAvsModal && (
        <AddAVSModal
          onClose={closeModal}
          isOpen={showAddAvsModal}
          machineId={address}
        />
      )}
      <div className="flex gap-6">
        <div className="flex flex-col">
          <div className="text-sidebarColor text-base font-medium">Machine Status</div>
          <div className="text-sidebarColor text-base font-medium">AVS Running</div>
        </div>
        <div className="flex flex-col">
          <div className="text-textPrimary text-base font-light">{machine?.status}</div>
          <div className="text-textPrimary text-base font-light">{avsCount}</div>
        </div>
      </div>
      <SectionTitle title="System Status"></SectionTitle>
      <div className="grid grid-cols-4 gap-4">
        <MachineStatus title="Cores" status={cores} />
        <MachineStatus title="CPU Usage" status={cpuUsage} />
        <MachineStatus title="Disk Usage" connected={machine?.system_metrics.disk_info.status === "Healthy"}>
          <div className="flex items-end gap-1">
            <h2>{diskUsed}</h2>
            {diskTotal && <h4>/{diskTotal}</h4>}
          </div>
        </MachineStatus>
        <MachineStatus title="Memory Usage" status={memoryUsage} connected={machine?.system_metrics.memory_info.status === "Healthy"} />
      </div>

      <SectionTitle title="AVS Overview"></SectionTitle>
      {(!avsResponse.error && (avsList?.length ?? 0) > 0 || searchTerm) && (
        <Table>
          <Tr>
            <Th content="AVS"></Th>
            <Th content="Chain"></Th>
            <Th content="Type"></Th>
            <Th content="Version" tooltip="Can show blank if AVS doesn't ship with docker container."></Th>
            <Th content="Latest"></Th>
            <Th content="Health"></Th>
            <Th content="Score" tooltip="Can show 0 if AVS doesn't have performance score metric."></Th>
            <Th content="Address"></Th>
            <Th content="Active Set" tooltip="Add chain and operator public address to see AVS Active Set status."></Th>
            <Th content="Machine"></Th>
            <Th content="Latest Update"></Th>
            <Th content=""></Th>
          </Tr>

          {filteredAvsList.map((avs, index) => (
            <Tr key={`${avs.machine_id}-${avs.avs_name}`}>
              <Td>
                <AvsWidget name={avs.avs_name} />
              </Td>
              <Td content={getChainLabel(avs.chain)}></Td>
              <Td content={avs.avs_type}></Td>
              <Td content={avs.avs_version === "0.0.0" ? "Unknown" : avs.avs_version}></Td>
              <Td content=""></Td>
              <Td>
                <HealthStatus
                  isConnected={avs.errors.length === 0}
                  errors={avs.errors}
                />
              </Td>
              <Td score={avs.performance_score}></Td>
              <Td content={formatAddress(avs.operator_address) || ""}></Td>
              <Td isChecked={avs.active_set}></Td>
              <Td>
                <MachineWidget
                  address={avs.machine_id}
                  name={machineName}
                />
              </Td>
              <Td className="flex items-center justify-center">
                {getTimeStatus(avs.updated_at)}
              </Td>
              <Td></Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
};
