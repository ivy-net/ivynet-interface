import React from 'react';
import { Link } from 'react-router-dom';
import { SectionTitle } from "../shared/sectionTitle";
import { Topbar } from "../Topbar";
import { AVS } from "../../interfaces/responses";
import { WidgetItem } from "../shared/machinesWidget/widgetItem";
import useSWR from 'swr';
import { apiFetch } from "../../utils";
import { AxiosResponse } from "axios";
import { ethers } from 'ethers';
import { useEffect, useState, useMemo } from 'react';
import { EmptyAddresses } from "./EmptyAddresses";

// Contract constants
const DELEGATION_MANAGER_PROXY = '0x39053D51B77DC0d36036Fc1fCc8Cb819df8Ef37A';
const BEACON_CHAIN_STRATEGY = '0xbeac0eeeeeeeeeeeeeeeeeeeeeeeeeeeeeebeac0';
const DELEGATION_MANAGER_ABI = [
  "function operatorShares(address, address) external view returns (uint256)"
];

interface OrgTabProps { }

interface PubKeyData {
  public_key: string;
  name: string;
}

const OrgTab: React.FC<OrgTabProps> = () => {
  const [operatorStakes, setOperatorStakes] = useState<{ [key: string]: string }>({});

  // Fetch AVS data
  const { data: avsResponse } = useSWR<AxiosResponse<AVS[]>>(
    'avs',
    () => apiFetch('avs', 'GET')
  );

  // Fetch operator addresses from pubkey endpoint
  const { data: pubkeysResponse } = useSWR<AxiosResponse<PubKeyData[]>>(
    'pubkey',
    () => apiFetch('pubkey', 'GET')
  );

  const avs = avsResponse?.data;
  const pubkeys = pubkeysResponse?.data;

  // Memoize uniqueOperators array
  const uniqueOperators = useMemo(() => {
    if (!pubkeys) return [];
    return Array.from(new Set(pubkeys.map(item => item.public_key)));
  }, [pubkeys]);

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

  const getOperatorName = (operatorAddress: string) => {
    const pubkeyData = pubkeys?.find(item => item.public_key === operatorAddress);
    return pubkeyData?.name || '';
  };

  return (
    <>
      <Topbar title="Address Overview" />
      {uniqueOperators.length === 0 ? (
        <EmptyAddresses />
      ) : (
        <>
          <SectionTitle title="Global Stats" className="text-textPrimary" />
          <div className="grid grid-cols-4 gap-4">
            <WidgetItem title="AVS Nodes" description={`${avs?.length ?? 0}`} to="/nodes" />
            <WidgetItem title="Machines" description={`${new Set(avs?.map((a: AVS) => a.machine_id)).size ?? 0}`} />
            <WidgetItem title="Addresses" description={`${uniqueOperators.length}`} connected={true} />
            <WidgetItem title="Active Set" description={`${avs?.filter((item: AVS) => item.active_set === true).length ?? 0}`} to="/nodes?filter=active" connected={true} />
          </div>

          <div className="flex items-center justify-between">
            <SectionTitle title="Per Operator Address" className="text-textPrimary" />
            <Link to="/nodes/edit/keys">
              <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary">
                Add Address
              </div>
            </Link>
          </div>

          <div className="bg-widgetBg rounded-lg p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-textSecondary bg-contentBg rounded-l-lg">
                      Addresses
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-textSecondary bg-contentBg">
                      Address Name
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
                      <td className="px-6 py-4 text-textPrimary">
                        {getOperatorName(operator)}
                      </td>
                      <td className="px-6 py-4 text-textPrimary">
                        {parseFloat(operatorStakes[operator] || '0').toFixed(2)} ETH
                      </td>
                      <td className="px-6 py-4 text-textPrimary">
                        {getOperatorStats(operator).totalAvs}
                      </td>
                      <td className="px-6 py-4 text-textPrimary">
                        {getOperatorStats(operator).activeSetCount}
                      </td>
                      <td className="px-6 py-4 text-textPrimary">
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
