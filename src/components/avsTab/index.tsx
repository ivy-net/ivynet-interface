import { Topbar } from "../Topbar";
import { AvsWidget } from "../shared/avsWidget";
import { OptionsButton } from "../shared/optionsButton";
import { Table } from "../shared/table";
import { Td } from "../shared/table/Td";
import { Th } from "../shared/table/Th";
import { Tr } from "../shared/table/Tr";

interface AvsTabProps {
};

export const AvsTab: React.FC<AvsTabProps> = ({ }) => {
  return (
    <>
      <Topbar title="AVS Overview" />
      <Table>
        <Tr>
          <Th content="AVS"></Th>
          <Th content="Machine"></Th>
          <Th content="Stake Minimum"></Th>
          <Th content="Allowlist"></Th>
          <Th content="Operators"></Th>
          <Th content="Rewards"></Th>
          <Th content=""></Th>
        </Tr>
        <Tr>
          <Td>
            <AvsWidget name="AVS 1" description="AVS 1 Description" />
          </Td>
          <Td content="Machine 1" to="/machines/0x235eE805F962690254e9a440E01574376136ecb1" />
          <Td content="1 ETH"></Td>
          <Td content="No"></Td>
          <Td content="23"></Td>
          <Td content="Yes"></Td>
          <Td><OptionsButton /></Td>
        </Tr>
        <Tr>
          <Td>
            <AvsWidget name="AVS 1" description="AVS 1 Description" />
          </Td>
          <Td content="-" to="/machines/" />
          <Td content="0.1 ETH"></Td>
          <Td content="No"></Td>
          <Td content="23"></Td>
          <Td content="Yes"></Td>
          <Td><OptionsButton /></Td>
        </Tr>
        <Tr>
          <Td>
            <AvsWidget name="AVS 1" description="AVS 1 Description" />
          </Td>
          <Td content="Machine 3" to="/machines/0x235eE805F962690254e9a440E01574376136ecb1" />
          <Td content="1 ETH"></Td>
          <Td content="Yes"></Td>
          <Td content="23"></Td>
          <Td content="Yes"></Td>
          <Td><OptionsButton /></Td>
        </Tr>
        <Tr>
          <Td>
            <AvsWidget name="AVS 1" description="AVS 1 Description" />
          </Td>
          <Td content="Machine 4" to="/machines/0x235eE805F962690254e9a440E01574376136ecb1" />
          <Td content="1 ETH"></Td>
          <Td content="No"></Td>
          <Td content="23"></Td>
          <Td content="Yes"></Td>
          <Td><OptionsButton /></Td>
        </Tr>

      </Table>
    </>
  );
}
