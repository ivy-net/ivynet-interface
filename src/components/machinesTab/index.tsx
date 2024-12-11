import { Link, Outlet, useLocation, useSearchParams } from "react-router-dom";
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
import { useEffect } from "react";
import { AvsWidget } from "../shared/avsWidget";
import { getChainLabel } from "../../utils/UiMessages";
import HealthStatus from './HealthStatus';

interface MachinesTabProps {
};

export const MachinesTab: React.FC<MachinesTabProps> = () => {
  const options = [
    { label: "IvyClient Update", link: "code/updateclient" },
    { label: "View Details", link: "" },
    { label: "Edit Address", link: "" },
    { label: "Delete Machine", link: "" },
  ]
  const filters = [
    { label: "AVS Running", query: "running" },
    { label: "Ethereum AVS", query: "ethereum" },
    { label: "Active Set", query: "active" },
    { label: "Unhealthy", query: "unhealthy" }
  ];

  const location = useLocation()

  const getOptions = (avs: AVS): any => {
    return options.map(option => {
      if (option.label === "View Details") {
        return { label: option.label, link: `/machines/${avs.machine_id || ""}` }
      }
      if (option.label === "Edit Address") {
        return { label: option.label, link: `/machines/edit/${avs.avs_name}/${avs.machine_id || ""}` }
      }
      if (option.label === "Delete Machine") {
        return { label: option.label, link: `/machines/delete/${avs.avs_name}/${avs.machine_id || ""}` }
      }
      return option
    })
  }

  const emptyMachineStatus = {
    total_machines: 0,
    healthy_machines: [],
    unhealthy_machines: [],
    idle_machines: [],
    updateable_machines: [],
    erroring_machines: []
  }

  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");

  const apiFetcher = (url: string) => apiFetch(url, "GET");
  const multiFetcher = (urls: string[]): any => Promise.all(urls.map(url => apiFetcher(url)));

  const response = useSWR<AxiosResponse<Response<MachinesStatus>>, any>('client', apiFetcher, {
    revalidateOnFocus: true,
    revalidateOnMount: true,
    revalidateOnReconnect: true,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0,
  })
  const machinesStatus = response.data?.data.result || emptyMachineStatus
  const machines = Array.from(new Set(machinesStatus.unhealthy_machines.concat(machinesStatus.erroring_machines).concat(machinesStatus.updateable_machines).concat(machinesStatus.idle_machines).concat(machinesStatus.healthy_machines)))
  const nodesResponse = useSWR<AxiosResponse<Response<NodeDetail>>[], any>(machines.map(machine => `client/${machine}`), multiFetcher as any, {
    revalidateOnFocus: true,
    revalidateOnMount: true,
    revalidateOnReconnect: true,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0,
  })
  const nodesInfo = nodesResponse.data?.map((ar, idx) => ar.data.result).sort((b, a) => b.machine_id.localeCompare(a.machine_id))

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

  const avsResponse = useSWR<AxiosResponse<AVS[]>>('avs', apiFetcher, {
    onSuccess: (data) => console.log("AVS data received:", data?.data),
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
        // Show all running AVS names
        filteredAvs = avs_data.filter(avs => avs.avs_name);
        break;

      case "ethereum":
        // Show only AVS on mainnet chain
        filteredAvs = avs_data.filter(avs => avs.chain === "mainnet");
        break;

      case "active":
        // Show only AVS where active_set is true
        filteredAvs = avs_data.filter(avs => avs.active_set === true);
        break;

      case "unhealthy":
        // Show only AVS with unhealthy status
        filteredAvs = avs_data.filter(avs => avs.errors && avs.errors.length > 0);
        break;

      default:
        filteredAvs = avs_data;
    }
  }

  useEffect(() => {
    if (location.state?.refetch) {
      response && response.mutate()
      machinesResponse && machinesResponse.mutate()
      avsResponse && avsResponse.mutate()
    }
  }, [location.state, response?.mutate,]);

  const formatAddress = (address: string | null | undefined): string => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <>
      <Topbar title="Nodes Overview" />
      <SectionTitle title="AVS Deployments" className="text-textPrimary" />
      <MachinesWidget data={machinesStatus} details={nodesInfo} avs={avsResponse.data?.data} />
      {filteredAvs.length === 0 && <div className="mt-24"><EmptyMachines /></div>}
      {filteredAvs.length > 0 &&
        <>
          <Filters filters={filters}>
            <Link to="edit/keys" relative="path">
              <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary">Edit Addresses</div>
            </Link>
            <Link to="code/installclient" relative="path">
              <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary">Install Client</div>
            </Link>
            <Link to="code/addavs" relative="path">
              <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary">Add AVS</div>
            </Link>
          </Filters>
          <Table>
            <Tr>
              <Th content="AVS"></Th>
              <Th content="Chain"></Th>
              <Th content="Version" tooltip="Can show blank if AVS doesn't ship with docker container."></Th>
              <Th content="Latest"></Th>
              <Th content="Health"></Th>
              <Th content="Score" tooltip="Can show 0 if AVS doesn't have performance score metric."></Th>
              <Th content="Address"></Th>
              <Th content="Active Set" tooltip="Add chain and operator public address to see AVS Active Set status."></Th>
              <Th content="Machine"></Th>
              <Th content=""></Th>
            </Tr>

            {filteredAvs.map((avs, index) => (
              <Tr key={`${avs.machine_id}-${avs.avs_name}`}>
                <Td>
                  <AvsWidget
                    name={avs.avs_name}
                    //to={`/machines/avs/${avs.avs_name}`}
                    />
                </Td>
                <Td content={getChainLabel(avs.chain)}></Td>
                <Td content={avs.avs_version}></Td>
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
                    name={getMachineName(avs.machine_id)}
                    to={`/machines/${avs.machine_id}`} />
                </Td>
                <Td><OptionsButton options={getOptions(avs)} /></Td>
              </Tr>
            ))}
          </Table>
        </>
      }
      <Outlet />
    </>
  );
}
