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
import { sortData } from '../../../utils/SortData';
import ChainCell from "../ChainCell";
import { RescanModal } from '../Rescan';

interface VersionInfo {
  node_type: string;
  chain: string;
  latest_version: string;
  latest_version_digest: string;
  breaking_change_version: string | null;
  breaking_change_datetime: string | null;
}
interface MachineProps {}

export const Machine: React.FC<MachineProps> = () => {
  const [showAddAvsModal, setShowAddAvsModal] = useState(false);
  const [showRescanModal, setShowRescanModal] = useState(false);
  const closeModal = () => {
    setShowAddAvsModal(false);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | 'none' }>({
  key: null,
  direction: 'none'});
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

  let sortedAvsList = filteredAvsList;
  if (sortConfig.key) {
  sortedAvsList = sortData(filteredAvsList, sortConfig);
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
        <span className="text-sm text-red-500">
          N/A
        </span>
      );
    }

    // Parse the timestamp and force UTC
    const updateTimeUTC = new Date(timestamp);
    const now = new Date();
    const nowUTC = new Date(now.getUTCFullYear(),
                           now.getUTCMonth(),
                           now.getUTCDate(),
                           now.getUTCHours(),
                           now.getUTCMinutes(),
                           now.getUTCSeconds());

    // Calculate the time difference in milliseconds
    const diffMs = nowUTC.getTime() - updateTimeUTC.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Create human-readable time difference
    let timeAgo;
    if (diffMinutes < 1) {
      timeAgo = '< 1 Minute Ago';
    } else if (diffMinutes < 60) {
      timeAgo = `${diffMinutes} ${diffMinutes === 1 ? 'Minute' : 'Minutes'} Ago`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} ${diffHours === 1 ? 'Hour' : 'Hours'} Ago`;
    } else {
      timeAgo = `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'} Ago`;
    }

    // Determine text color class based on time difference
    let textColorClass = 'text-positive';
    if (diffMinutes >= 60) {
      textColorClass = 'text-red-500';
    } else if (diffMinutes >= 15) {
      textColorClass = 'text-ivygrey';
    }

    return (
      <span className={`text-sm ${textColorClass}`}>
        {timeAgo}
      </span>
    );
  };
  const formatAddress = (address: string | null | undefined): string => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const versionsResponse = useSWR<AxiosResponse<VersionInfo[]>>(
  'info/avs/version',
  apiFetch,
  {
    onSuccess: (data) => console.log("Version data updated:", data?.data),
    onError: (error) => {
      console.error('Version fetch error:', error);
      return [];
    }
  }
);

const getLatestVersion = (nodeType: string | null, chain: string | null): string => {
  if (!versionsResponse.data?.data || !nodeType || !chain) return "";

  const versionInfo = versionsResponse.data.data.find(
    v => v.node_type === nodeType && v.chain === chain
  );

  return versionInfo?.latest_version || "";
};

const handleCloseRescanModal = () => {
  setShowRescanModal(false);
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
      isHeader={true}
    />
    <div className="flex items-center ml-auto gap-4">
      <SearchBar onSearch={setSearchTerm} />
      <button
        onClick={() => setShowAddAvsModal(true)}
        className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
      >
        Add AVS
      </button>
      <button
        onClick={() => setShowRescanModal(true)}
        className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
      >
        Rescan
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

  {showRescanModal && (
    <RescanModal
      onClose={handleCloseRescanModal}
      isOpen={showRescanModal}
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
            <Th content="AVS" sortKey="avs_name" currentSort={sortConfig} onSort={setSortConfig}></Th>
            <Th content="Type" sortKey="avs_type" currentSort={sortConfig} onSort={setSortConfig}></Th>
              <Th content="Chain" sortKey="chain" currentSort={sortConfig} onSort={setSortConfig}></Th>
            <Th
              content="Version"
              currentSort={sortConfig}
              onSort={setSortConfig}
              tooltip="Can show blank if AVS doesn't ship with docker container."
            ></Th>
            <Th
              content="Latest"
              currentSort={sortConfig}
              onSort={setSortConfig}
              tooltip="Add chain for latest version."
            ></Th>
            <Th content="Health" sortKey="errors" currentSort={sortConfig} onSort={setSortConfig}></Th>
            <Th
              content="Score"
              sortKey="performance_score"
              currentSort={sortConfig}
              onSort={setSortConfig}
              tooltip="Can show 0 if AVS doesn't have performance score metric."
              className="text-center"
            ></Th>
            {/*<Th content="Address" sortKey="operator_address" currentSort={sortConfig} onSort={setSortConfig}></Th>*/}
            <Th
              content="Active Set"
              sortKey="active_set"
              currentSort={sortConfig}
              onSort={setSortConfig}
              tooltip="Add chain and operator public address to see AVS Active Set status."
            ></Th>
            <Th content="Last Connected" sortKey="updated_at" currentSort={sortConfig} onSort={setSortConfig}></Th>
            <Th content="Machine" sortKey="machine_id" currentSort={sortConfig} onSort={setSortConfig}></Th>
            <Th content=""></Th>
          </Tr>

          {sortedAvsList.map((avs, index) => (
            <Tr key={`${avs.machine_id}-${avs.avs_name}`}>
              <Td><AvsWidget name={avs.avs_name} /></Td>
              <Td content={avs.avs_type}></Td>
              <Td>
                <ChainCell
                  chain={avs.chain}
                  avsName={avs.avs_name}
                  machineId={avs.machine_id || ""}
                />
              </Td>
              <Td content={avs.avs_version === "0.0.0" ? "unknown" : avs.avs_version}></Td>
              <Td content={getLatestVersion(avs.avs_type, avs.chain)}></Td>
              <Td>
                <HealthStatus
                  isChecked={avs.errors.length === 0}
                  errors={avs.errors}
                />
              </Td>
              <Td score={avs.performance_score} className="text-center"></Td>
              {/*<Td content={formatAddress(avs.operator_address) || ""}></Td>*/}

              <Td isChecked={avs.active_set}></Td>
              <Td className="flex items-center justify-center">
                {getTimeStatus(avs.updated_at)}
              </Td>
              <Td>
                <MachineWidget
                  address={avs.machine_id}
                  name={machineName}
                />
              </Td>
              <Td></Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
};
