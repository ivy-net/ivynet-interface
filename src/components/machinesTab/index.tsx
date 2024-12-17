import { Link, Outlet, useLocation, useSearchParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Topbar } from "../Topbar";
import { MachineWidget } from "../shared/machineWidget";
import { MachinesWidget } from "../shared/machinesWidget";
import { OptionsButton } from "../shared/optionsButton";
import { Table } from "../shared/table";
import { Td } from "../shared/table/Td";
import { Th } from "../shared/table/Th";
import { Tr } from "../shared/table/Tr";
import { Filters } from "../shared/filters";
import { SectionTitle } from "../shared/sectionTitle";
import useSWR from 'swr';
import { AVS, MachineDetails, MachinesStatus, NodeDetail, Response } from "../../interfaces/responses";
import { apiFetch } from "../../utils";
import { AxiosResponse } from "axios";
import { AvsWidget } from "../shared/avsWidget";
import { getChainLabel } from "../../utils/UiMessages";
import { sortData } from '../../utils/SortData';
import HealthStatus from './HealthStatus';
import { AddAVSModal } from "./AddAVSModal";
import { EmptyMachines } from "./EmptyMachines";
import { toast } from 'react-toastify';
import ChainCell from "./ChainCell";
import { RescanModal } from './Rescan';

interface MachinesTabProps {}

interface VersionInfo {
  node_type: string;
  chain: string;
  latest_version: string;
  latest_version_digest: string;
  breaking_change_version: string | null;
  breaking_change_datetime: string | null;
}


