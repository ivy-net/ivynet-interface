import { Link, Outlet, useLocation, useSearchParams } from "react-router-dom";
import React, { useEffect, useState, useMemo, useCallback } from "react";
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
import { VersionInfo, AVSInfo, ConsolidatedMachine } from "../../interfaces/responses";
import { apiFetch } from "../../utils";
import { AxiosResponse } from "axios";
import { AvsWidget } from "../shared/avsWidget";
import { sortData } from '../../utils/SortData';
import HealthStatus from './HealthStatus';
import { AddAVSModal } from "./AddAVSModal";
import { EmptyMachines } from "./EmptyMachines";
import { toast } from 'react-toastify';
import ChainCell from "./ChainCell";
import { RescanModal } from './Rescan';
import { NodeTypeCell, formatNodeType } from './NodeTypeCell';
import OperatorCell from './OperatorName';
import VersionStatusCell from './VersionStatusCell';

const fetcher = (url: string) => apiFetch(url, "GET");

interface OperatorData {
  organization_id: number;
  name: string;
  public_key: string;
}

const getMachineName = (machineId: string | undefined, machineName?: string): string => {
  if (!machineId) return 'Unknown Machine';
  return machineName || 'Unknown Machine';
};

const truncateVersion = (version: string): string => {
  if (!version) return version;
  if (version.length <= 8) return version;
  return `${version.slice(0, 8)}`;
};

