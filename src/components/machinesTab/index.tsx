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
import { EmptyMachines } from "./EmptyMachines";
import useSWR from 'swr';
import { AVS, MachineDetails, MachinesStatus, NodeDetail, Response } from "../../interfaces/responses";
import { apiFetch } from "../../utils";
import { AxiosResponse } from "axios";
import { AvsWidget } from "../shared/avsWidget";
import { getChainLabel } from "../../utils/UiMessages";
import HealthStatus from './HealthStatus';
import { AddAVSModal } from "./AddAVSModal";
import { toast } from 'react-toastify';


interface MachinesTabProps {};

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
  const handleCloseAddAvsModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowAddAvsModal(false);
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

  const [isDeleting, setIsDeleting] = useState(false);

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
      avs.avs_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
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


const formatTimestamp = (timestamp: string): string => {
    if (!timestamp) return '';
    // Remove milliseconds, replace 'T' with space, and add UTC
    return timestamp.split('.')[0].replace('T', ' ') + ' UTC';
  };


  return (
      <>
        <Topbar title="Nodes Overview" />
        <SectionTitle title="AVS Deployments" className="text-textPrimary" />
        <MachinesWidget data={machinesStatus} details={nodesInfo} avs={avsResponse.data?.data} />
        {filteredAvs.length === 0 && <div className="mt-24"><EmptyMachines /></div>}
        {filteredAvs.length > 0 && (
          <>
            <Filters
              filters={filters}
              onSearch={setSearchTerm}
            >
              <Link to="edit/keys" relative="path">
                <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary">Edit Addresses</div>
              </Link>
              <Link to="code/installclient" relative="path">
                <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary">Install Client</div>
              </Link>
              {/* Replace Link with button */}
              <button
                onClick={() => setShowAddAvsModal(true)}
                className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
              >
                Add AVS
              </button>
            </Filters>
            {showAddAvsModal && (
            <AddAVSModal
              onClose={handleCloseAddAvsModal}
              isOpen={showAddAvsModal}
            />
          )}
          <Table>
            <Tr>
              <Th content="AVS"></Th>
              <Th content="Type"></Th>
              <Th content="Chain"></Th>
              <Th content="Address"></Th>
              <Th content="Version" tooltip="Can show blank if AVS doesn't ship with docker container."></Th>
              <Th content="Latest"></Th>
              <Th content="Health"></Th>
              <Th content="Score" tooltip="Can show 0 if AVS doesn't have performance score metric."></Th>
              <Th content="Active Set" tooltip="Add chain and operator public address to see AVS Active Set status."></Th>
              <Th content="Machine"></Th>
              <Th content="Last Updated"></Th>
              <Th content=""></Th>
            </Tr>
            {filteredAvs.map((avs, index) => (
              <Tr key={`${avs.machine_id}-${avs.avs_name}`}>
                <Td>
                  <AvsWidget
                    name={avs.avs_name}
                  />
                </Td>
                <Td content={avs.avs_type}></Td>
                <Td content={getChainLabel(avs.chain)}></Td>
                <Td content={formatAddress(avs.operator_address) || ""}></Td>
                <Td content={avs.avs_version === "0.0.0" ? "unknown" : avs.avs_version}></Td>
                <Td content={getLatestVersion(avs.avs_type, avs.chain)}></Td>                <Td>
                  <HealthStatus
                    isConnected={avs.errors.length === 0}
                    errors={avs.errors}
                  />
                </Td>
                <Td score={avs.performance_score}></Td>
                <Td isChecked={avs.active_set}></Td>
                <Td>
                  <MachineWidget
                    address={avs.machine_id}
                    name={getMachineName(avs.machine_id)}
                    to={`/machines/${avs.machine_id}`}
                  />
                </Td>
                <Td content={formatTimestamp(avs.updated_at)}></Td>
                <Td><OptionsButton options={getOptions(avs)} /></Td>
              </Tr>
            ))}
          </Table>
        </>
      )}
      <Outlet />
    </>
  );
};
