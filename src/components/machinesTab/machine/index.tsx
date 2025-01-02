import React, { useState, useMemo, useCallback } from "react";
import { Topbar } from "../../Topbar";
import { SectionTitle } from "../../shared/sectionTitle";
import { MachineStatus } from "./MachineStatus";
import useSWR from "swr";
import { AxiosResponse } from "axios";
import { AVS, MachineDetails } from "../../../interfaces/responses";
import { apiFetch } from "../../../utils";
import { useParams } from "react-router-dom";
import byteSize from 'byte-size';
import { Table } from "../../shared/table";
import { Tr } from "../../shared/table/Tr";
import { Th } from "../../shared/table/Th";
import { Td } from "../../shared/table/Td";
import { AvsWidget } from "../../shared/avsWidget";
import { MachineWidget } from "../../shared/machineWidget";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | 'none' }>({
    key: null,
    direction: 'none'
  });
  const { address } = useParams();
  const fetcher = (url: string) => apiFetch(url, "GET");

  const { data: machineResponse } = useSWR<AxiosResponse<MachineDetails[]>>(
    'machine',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshInterval: 0,
      errorRetryCount: 3,
      shouldRetryOnError: false,
    }
  );

  const { data: versionsData } = useSWR<AxiosResponse<VersionInfo[]>>(
    'info/avs/version',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshInterval: 0,
      errorRetryCount: 3,
      shouldRetryOnError: false,
    }
  );

  const machine = useMemo(() =>
    machineResponse?.data?.find((m: MachineDetails) => m.machine_id === address),
    [machineResponse, address]
  );

  const machineName = useMemo(() =>
    machine?.name?.replace(/"/g, '') || "",
    [machine]
  );

  const avsCount = useMemo(() =>
    machine?.avs_list?.length || 0,
    [machine]
  );

  const filteredAndSortedAvsList = useMemo(() => {
    let avsList = machine?.avs_list || [];

    if (searchTerm) {
      avsList = avsList.filter((avs: AVS) =>
        avs.avs_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return sortConfig.key ? sortData(avsList, sortConfig) : avsList;
  }, [machine, searchTerm, sortConfig]);

  const closeModal = useCallback(() => {
    setShowAddAvsModal(false);
  }, []);

  const handleCloseRescanModal = useCallback(() => {
    setShowRescanModal(false);
  }, []);

  const getLatestVersion = useCallback((nodeType: string | null, chain: string | null): string => {
    if (!versionsData?.data || !nodeType || !chain) return "";

    const versionInfo = versionsData.data.find(
      (v: VersionInfo) => v.node_type === nodeType && v.chain === chain
    );

    return versionInfo?.latest_version || "";
  }, [versionsData]);

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

    const updateTimeUTC = new Date(timestamp);
    const now = new Date();
    const nowUTC = new Date(now.getUTCFullYear(),
                           now.getUTCMonth(),
                           now.getUTCDate(),
                           now.getUTCHours(),
                           now.getUTCMinutes(),
                           now.getUTCSeconds());

    const diffMs = nowUTC.getTime() - updateTimeUTC.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    let timeAgo;
    if (diffMinutes < 1) {
      timeAgo = '< 1 Mn Ago';
    } else if (diffMinutes < 60) {
      timeAgo = `${diffMinutes} ${diffMinutes === 1 ? 'Mn' : 'Mn'} Ago`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} ${diffHours === 1 ? 'Hr' : 'Hrs'} Ago`;
    } else {
      timeAgo = `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'} Ago`;
    }

    let textColorClass = 'text-positive';
    if (diffMinutes >= 60) {
      textColorClass = 'text-textwarning';
    } else if (diffMinutes >= 15) {
      textColorClass = 'text-ivygrey';
    }

    return (
      <span className={`text-sm ${textColorClass} text-left w-full`}>
        {timeAgo}
      </span>
    );
  };

  return (
<div className="space-y-6">
      <Topbar goBackTo="/nodes" />
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
      {((machine?.avs_list?.length ?? 0) > 0 || searchTerm) && (
        <Table>
          <Tr>
            <Th content="AVS" sortKey="avs_name" currentSort={sortConfig} onSort={setSortConfig}></Th>
            <Th content="Type" sortKey="avs_type" currentSort={sortConfig} onSort={setSortConfig}></Th>
            <Th content="Chain" sortKey="chain" currentSort={sortConfig} onSort={setSortConfig}></Th>
            <Th
              content="Version"
              currentSort={sortConfig}
              onSort={setSortConfig}
              tooltip="Currently N/A if AVS lacks docker container or requires local build. Not all AVS use semantic versioning."
            ></Th>
            <Th
              content="Latest"
              currentSort={sortConfig}
              onSort={setSortConfig}
              tooltip="Add chain for latest version. Not all AVS use semantic versioning."
            ></Th>
            <Th content="Health" sortKey="errors" currentSort={sortConfig} onSort={setSortConfig}></Th>
            <Th
              content="Score"
              sortKey="performance_score"
              currentSort={sortConfig}
              onSort={setSortConfig}
              tooltip="Currently N/A if AVS doesn't have metrics."
              className="text-center"
            ></Th>
            <Th
              content="Active Set"
              sortKey="active_set"
              currentSort={sortConfig}
              onSort={setSortConfig}
            ></Th>
            <Th content="Updated" sortKey="updated_at" currentSort={sortConfig} onSort={setSortConfig}></Th>
            <Th content="Machine" sortKey="machine_id" currentSort={sortConfig} onSort={setSortConfig}></Th>
            <Th content=""></Th>
          </Tr>

          {filteredAndSortedAvsList.map((avs: AVS) => (
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
              <Td content={avs.avs_version === "0.0.0" ? "---" : avs.avs_version} className="px-1"></Td>
              <Td content={getLatestVersion(avs.avs_type, avs.chain)} className="px-1"></Td>
              <Td>
                <HealthStatus
                  isChecked={avs.errors.length === 0}
                  errors={avs.errors}
                />
              </Td>
              <Td score={avs.performance_score} className="text-center"></Td>
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
    </div>
  );
};
