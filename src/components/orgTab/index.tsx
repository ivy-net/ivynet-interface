import { SearchBar } from "../shared/searchBar";
import { SectionTitle } from "../shared/sectionTitle";
import { Topbar } from "../Topbar";
import { MachinesStatus, NodeDetail, AVS } from "../../interfaces/responses";
import { WidgetItem } from "../shared/machinesWidget/widgetItem";
import useSWR from 'swr';
import { apiFetch } from "../../utils";
import { AxiosResponse } from "axios";
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { EmptyAddresses } from "./EmptyAddresses";

// Contract constants
const DELEGATION_MANAGER_PROXY = '0x39053D51B77DC0d36036Fc1fCc8Cb819df8Ef37A';
const BEACON_CHAIN_STRATEGY = '0xbeac0eeeeeeeeeeeeeeeeeeeeeeeeeeeeeebeac0';
const DELEGATION_MANAGER_ABI = [
  "function operatorShares(address, address) external view returns (uint256)"
];

interface OrgTabProps { }

export const OrgTab: React.FC<OrgTabProps> = () => {
  const [operatorStakes, setOperatorStakes] = useState<{ [key: string]: string }>({});

  const { data: avsResponse } = useSWR<AxiosResponse<AVS[]>>(
    'avs',
    () => apiFetch('avs', 'GET')
  );

  const avs = avsResponse?.data;

  const uniqueOperators = avs
    ? Array.from(new Set(avs.map(item => item.operator_address).filter((addr): addr is string => addr !== null)))
    : [];

  // Fetch operator stakes
  useEffect(() => {
    const fetchOperatorStakes = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/NTeIGRth7IO40hRthWgDID66gfOdXFQv`);
        const delegationManager = new ethers.Contract(
          DELEGATION_MANAGER_PROXY,
          DELEGATION_MANAGER_ABI,
          provider
        );

        const stakes: { [key: string]: string } = {};

        await Promise.all(
          uniqueOperators.map(async (operator) => {
            try {
              const beaconShares = await delegationManager.operatorShares(
                operator,
                BEACON_CHAIN_STRATEGY
              );
              stakes[operator] = ethers.formatEther(beaconShares);
            } catch (error) {
              console.error(`Error fetching stake for ${operator}:`, error);
              stakes[operator] = '0';
            }
          })
        );

        setOperatorStakes(stakes);
      } catch (error) {
        console.error('Error fetching operator stakes:', error);
      }
    };

    if (uniqueOperators.length > 0) {
      fetchOperatorStakes();
    }
  }, [uniqueOperators]);

  const getOperatorStats = (operatorAddress: string) => {
    const operatorAvs = avs?.filter(a => a.operator_address === operatorAddress) ?? [];
    return {
      totalAvs: operatorAvs.length,
      activeSetCount: operatorAvs.filter(a => a.active_set).length,
      errorCount: operatorAvs.filter(a => a.errors?.length > 0).length
    };
  };

  return (
    <>
      <Topbar title="Overview" />
      {uniqueOperators.length === 0 ? (
        <EmptyAddresses />
      ) : (
        <>
          <SectionTitle title="Global Stats" className="text-textPrimary" />
          <div className="grid grid-cols-4 gap-4">
            <WidgetItem
              title="Machines"
              description={`${new Set(avs?.map((a: AVS) => a.machine_id)).size ?? 0}`}
              to="/machines"
            />
            <WidgetItem
              title="AVS Nodes"
              description={`${avs?.length ?? 0}`}
              to="/machines"
            />
            <WidgetItem
              title="Active Set"
              description={`${avs?.filter((item: AVS) => item.active_set === true).length ?? 0}`}
              to="/machines"
              connected={true}
            />
            <WidgetItem
              title="Operator Addresses"
              description={`${uniqueOperators.length}`}
              connected={true}
            />
          </div>
          <SectionTitle title="Per Operator Address" className="text-textPrimary" />
          <div className="bg-widgetBg rounded-lg p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-textSecondary bg-contentBg rounded-l-lg">
                      Addresses
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-textSecondary bg-contentBg">
                      Delegated ETH
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-textSecondary bg-contentBg">
                      Total AVS
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-textSecondary bg-contentBg">
                      Active Set Count
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-textSecondary bg-contentBg">
                      AVS with Errors
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-textGrey">
                  {uniqueOperators.map((operator) => (
                    <tr key={operator}>
                      <td className="px-6 py-4 font-medium text-textSecondary">
                        {operator.slice(0, 6)}...{operator.slice(-4)}
                      </td>
                      <td className="px-6 py-4 text-textPrimary text-center">
                        {parseFloat(operatorStakes[operator] || '0').toFixed(2)} ETH
                      </td>
                      <td className="px-6 py-4 text-textPrimary text-center">
                        {getOperatorStats(operator).totalAvs}
                      </td>
                      <td className="px-6 py-4 text-textPrimary text-center">
                        {getOperatorStats(operator).activeSetCount}
                      </td>
                      <td className="px-6 py-4 text-textPrimary text-center">
                        <span className="mr-2">
                          {getOperatorStats(operator).errorCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default OrgTab;