export const MachinesTab: React.FC = () => {
  const [showAddAvsModal, setShowAddAvsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRescanModal, setShowRescanModal] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | 'none' }>({
    key: null,
    direction: 'none'
  });

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");

  const { data: machinesData, mutate: mutateMachines } = useSWR<AxiosResponse<ConsolidatedMachine[]>>(
    'machine',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshInterval: 0,
      errorRetryCount: 3,
      shouldRetryOnError: false,
      dedupingInterval: 10000,
      onError: () => {
        if (!localStorage.getItem('machine-fetch-error')) {
          toast.error('Error loading machines data. Please refresh the page to try again.', {
            theme: "dark",
            toastId: 'machine-fetch-error',
            autoClose: 5000
          });
          localStorage.setItem('machine-fetch-error', 'true');
        }
      }
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
      dedupingInterval: 100000,
      revalidateIfStale: false,
      isPaused: () => false
    }
  );

    const pubkeysResponse = useSWR<AxiosResponse<OperatorData[]>, any>('pubkey', fetcher, {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // Cache for 5 minutes
      refreshInterval: 0,
    });

  const getTimeStatus = (timestamp: string | null | undefined): JSX.Element => {
    if (!timestamp) {
      return (
        <span className=" text-textWarning">
          Not Available
        </span>
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
      timeAgo = '< 1 Mn Ago';
    } else if (diffMinutes < 60) {
      timeAgo = `${diffMinutes} ${diffMinutes === 1 ? 'Mn' : 'Mn'} Ago`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} ${diffHours === 1 ? 'Hr' : 'Hrs'} Ago`;
    } else {
      timeAgo = `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'} Ago`;
    }

    // Determine text color class based on time difference
    let textColorClass = 'text-positive';
    if (diffMinutes >= 60) {
      textColorClass = 'text-textWarning';
    } else if (diffMinutes >= 15) {
      textColorClass = 'text-textSecondary';
    }

    return (
      <div className={`text-sm ${textColorClass} text-left`}>
        {timeAgo}
      </div>
    );
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

  const options = [
    { label: "View Machine", link: "" },
    { label: "Edit Address", link: "" },
    { label: "Remove AVS", link: "" },
  ];

  const filters = [
    { label: "All AVS", query: "running" },
    { label: "Mainnet", query: "ethereum" },
    { label: "Holesky", query: "holesky" },
    { label: "Eigenlayer", query: "eigenlayer" },
    { label: "Symbiotic", query: "symbiotic" }
  ];


  // Extract all AVS entries and combine with machine data
  const allAvs = useMemo(() => {
    if (!machinesData?.data) return [];
    return machinesData.data.flatMap(machine =>
      machine.avs_list.map((avs: AVSInfo) => ({
        ...avs,
        machineName: machine.name?.replace(/"/g, ''),
        machineStatus: machine.status,
        systemMetrics: machine.system_metrics
      }))
    );
  }, [machinesData]);


  const filteredAvs = useMemo(() => {
    let filtered = allAvs;

    if (filter) {
      switch (filter) {
        case "running":
          filtered = filtered.filter(avs => avs.avs_name);
          break;
        case "ethereum":
          filtered = filtered.filter(avs => avs.chain === "mainnet");
          break;
        case "holesky":
          filtered = filtered.filter(avs => avs.chain === "holesky");
          break;
        case "eigenlayer":
          filtered = filtered.filter(avs => avs.protocol?.toLowerCase() === "eigenlayer");
          break;
        case "symbiotic":
          filtered = filtered.filter(avs => avs.protocol?.toLowerCase() === "symbiotic");
          break;
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(avs => {
        // Handle the node type formatting inline
        const avsTypeString = typeof avs.avs_type === 'object'
          ? (() => {
              if (!avs.avs_type) return '';
              const [type, value] = Object.entries(avs.avs_type)[0];
              if (type === 'Altlayer') {
                return `${type}: ${value}`;
              }
              if (type === 'MachType') {
                return `Mach: ${value}`;
              }
              return `${type}: ${value}`;
            })()
          : (avs.avs_type || '');

        return (avs.avs_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
               avsTypeString.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    return sortConfig.key ? sortData(filtered, sortConfig) : filtered;
  }, [allAvs, filter, searchTerm, sortConfig]);

  const machineStatus = useMemo(() => {
    if (!machinesData?.data?.length) return {
      total_machines: 0,
      healthy_machines: [] as string[],
      unhealthy_machines: [] as string[],
      idle_machines: [] as string[],
      updateable_machines: [] as string[],
      erroring_machines: [] as string[]
    };

    const status = {
      total_machines: machinesData.data.length,
      healthy_machines: [] as string[],
      unhealthy_machines: [] as string[],
      idle_machines: [] as string[],
      updateable_machines: [] as string[],
      erroring_machines: [] as string[]
    };

    machinesData.data.forEach((machine: ConsolidatedMachine) => {
      const machineId = machine.machine_id;
      const hasErrors = machine.errors && machine.errors.length > 0;
      const hasUpdates = machine.avs_list.some((avs: AVSInfo) => avs.update_status === "Updateable");

      if (hasErrors) {
        status.erroring_machines.push(machineId);
      }
      if (hasUpdates) {
        status.updateable_machines.push(machineId);
      }
      if (machine.status === "Healthy") {
        status.healthy_machines.push(machineId);
      }
      if (machine.status === "Unhealthy") {
        status.unhealthy_machines.push(machineId);
      }
    });

    return status;
  }, [machinesData]);


  const handleDeleteAVS = async (avs: AVSInfo) => {
    if (!window.confirm(`Are you sure you want to remove ${avs.avs_name}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const url = `machine/${avs.machine_id}?avs_name=${encodeURIComponent(avs.avs_name)}`;
      const deleteResponse = await apiFetch(url, 'DELETE');

      if (deleteResponse.status === 200) {
        await mutateMachines();
        toast.success(`Successfully removed ${avs.avs_name}`, { theme: "dark" });
      }
    } catch (error) {
      console.error('Delete AVS error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getOptions = (avs: AVSInfo): any => {
    return options.map(option => {
      if (option.label === "View Machine") {
        return { label: option.label, link: `/machines/${avs.machine_id || ""}` };
      }
      if (option.label === "Edit Address") {
        return { label: option.label, link: `/nodes/edit/${avs.avs_name}/${avs.machine_id || ""}` };
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

  const getLatestVersion = useCallback((nodeType: any, chain: string | null): string => {
    if (!versionsData?.data || !nodeType) return "";

    const effectiveChain = chain || "mainnet";

    // If nodeType is an object (like {Altlayer: "X"} or {MachType: "Y"} etc)
    if (typeof nodeType === 'object') {
        const foundVersion = versionsData.data.find(v => {
            // If version's node_type is also an object
            if (typeof v.node_type === 'object') {
                const versionEntries = Object.entries(v.node_type)[0];
                const nodeTypeEntries = Object.entries(nodeType)[0];

                // Match if the main type or sub type matches and chains match
                const typesMatch =
                    versionEntries[0] === nodeTypeEntries[0] ||  // Same main type
                    versionEntries[1] === nodeTypeEntries[1] ||  // Same sub type
                    (versionEntries[0].includes(nodeTypeEntries[0]) || nodeTypeEntries[0].includes(versionEntries[0])) // Type includes the other

                return typesMatch && v.chain === effectiveChain;
            }
            return false;
        });

        return foundVersion?.latest_version || "";
    }

    // For regular string node types
    const foundVersion = versionsData.data.find(v =>
        v.node_type === nodeType && v.chain === effectiveChain
    );

    return foundVersion?.latest_version || "";
}, [versionsData]);


  useEffect(() => {
    if (location.state?.refetch) {
      localStorage.removeItem('machine-fetch-error'); // Clear error state on manual refetch
      mutateMachines();
    }
  }, [location.state, mutateMachines]);

  // Remove the separate error effect since we're handling it in the SWR config
  return (
     <>
     <Topbar title="Nodes Overview" />
        <SectionTitle title="AVS Deployments" className="text-textPrimary" />
        <MachinesWidget
        data={machineStatus}
        avs={allAvs}
        />

        {allAvs.length === 0 && !searchTerm && !filter && (
        <div className="mt-24">
          <EmptyMachines />
        </div>
        )}

        {(allAvs.length > 0 || searchTerm || filter) && (
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
        )}

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

       {(allAvs.length > 0 || searchTerm || filter) && (
         <Table>
              <Tr>
                <Th content="AVS" sortKey="avs_name" currentSort={sortConfig} onSort={setSortConfig}></Th>
                <Th content="Type" sortKey="avs_type" currentSort={sortConfig} onSort={setSortConfig}></Th>
                <Th content="Protocol" sortKey="protocol" currentSort={sortConfig} onSort={setSortConfig}></Th>
                <Th content="Chain" sortKey="chain" currentSort={sortConfig} onSort={setSortConfig}></Th>
                <Th content="Address" sortKey="operator_address" currentSort={sortConfig} onSort={setSortConfig}></Th>
                <Th content="Version" sortKey="errors" currentSort={sortConfig} onSort={setSortConfig}
                ></Th>
          {/*        <Th
                  content="Version"
                  //sortKey="avs_version"
                  currentSort={sortConfig}
                  onSort={setSortConfig}
                  tooltip="Currently N/A if AVS lacks docker container or requires local build. Not all AVS use semantic versioning."
                ></Th>
                <Th content="Latest" //sortKey="latest_version"
                currentSort={sortConfig} onSort={setSortConfig}
                tooltip="Add chain for latest version. Not all AVS use semantic versioning."
                ></Th>*/}
                <Th content="Issues" sortKey="errors" currentSort={sortConfig} onSort={setSortConfig}
                ></Th>
         {/*       <Th
                content="Score"
                sortKey="performance_score"
                currentSort={sortConfig}
                onSort={setSortConfig}
                tooltip="Currently N/A if AVS doesn't have metrics."
                className="text-center"
              ></Th> */}
                <Th
                  content="Active Set"
                  sortKey="active_set"
                  currentSort={sortConfig}
                  onSort={setSortConfig}
                  //tooltip="Add chain and operator public address to see AVS Active Set status."
                ></Th>
                <Th content="Updated" sortKey="updated_at" currentSort={sortConfig} onSort={setSortConfig}></Th>
                <Th content="Machine" sortKey="machine_id" currentSort={sortConfig} onSort={setSortConfig}  ></Th>
                <Th content=""></Th>
              </Tr>
              {(filteredAvs).map((avs, index) => (
  <Tr key={`${avs.machine_id}-${avs.avs_name}-${index}`}>
    <Td><AvsWidget name={avs.avs_name}
    //    to={`/nodes/${avs.avs_name}`}

    /></Td>
                  <Td>
                  <NodeTypeCell
                    nodeType={avs.avs_type}
                    avsName={avs.avs_name}
                    machineId={avs.machine_id}
                    mutateMachines={mutateMachines}
                  />
                </Td>
                <Td>
    <div className="text-left px-3 py-2 rounded-lg text-textSecondary">
      {avs.protocol || '---'}
    </div>
  </Td>                  <Td>
                  <ChainCell
                  chain={avs.chain}
                  avsName={avs.avs_name}
                  machineId={avs.machine_id || ""}
                  />
                  </Td>
                  <Td>
                  <OperatorCell
                    operatorAddress={avs.operator_address || ""}
                    operatorData={pubkeysResponse.data?.data}
                    avsName={avs.avs_name}
                    machineId={avs.machine_id || ""}
                  />
                </Td>
                <Td>
  <VersionStatusCell
    updateStatus={avs.update_status}
    currentVersion={avs.avs_version}
    latestVersion={getLatestVersion(avs.avs_type, avs.chain)}
    avsName={avs.avs_name}

  />
</Td>

 {/* <Td content={ avs.avs_version === "0.0.0" ? "---" : avs.avs_version === "Local" ? "Local" : (avs.avs_version === "latest" && getLatestVersion(avs.avs_type, avs.chain) === "latest" && avs.errors?.includes('NeedsUpdate')) ? "outdated" : truncateVersion(avs.avs_version) } className="px-1"></Td>
                  <Td content={avs.avs_version === "Othentic" || avs.avs_version === "Local" ? "Local" : truncateVersion(getLatestVersion(avs.avs_type, avs.chain))} className="px-1" ></Td> */}
                  <Td>
                    <HealthStatus
                      isChecked={avs.errors.length === 0}
                      errors={avs.errors}
                      avsName={avs.avs_name}
                    />
                  </Td>
             {/*       <Td score={avs.performance_score} className="text-center"></Td> */}
                  <Td isChecked={avs.active_set}></Td>
                  <Td className="w-42">{getTimeStatus(avs.updated_at)}</Td>
                  <Td>
                  <MachineWidget
                    address={avs.machine_id}
                    name={getMachineName(avs.machine_id, avs.machineName)}
                    to={`/machines/${avs.machine_id}`}
                    hideIcon={true}
                  />
                  </Td>
                  <Td>
                  <OptionsButton
      options={getOptions(avs)}
      inHeader={true}
      className="mr-14"
    />
                 </Td>
                  </Tr>
           ))}
         </Table>
       )}
       <Outlet />
     </>
   );
 };
