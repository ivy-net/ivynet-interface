import React from "react";
import { Table } from "../shared/table";
import { Th } from "../shared/table/Th";
import { Tr } from "../shared/table/Tr";
import { shortenAddress } from "../../utils";
import { Td } from "../shared/table/Td";

interface OrgTableProps {
};

export const OrgTable: React.FC<OrgTableProps> = ({ }) => {
  const stats = [
    {
      address: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5", nodes: 3,
      totalStake: ["125 ETH", "1,200 Eigen", "X Other Tokens"],
      avsRunning: ["3", "[AVS 1]", "[AVS 2]", "[AVS 3]"],
      avsActiveSets: ["3", "[AVS 1]", "[AVS 2]", "[AVS 3]"],
    },
    {
      address: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5", nodes: 3,
      totalStake: ["225 ETH", "1,500 Eigen", "X Other Tokens"],
      avsRunning: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
      avsActiveSets: ["3", "[AVS 1]", "[AVS 4]", "[AVS 5]"],
    },
    {
      address: "2 Total", nodes: 6,
      totalStake: ["350 ETH", "2,700 Eigen", "X Other Tokens"],
      avsRunning: ["6 Total"],
      avsActiveSets: ["6 Total"]
    }
  ]

  return (
    <Table className="">
      <Tr>
        <Th content="Operators" />
        {stats.map((stat, idx) => (
          <Th content={idx === stats.length - 1 ? stat.address : shortenAddress(stat.address)} />
        ))}
      </Tr>
      <Tr>
        <Th content="Nodes" className="pt-6" />
        {stats.map(stat => (
          <Td content={stat.nodes.toString()} className="pt-6" />
        ))}
      </Tr>
      <Tr>
        <Th content="Total Stake" className="pt-6" />
        {stats.map(stat => (
          <Td className="pt-6">
            {stat.totalStake.map(stake => (
              <div>{stake}</div>
            ))}
          </Td>
        ))}
      </Tr>
      <Tr>
        <Th content="AVS Running" className="pt-6" />
        {stats.map(stat => (
          <Td className="pt-6">
            {stat.avsRunning.map(avs => (
              <div>{avs}</div>
            ))}
          </Td>
        ))}
      </Tr>
      <Tr>
        <Th content="AVS Active Sets" className="pt-6" />
        {stats.map(stat => (
          <Td className="pt-6">
            {stat.avsActiveSets.map(avs => (
              <div>{avs}</div>
            ))}
          </Td>
        ))}
      </Tr>
    </Table>
  );
}
