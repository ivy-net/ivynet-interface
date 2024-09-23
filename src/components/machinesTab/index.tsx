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
import { MachinesStatus, Response } from "../../interfaces/responses";
import { apiFetch } from "../../utils";
import { useEffect } from "react";
import { AxiosResponse } from "axios";

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

  const nodes = [
    {
      address: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
      name: "Node 1",
      ivy: null,
      to: "/nodes/0x235eE805F962690254e9a440E01574376136ecb1",
      connectivity: true,
      avs: "AVS 1",
      avsTo: "/avs/1234",
      avsVersion: true,
      diskStatus: "critical",
      activeSet: true,
    },
    {
      address: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
      name: "Node 2",
      ivy: true,
      avs: "AVS 2",
      avsTo: "/avs/1234",
      to: "/nodes/0x235eE805F962690254e9a440E01574376136ecb1",
      avsVersion: false,
      connectivity: true,
      diskStatus: "fair",
      activeSet: false,
    },
    {
      address: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
      name: "Node 3",
      ivy: false,
      avs: "AVS 3",
      avsTo: "/avs/1234",
      to: "/nodes/0x235eE805F962690254e9a440E01574376136ecb1",
      avsVersion: true,
      connectivity: false,
      diskStatus: "good",
      activeSet: false,
    },
    {
      address: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
      name: "Node 4",
      ivy: false,
      avs: "-",
      avsTo: "",
      to: "/nodes/0x235eE805F962690254e9a440E01574376136ecb1",
      avsVersion: true,
      connectivity: false,
      diskStatus: "critical",
      activeSet: true,
    },
    {
      address: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
      name: "Node 5",
      ivy: true,
      avs: "AVS 3",
      avsTo: "/avs/1234",
      to: "/nodes/0x235eE805F962690254e9a440E01574376136ecb1",
      avsVersion: true,
      connectivity: true,
      diskStatus: "fair",
      activeSet: false,
    },
    {
      address: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
      name: "Node 6",
      ivy: null,
      to: "/nodes/0x235eE805F962690254e9a440E01574376136ecb1",
      connectivity: true,
      avs: "AVS 4",
      avsTo: "/avs/1234",
      avsVersion: true,
      diskStatus: "critical",
      activeSet: true,
    },
  ]

  const apiFetcher = (url: string) => apiFetch(url, "GET");

  const response = useSWR<AxiosResponse<Response<MachinesStatus>>, any>('client/status', apiFetcher)
  const machinesStatus = response.data?.data.result || emptyMachineStatus

  let filteredNodes = nodes

  if (filter === "high") {
    filteredNodes = filteredNodes.filter((node) => node.ivy === false);
  }
  else if (filter === "medium") {
    filteredNodes = filteredNodes.filter((node) => node.ivy !== true);
  }

  return (
    <>
      <Topbar title="Nodes Overview" />
      <SectionTitle title="Node Status" className="text-textPrimary" />
      <MachinesWidget data={machinesStatus} />
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
              <Th content="Ivy"></Th>
              <Th content="AVS"></Th>
              <Th content="AVS Version"></Th>
              <Th content="Connectivity"></Th>
              <Th content="Resources"></Th>
              <Th content="Active Set"></Th>
              <Th content=""></Th>
            </Tr>
            {filteredNodes.map((node, index) =>
            (
              <Tr key={index}>
                <Td>
                  <MachineWidget address={node.address} name={node.name} to={node.to} />
                </Td>
                <Td>
                  <ConnectedIcon isConnected={node.ivy} />
                </Td>
                <Td to={node.avsTo} content={node.avs}></Td>
                <Td isConnected={node.avsVersion}></Td>
                <Td isConnected={node.connectivity}></Td>
                <Td diskStatus={node.diskStatus as any}></Td>
                <Td isChecked={node.activeSet}></Td>
                <Td><OptionsButton options={options} /></Td>
              </Tr>
            ))}
          </Table>
        </>
      }
      <Outlet />
    </>
  );
}
