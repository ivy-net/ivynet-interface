import { Link, Outlet, useSearchParams } from "react-router-dom";
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
import { ConnectedIcon } from "../shared/connectedIcon";
import useSWR from 'swr';
import { MachinesStatus, NodeDetail, NodeInfo, Response } from "../../interfaces/responses";
import { apiFetch } from "../../utils";
import { AxiosResponse } from "axios";
import { nodeDataFromJSON } from "../../interfaces/data";

interface MachinesTabProps {
};

export const MachinesTab: React.FC<MachinesTabProps> = () => {
  const options = [
    { label: "IvyClient Update", link: "code/updateclient" },
    { label: "AVS Upgrade", link: "code/avsupgrade" },
    { label: "AVS Deregister", link: "code/avsderegister" },
    { label: "View Details", link: "" },
  ]
  const filters = [
    { label: "All Nodes", query: "all" },
    { label: "High Priority", query: "high" },
    { label: "Medium Priority", query: "medium" }];

  const emptyMachineStatus = {
    total_machines: 0,
    healthy_machines: 0,
    unhealthy_machines: [],
    idle_machines: [],
    updateable_machines: [],
    erroring_machines: []
  }

  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");

  const apiFetcher = (url: string) => apiFetch(url, "GET");
  const multiFetcher = (urls: string[]): any => Promise.all(urls.map(url => apiFetcher(url)));

  const response = useSWR<AxiosResponse<Response<MachinesStatus>>, any>('client/status', apiFetcher, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0,
  })
  const machinesStatus = response.data?.data.result || emptyMachineStatus

  const machines = Array.from(new Set(machinesStatus.unhealthy_machines.concat(machinesStatus.erroring_machines).concat(machinesStatus.updateable_machines).concat(machinesStatus.idle_machines)))
  const nodesResponse = useSWR<AxiosResponse<Response<NodeDetail>>[], any>(machines.map(machine => `client/${machine}`), multiFetcher as any, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0,

  })
  const nodesInfo = nodesResponse.data?.map((ar, idx) => ar.data.result).sort((b, a) => b.machine_id.localeCompare(a.machine_id))

  let filteredNodes = nodesInfo || []

  if (filter === "high") {
    filteredNodes = filteredNodes.filter((node) => node.metrics.disk_info.status === "Critical");
  }
  else if (filter === "medium") {
    filteredNodes = filteredNodes.filter((node) => node.metrics.disk_info.status === "Warning");
  }

  console.log("filteredNodes", filteredNodes)

  return (
    <>
      <Topbar title="Nodes Overview" />
      <SectionTitle title="Node Status" className="text-textPrimary" />
      <MachinesWidget data={machinesStatus} details={nodesInfo} />
      {!machinesStatus.total_machines && <div className="mt-24"><EmptyMachines /></div>}
      {machinesStatus.total_machines > 0 &&
        <>
          <Filters filters={filters}>
            <Link to="code/installclient" relative="path">
              <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary">Install Client</div>
            </Link>
          </Filters>
          <Table>
            <Tr>
              <Th content="Nodes"></Th>
              <Th content="AVS"></Th>
              <Th content="AVS Version"></Th>
              <Th content="Connectivity"></Th>
              <Th content="Resources"></Th>
              <Th content="Active Set"></Th>
              <Th content=""></Th>
            </Tr>

            {filteredNodes?.map((node, index) =>
            (
              <Tr key={node.machine_id}>
                <Td>
                  <MachineWidget address={node.machine_id} name={node.name} to={`/nodes/${node.machine_id}`} />
                </Td>
                <Td to={`/avs/${node.metrics.deployed_avs.operator_id || ""}`} content={node.metrics.deployed_avs.name || ""}></Td>
                <Td isConnected={true}></Td>
                <Td isConnected={node.status === "Healthy"}></Td>
                <Td diskStatus={node.metrics.disk_info.status}></Td>
                <Td isChecked={node.metrics.deployed_avs.active_set === "true"}></Td>
                <Td><OptionsButton options={options} /></Td>
              </Tr>
            )
            )}

          </Table>
        </>
      }
      <Outlet />
    </>
  );
}
