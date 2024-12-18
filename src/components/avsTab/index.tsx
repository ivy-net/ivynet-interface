import React from 'react';
import { Outlet } from "react-router-dom";
import { Topbar } from "../Topbar";
import { AvsWidget } from "../shared/avsWidget";
import { Filters } from "../shared/filters";
import { OptionsButton } from "../shared/optionsButton";
import { Table } from "../shared/table";
import { Td } from "../shared/table/Td";
import { Th } from "../shared/table/Th";
import { Tr } from "../shared/table/Tr";

interface AvsTabProps {
};

export const AvsTab: React.FC<AvsTabProps> = () => {
  const filters = [
    { label: "All AVSs", query: "all" },
    { label: "AVS needs upgrades", query: "upgrades" },
    { label: "AVS running", query: "running" }
  ];
  const options = [
    { label: "Deploy AVS", link: "" },
    { label: "View Machine", link: "/machines/0x235eE805F962690254e9a440E01574376136ecb1" },
    { label: "View Details", link: "" },
  ]

  return (
    <>
      <Topbar title="AVS Overview" />
      <Filters filters={filters} />
      <Table>
        <Tr>
          <Th content="AVS"></Th>
          <Th content="Node"></Th>
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
          <Td content="Node 1" to="/machines/0x235eE805F962690254e9a440E01574376136ecb1" />
          <Td content="1 ETH"></Td>
          <Td content="No"></Td>
          <Td content="23"></Td>
          <Td content="Yes"></Td>
          <Td>
            <OptionsButton options={options} />
          </Td>
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
          <Td>
            <OptionsButton options={options} />
          </Td>
        </Tr>
        <Tr>
          <Td>
            <AvsWidget name="AVS 1" description="AVS 1 Description" />
          </Td>
          <Td content="Node 3" to="/machines/0x235eE805F962690254e9a440E01574376136ecb1" />
          <Td content="1 ETH"></Td>
          <Td content="Yes"></Td>
          <Td content="23"></Td>
          <Td content="Yes"></Td>
          <Td>
            <OptionsButton options={options} />
          </Td>
        </Tr>
        <Tr>
          <Td>
            <AvsWidget name="AVS 1" description="AVS 1 Description" />
          </Td>
          <Td content="Node 4" to="/machines/0x235eE805F962690254e9a440E01574376136ecb1" />
          <Td content="1 ETH"></Td>
          <Td content="No"></Td>
          <Td content="23"></Td>
          <Td content="Yes"></Td>
          <Td>
            <OptionsButton options={options} />
          </Td>
        </Tr>

      </Table>
      <Outlet />
    </>
  );
}