export const MachinesTab: React.FC<MachinesTabProps> = () => {
  const [showAddAvsModal, setShowAddAvsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAvs, setSelectedAvs] = useState<AVS | null>(null);
  const [showRescanModal, setShowRescanModal] = useState(false);



  const handleEditChain = (avs: AVS) => {
  setSelectedAvs(avs);
  setShowEditModal(true);
};

  const handleCloseAddAvsModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowAddAvsModal(false);
  };


  const handleCloseRescanModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowRescanModal(false);
  };


  const hasActiveFilter = () => {
    return filter && filter !== "running"; // Since "running" is your default filter
  };

  const options = [
    { label: "IvyClient Update", link: "code/updateclient" },
    { label: "View Details", link: "" },
    { label: "Edit Address", link: "" },
    { label: "Remove AVS", link: "" },
  ];

  const filters = [
    { label: "AVS Running", query: "running" },
    { label: "Ethereum AVS", query: "ethereum" },
    { label: "Active Set", query: "active" },
    { label: "Unhealthy", query: "unhealthy" }
  ];

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");

  const getTimeStatus = (timestamp: string | null | undefined): JSX.Element => {
  if (!timestamp) {
    return (
      <div className="flex items-center justify-center relative group">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap">
          <div className="font-medium">Last Node Metrics Received:</div>
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

  // Convert time differences to various units
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Create human-readable time difference
  let timeAgo;
  if (diffMinutes < 1) {
    timeAgo = 'Just now';
  } else if (diffMinutes < 60) {
    timeAgo = `${diffMinutes} ${diffMinutes === 1 ? 'Minute' : 'Minutes'} Ago`;
  } else if (diffHours < 24) {
    timeAgo = `${diffHours} ${diffHours === 1 ? 'Hour' : 'Hours'} Ago`;
  } else {
    timeAgo = `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'} Ago`;
  }

  // Determine dot color based on time difference
  let dotColorClass = 'bg-positive';
  if (diffMinutes >= 30) {
    dotColorClass = 'bg-textWarning';
  } else if (diffMinutes >= 15) {
    dotColorClass = 'bg-ivygrey';
  }

  return (
    <div className="flex items-center justify-center relative group">
      <div className={`h-2 w-2 rounded-full ${dotColorClass}`} />
      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap">
        <div className="font-medium">{timeAgo}</div>
      </div>
    </div>
  );
};

  const getOptions = (avs: AVS): any => {
    return options.map(option => {
      if (option.label === "View Details") {
        return { label: option.label, link: `/machines/${avs.machine_id || ""}` };
      }
      if (option.label === "Edit Address") {
        return { label: option.label, link: `/machines/edit/${avs.avs_name}/${avs.machine_id || ""}` };
      }
      if (option.label === "Remove AVS") {
        return {
          label: option.label,
          onClick: () => handleDeleteAVS(avs),
          disabled: isDeleting
        };
      }
      return option;
    });
  };

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | 'none' }>({
    key: null,
    direction: 'none'
  });

  const handleDeleteAVS = async (avs: AVS) => {
    if (!window.confirm(`Are you sure you want to remove ${avs.avs_name}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const url = `machine/${avs.machine_id}?avs_name=${encodeURIComponent(avs.avs_name)}`;
      console.log('Sending DELETE request to:', url);

      const deleteResponse = await apiFetch(url, 'DELETE');
      console.log('Delete response:', deleteResponse);

      if (deleteResponse.status === 200) {
        // Force clear the cache before refetching
        response.mutate(undefined, { revalidate: true });
        machinesResponse.mutate(undefined, { revalidate: true });
        avsResponse.mutate(undefined, { revalidate: true });

        // Wait a brief moment to ensure backend state is updated
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Now refetch with cache cleared
        await Promise.all([
          response.mutate(),
          machinesResponse.mutate(),
          avsResponse.mutate()
        ]);

        toast.success(`Successfully removed ${avs.avs_name}`, { theme: "dark" });
      }
    } catch (error: any) {
      console.error('Delete AVS error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const emptyMachineStatus = {
    total_machines: 0,
    healthy_machines: [],
    unhealthy_machines: [],
    idle_machines: [],
    updateable_machines: [],
    erroring_machines: []
  };

  const apiFetcher = (url: string) => apiFetch(url, "GET");
  const multiFetcher = (urls: string[]): any => Promise.all(urls.map(url => apiFetcher(url)));

  const response = useSWR<AxiosResponse<Response<MachinesStatus>>, any>('client', apiFetcher, {
    revalidateOnFocus: true,
    revalidateOnMount: true,
    revalidateOnReconnect: true,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0,
  });

  const machinesStatus = response.data?.data.result || emptyMachineStatus;
  const machines = Array.from(new Set(machinesStatus.unhealthy_machines.concat(machinesStatus.erroring_machines).concat(machinesStatus.updateable_machines).concat(machinesStatus.idle_machines).concat(machinesStatus.healthy_machines)));

  const nodesResponse = useSWR<AxiosResponse<Response<NodeDetail>>[], any>(machines.map(machine => `client/${machine}`), multiFetcher as any, {
    revalidateOnFocus: true,
    revalidateOnMount: true,
    revalidateOnReconnect: true,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0,
  });

  const nodesInfo = nodesResponse.data?.map((ar, idx) => ar.data.result).sort((b, a) => b.machine_id.localeCompare(a.machine_id));

  const machinesResponse = useSWR<AxiosResponse<MachineDetails[]>>(
    "machine",
    apiFetcher,
    {
      onSuccess: (data) => {
        console.log("Raw machinesResponse:", data?.data);
      }
    }
  );

  const getMachineName = (machineId: string) => {
    const machine = machinesResponse.data?.data?.find(m => m.machine_id === machineId);
    return machine?.name?.replace(/"/g, '') || "";
  };

  const avsResponse = useSWR<AxiosResponse<AVS[]>>('avs', apiFetch, {
    onSuccess: (data) => console.log("AVS data updated:", data?.data),
    onError: (error) => {
      console.error('AVS fetch error:', error);
      return [];
    }
  });

  const avs_data = avsResponse.data?.data;
  let filteredAvs = avs_data || [];

  // Apply filters based on the query parameter
  if (filter && avs_data) {
    switch (filter) {
      case "running":
        filteredAvs = avs_data.filter(avs => avs.avs_name);
        break;
      case "ethereum":
        filteredAvs = avs_data.filter(avs => avs.chain === "mainnet");
        break;
      case "active":
        filteredAvs = avs_data.filter(avs => avs.active_set === true);
        break;
      case "unhealthy":
        filteredAvs = avs_data.filter(avs => avs.errors && avs.errors.length > 0);
        break;
      default:
        filteredAvs = avs_data;
    }
  }
  // Apply search filter
  if (searchTerm) {
    filteredAvs = filteredAvs.filter(avs =>
      avs.avs_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      avs.avs_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  let sortedAvs = filteredAvs;
  if (sortConfig.key) {
  sortedAvs = sortData(filteredAvs, sortConfig);
  }

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

  useEffect(() => {
    if (location.state?.refetch) {
      response && response.mutate();
      machinesResponse && machinesResponse.mutate();
      avsResponse && avsResponse.mutate();
    }
  }, [location.state, response?.mutate, machinesResponse?.mutate, avsResponse?.mutate]);

  const formatAddress = (address: string | null | undefined): string => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getLatestVersion = (nodeType: string | null, chain: string | null): string => {
    if (!versionsResponse.data?.data || !nodeType || !chain) return "";

    const versionInfo = versionsResponse.data.data.find(
      v => v.node_type === nodeType && v.chain === chain
    );

    return versionInfo?.latest_version || "";
  };

  return (
    <>
      <Topbar title="Nodes Overview" />
      <SectionTitle title="AVS Deployments" className="text-textPrimary" />
      <MachinesWidget data={machinesStatus} details={nodesInfo} avs={avsResponse.data?.data} />
      {filteredAvs.length === 0 && !searchTerm &&!filter && <div className="mt-24"><EmptyMachines /></div>}
      <Filters
        filters={filters}
        onSearch={setSearchTerm}
      >
        <Link to="edit/keys" relative="path">
          <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary">Add Address</div>
        </Link>
        <Link to="code/installclient" relative="path">
          <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary">Install Client</div>
        </Link>
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
      </Filters>

      {showAddAvsModal && (
        <AddAVSModal
          onClose={handleCloseAddAvsModal}
          isOpen={showAddAvsModal}
        />
      )}

      {showRescanModal && (
        <RescanModal
          onClose={handleCloseRescanModal}
          isOpen={showRescanModal}
        />
      )}

      {(!avsResponse.error && (avsResponse.data?.data?.length ?? 0) > 0 || searchTerm) && (
        <>
          {filteredAvs.length === 0 && !filter && !searchTerm ? (
            <div className="mt-24"><EmptyMachines /></div>
          ) : (
            <Table>
              <Tr>
                <Th content="AVS" sortKey="avs_name" currentSort={sortConfig} onSort={setSortConfig}></Th>
                <Th content="Type" className="pr-1" sortKey="avs_type" currentSort={sortConfig} onSort={setSortConfig}></Th>
                <Th content="Chain" className="pr-1" sortKey="chain" currentSort={sortConfig} onSort={setSortConfig}></Th>
                {/*<Th content="Address" sortKey="operator_address" currentSort={sortConfig} onSort={setSortConfig}></Th>*/}
                <Th
                  content="Version" className="pr-1"
                  //sortKey="avs_version"
                  currentSort={sortConfig}
                  onSort={setSortConfig}
                  tooltip="Can show blank if AVS doesn't ship with docker container."
                ></Th>
                <Th content="Latest" className="pr-1" //sortKey="latest_version"
                currentSort={sortConfig} onSort={setSortConfig}
                tooltip="Add chain for latest version."
                ></Th>
                <Th content="Health" className="pr-1" sortKey="errors" currentSort={sortConfig} onSort={setSortConfig}
                ></Th>
                <Th
                  content="Score" 
                  sortKey="performance_score"
                  currentSort={sortConfig}
                  onSort={setSortConfig}
                  tooltip="Can show 0 if AVS doesn't have performance score metric."
                ></Th>
                <Th
                  content="Active Set"
                  sortKey="active_set"
                  currentSort={sortConfig}
                  onSort={setSortConfig}
                  tooltip="Add chain and operator public address to see AVS Active Set status."
                ></Th>
                <Th content="Last Connected" sortKey="updated_at" currentSort={sortConfig} onSort={setSortConfig}></Th>
                <Th content="Machine" sortKey="machine_id" currentSort={sortConfig} onSort={setSortConfig}></Th>
                <Th   content=""></Th>
              </Tr>
              {sortedAvs.map((avs, index) => (
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
                  {/*<Td content={formatAddress(avs.operator_address) || ""}></Td>*/}
                  <Td content={avs.avs_version === "0.0.0" ? "unknown" : avs.avs_version}></Td>
                  <Td content={getLatestVersion(avs.avs_type, avs.chain)}></Td>
                  <Td>
                    <HealthStatus
                      isConnected={avs.errors.length === 0}
                      errors={avs.errors}
                    />
                  </Td>
                  <Td score={avs.performance_score}></Td>
                  <Td isChecked={avs.active_set}></Td>
                  <Td>{getTimeStatus(avs.updated_at)}</Td>
                  <Td>
                    <MachineWidget
                      address={avs.machine_id}
                      name={getMachineName(avs.machine_id)}
                      to={`/machines/${avs.machine_id}`}
                    />
                  </Td>
                  <Td><OptionsButton options={getOptions(avs)} /></Td>
                </Tr>
              ))}
            </Table>
          )}
        </>
      )}
      <Outlet />
    </>
  );
}; // Close the component function
