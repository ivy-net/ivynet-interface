import { Topbar } from "../Topbar";
import { MachineWidget } from "../shared/machineWidget";
import { MachinesWidget } from "../shared/machinesWidget";
import { OptionsButton } from "../shared/optionsButton";
import { Table } from "../shared/table";
import { Td } from "../shared/table/Td";
import { Th } from "../shared/table/Th";
import { Tr } from "../shared/table/Tr";

interface MachinesTabProps {
};

export const MachinesTab: React.FC<MachinesTabProps> = ({ }) => {
  return (
    <>
      <Topbar title="Machines Overview" />
      <MachinesWidget />
      <Table>
        <Tr>
          <Th content="Machines"></Th>
          <Th content="AVS Name"></Th>
          <Th content="Connectivity"></Th>
          <Th content="Resources"></Th>
          <Th content="Active Set"></Th>
          <Th content=""></Th>
        </Tr>
        <Tr>
          <Td>
            <MachineWidget address="0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5" name="Machine 1" isConnected={true} />
          </Td>
          <Td to="/avs" content="AVS 2"></Td>
          <Td isConnected={true}></Td>
          <Td diskStatus="critical"></Td>
          <Td isChecked={true}></Td>
          <Td><OptionsButton /></Td>
        </Tr>
        <Tr>
          <Td>
            <MachineWidget address="0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5" name="Machine 2" isConnected={false} />
          </Td>
          <Td content="AVS 1"></Td>
          <Td isConnected={false}></Td>
          <Td diskStatus="fair"></Td>
          <Td isChecked={false}></Td>
          <Td><OptionsButton /></Td>
          <Td>
          </Td>
        </Tr>
        <Tr>
          <Td>
            <MachineWidget address="0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5" name="Machine 3" isConnected={true} />
          </Td>
          <Td to="/avs" content="AVS 2"></Td>
          <Td isConnected={true}></Td>
          <Td diskStatus="good"></Td>
          <Td isChecked={true}></Td>
          <Td><OptionsButton /></Td>

        </Tr>
        <Tr>
          <Td>
            <MachineWidget address="0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5" name="Machine 4" isConnected={false} />
          </Td>
          <Td content="-"></Td>
          <Td isConnected={false}></Td>
          <Td diskStatus="good"></Td>
          <Td isChecked={false}></Td>
          <Td><OptionsButton /></Td>
        </Tr>
      </Table>


    </>
  );
}
