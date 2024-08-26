import { Link, Outlet, useSearchParams } from "react-router-dom";
import { Topbar } from "../Topbar";
import { MachineWidget } from "../shared/machineWidget";
import { MachinesWidget } from "../shared/machinesWidget";
import { OptionsButton } from "../shared/optionsButton";
import { Table } from "../shared/table";
import { Td } from "../shared/table/Td";
import { Th } from "../shared/table/Th";
import { Tr } from "../shared/table/Tr";
import { SearchBar } from "../shared/searchBar";
import { Filters } from "../shared/filters";
import { SectionTitle } from "../shared/sectionTitle";
import { EmptyMachines } from "./EmptyMachines";
import { useState } from "react";

interface MachinesTabProps {
};

export const MachinesTab: React.FC<MachinesTabProps> = ({ }) => {
  const [fakeData, setFakeData] = useState({
    totalMachines: 0,
    needUpgrade: 0,
    needUpdate: 3,
    newAvs: 3
  });

  const options = [
    { label: "IvyClient Update", link: "code/updateclient" },
    { label: "AVS Upgrade", link: "code/avsupgrade" },
    { label: "AVS Deregister", link: "code/avsderegister" },
    { label: "View Details", link: "" },
  ]
  const filters = [
    { label: "All Nodes", query: "all" },
    { label: "Needs Upgrade", query: "upgrade" },
    { label: "AVS Activation", query: "activation" },
    { label: "Idle Nodes", query: "idle" }];


  return (
    <>
      <Topbar title="Nodes Overview" />
      <SectionTitle title="Node Status" className="text-textPrimary" />
      <MachinesWidget data={fakeData} />
      {!fakeData.totalMachines && <div className="mt-24"><EmptyMachines onClick={() => setFakeData({ ...fakeData, totalMachines: 6 })} /></div>}
      {fakeData.totalMachines > 0 &&
        <>
          <Filters filters={filters}>
            <Link to="code/installclient" relative="path">
              <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary">Install Client</div>
            </Link>
          </Filters>
          <Table>
            <Tr>
              <Th content="Nodes"></Th>
              <Th content="AVS Name"></Th>
              <Th content="Connectivity"></Th>
              <Th content="Resources"></Th>
              <Th content="Active Set"></Th>
              <Th content=""></Th>
            </Tr>
            <Tr>
              <Td>
                <MachineWidget address="0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5" name="Node 1" isConnected={true} />
              </Td>
              <Td to="/avs/1234" content="AVS 2"></Td>
              <Td isConnected={true}></Td>
              <Td diskStatus="critical"></Td>
              <Td isChecked={true}></Td>
              <Td><OptionsButton options={options} /></Td>
            </Tr>
            <Tr>
              <Td>
                <MachineWidget address="0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5" name="Node 2" isConnected={false} />
              </Td>
              <Td content="AVS 1"></Td>
              <Td isConnected={false}></Td>
              <Td diskStatus="fair"></Td>
              <Td isChecked={false}></Td>
              <Td><OptionsButton options={options} /></Td>
              <Td>
              </Td>
            </Tr>
            <Tr>
              <Td>
                <MachineWidget address="0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5" name="Node 3" isConnected={true} />
              </Td>
              <Td to="/avs/2345" content="AVS 2"></Td>
              <Td isConnected={true}></Td>
              <Td diskStatus="good"></Td>
              <Td isChecked={true}></Td>
              <Td><OptionsButton options={options} /></Td>
            </Tr>
            <Tr>
              <Td>
                <MachineWidget address="0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5" name="Node 4" isConnected={false} />
              </Td>
              <Td content="-"></Td>
              <Td isConnected={false}></Td>
              <Td diskStatus="good"></Td>
              <Td isChecked={false}></Td>
              <Td><OptionsButton options={options} /></Td>
            </Tr>
          </Table>
        </>
      }
      <Outlet />
    </>
  );
}
