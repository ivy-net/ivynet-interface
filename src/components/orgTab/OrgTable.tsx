import React from "react";
import { Table } from "../shared/table";
import { Th } from "../shared/table/Th";
import { Tr } from "../shared/table/Tr";
import { shortenAddress } from "../../utils";
import { Td } from "../shared/table/Td";
import { Tag } from "../shared/Tag";
import { Tooltip } from 'react-tooltip';

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
        <Th content="Nodes" className="pt-1" />
        {stats.map(stat => (
          <Td content={stat.nodes.toString()} className="pt-1" />
        ))}
      </Tr>
      <Tr>
        <Th content="Total Stake" className="pt-1" />
        {stats.map(stat => (
          <Td className="pt-1">
            <div className="flex flex-col gap-1">
              {stat.totalStake.map(stake => (
                <Tag label={stake} />
              ))}
            </div>
          </Td>
        ))}
      </Tr>
      <Tr>
        <Th content="AVS Running" className="pt-1" />
        {stats.map((stat, idx) => (
          <Td className="pt-1">
            <div data-tooltip-id={`avs-running-${idx}`} className="w-fit">{stat.avsRunning[0]}</div>
            {stat.avsRunning.length > 1 && <Tooltip id={`avs-running-${idx}`} place="bottom" >
              <div className="flex flex-col gap-1">
                {stat.avsRunning.slice(1).map(avs => (
                  <Tag label={avs} />
                ))}
              </div>
            </Tooltip>}
          </Td>
        ))}
      </Tr>
      <Tr>
        <Th content="AVS Active Sets" className="pt-1" />
        {stats.map((stat, idx) => (
          <Td className="pt-1">
            <div data-tooltip-id={`avs-active-sets-${idx}`} className="w-fit">{stat.avsRunning[0]}</div>
            {stat.avsActiveSets.length > 1 && <Tooltip id={`avs-active-sets-${idx}`} place="bottom" >
              <div className="flex flex-col gap-1">
                {stat.avsActiveSets.slice(1).map(avs => (
                  <Tag label={avs} />
                ))}
              </div>
            </Tooltip>}
          </Td>
        ))}
      </Tr>
    </Table>
  );
}
