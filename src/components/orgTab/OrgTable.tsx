import React from "react";
import { Table } from "../shared/table";
import { Th } from "../shared/table/Th";
import { Tr } from "../shared/table/Tr";
import { shortenAddress } from "../../utils";
import { Td } from "../shared/table/Td";
import { Tag } from "../shared/Tag";
import { Tooltip } from 'react-tooltip';

interface OrgTableProps {
  stats: any[];
}

export const OrgTable: React.FC<OrgTableProps> = ({ stats }) => {



  return (
    <Table className="block overflow-x-auto">
      <Tr>
        <Th className="min-w-[250px] pt-1" content="Operators" />
        {stats.map((stat) => (
          <Th className="min-w-[250px] pt-1" key={stat.address} content={shortenAddress(stat.address)} />
        ))}
      </Tr>
      <Tr>
        <Th className="min-w-[250px] pt-1" content="Nodes" />
        {stats.map(stat => (
          <Td className="min-w-[250px] pt-1" key={stat.address} content={stat.nodes.toString()} />
        ))}
      </Tr>
      <Tr>
        <Th className="min-w-[250px] pt-1" content="Total Stake" />
        {stats.map(stat => (
          <Td className="min-w-[250px] pt-1" key={stat.address}>
            <div className="flex flex-col gap-2">
              {stat.totalStake.length > 2 ? (
                <>
                  <Tag label={stat.totalStake[0]} />
                  <div data-tooltip-id={`total-stake-${stat.address}`} className="w-fit">
                    <Tag label={`+${stat.totalStake.length - 1} Tokens`} to="" />
                  </div>
                  <Tooltip id={`total-stake-${stat.address}`} place="bottom" openOnClick={true} className="!bg-textGrey" >
                    <div className="flex flex-col gap-1">
                      {stat.totalStake.slice(1).map((stake: string, idx: number) => (
                        <Tag key={idx} label={stake} />
                      ))}
                    </div>
                  </Tooltip>
                </>
              ) :
                (stat.totalStake.map((stake: string, idx: number) => (
                  <Tag key={idx} label={stake} />
                )))
              }

            </div>
          </Td>
        ))}
      </Tr>
      <Tr>
        <Th className="min-w-[250px] pt-1" content="AVS Running" />
        {stats.map((stat, idx) => (
          <Td className="min-w-[250px] pt-1" key={stat.address}>
            <div data-tooltip-id={`avs-running-${idx}`} className="w-fit">
              <Tag label={`${stat.avsRunning[0]} AVS`} to="" />
            </div>
            {stat.avsRunning.length > 1 &&
              <Tooltip id={`avs-running-${idx}`} place="bottom" className="!bg-textGrey" openOnClick={true} >
                <div className="flex flex-col gap-1">
                  {stat.avsRunning.slice(1).map((avs: string, idx: number) => (
                    <Tag key={idx} label={avs} />
                  ))}
                </div>
              </Tooltip>}
          </Td>
        ))}
      </Tr>
      <Tr>
        <Th className="min-w-[250px] pt-1" content="AVS Active Sets" />
        {stats.map((stat, idx) => (
          <Td className="min-w-[250px] pt-1" key={stat.address}>
            <div data-tooltip-id={`avs-active-sets-${idx}`} className="w-fit">
              <Tag label={`${stat.avsActiveSets[0]} AVS`} to="" />
            </div>
            {stat.avsActiveSets.length > 1 &&
              <Tooltip id={`avs-active-sets-${idx}`} place="bottom" className="!bg-textGrey" openOnClick={true} >
                <div className="flex flex-col gap-1">
                  {stat.avsActiveSets.slice(1).map((avs: string, idx: number) => (
                    <Tag key={idx} label={avs} />
                  ))}
                </div>
              </Tooltip>}
          </Td>
        ))}
      </Tr>
    </Table>
  );
}
