import React, { useState, useMemo } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Topbar } from '../Topbar';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { apiFetch } from '../../utils';
import { SectionTitle } from '../shared/sectionTitle';
import { Table } from "../shared/table";
import { Td } from "../shared/table/Td";
import { Th } from "../shared/table/Th";
import { Tr } from "../shared/table/Tr";
import { EmptyAddresses } from './EmptyAddress';
import { AvsWidget } from "../shared/avsWidget";
import { sortData } from '../../utils/SortData';

interface ActiveSetOperator {
  name: string;
  organization_id: number;
  public_key: string;
}

interface FilterOption {
  label: string;
  value: string;
}

interface ActiveSetNode {
  node_type: string;
  restaking_protocol: string;
  status: boolean;
  chain: string;
}

type ActiveSetEntry = [ActiveSetOperator, ActiveSetNode[]];

const swrConfig = {
  revalidateOnFocus: true,
  revalidateOnReconnect: false,
  refreshInterval: 0,
  dedupingInterval: 30000,
  errorRetryCount: 3,
  refreshWhenHidden: false,
  refreshWhenOffline: false
};

const fetcher = (url: string) => apiFetch(url, "GET").then(res => res.data);

const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const ActiveSet: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedAddresses, setSelectedAddresses] = useState<Set<string>>(new Set());
  const [tempSelectedAddresses, setTempSelectedAddresses] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc' | 'none'
  }>({
    key: null,
    direction: 'none'
  });

  const location = useLocation();

  const { data: activeSetResponse, error: activeSetError } = useSWR<ActiveSetEntry[]>(
    'avs/active_set',
    fetcher,
    swrConfig
  );

  const flattenedData = useMemo(() => {
    if (!activeSetResponse) return [];

    return activeSetResponse.flatMap(([operator, nodes]) =>
      nodes.map(node => ({
        avs: node.node_type,
        chain: node.chain,
        protocol: node.restaking_protocol,
        addressName: operator.name,
        address: operator.public_key,
        activeSet: node.status,
        operatorId: operator.organization_id
      }))
    );
  }, [activeSetResponse]);

  const filteredData = useMemo(() => {
    let filtered = flattenedData;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(row =>
        selectedFilter === 'eigenlayer'
          ? row.protocol.toLowerCase() === 'eigenlayer'
          : row.protocol.toLowerCase() === 'symbiotic'
      );
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        row.avs.toLowerCase().includes(searchLower)
      );
    }

    if (selectedAddresses.size > 0) {
      filtered = filtered.filter(row => selectedAddresses.has(row.address));
    }

    return sortConfig.key ? sortData(filtered, sortConfig) : filtered;
  }, [flattenedData, selectedFilter, searchTerm, sortConfig, selectedAddresses]);

  const handleModalOpen = () => {
    setTempSelectedAddresses(new Set(selectedAddresses));
    setShowFilterModal(true);
  };

  const handleFilterUpdate = () => {
    setSelectedAddresses(tempSelectedAddresses);
    setShowFilterModal(false);
  };

  const toggleAddress = (address: string) => {
    setTempSelectedAddresses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(address)) {
        newSet.delete(address);
      } else {
        newSet.add(address);
      }
      return newSet;
    });
  };

  if (activeSetError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-semibold text-textWarning">Error loading data</h2>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!activeSetResponse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-semibold text-textPrimary">Loading...</h2>
      </div>
    );
  }

  if (!activeSetResponse || activeSetResponse.length === 0) {
    return (
      <>
        <Topbar title="Active Set Overview" />
        <EmptyAddresses />
      </>
    );
  }

  const filterOptions: FilterOption[] = activeSetResponse ?
    activeSetResponse.map(([operator]) => ({
      label: `${operator.name} | ${formatAddress(operator.public_key)}`,
      value: operator.public_key
    })) : [];

    return (
      <>
        <Topbar title="Active Set Overview" />
        {!location.pathname.includes('/settings') && (
          <>
            <div className="flex justify-between items-center mb-6">
              <SectionTitle title="Active Set Details" className="text-textPrimary" />
              <Link
                to="/activeset/add"
                className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
              >
                Add Address
              </Link>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedFilter('all')}
                  className={`px-4 py-2 rounded-lg ${selectedFilter === 'all' ? 'bg-bgButton text-textPrimary' : 'text-textSecondary hover:bg-textGrey'}`}
                >
                  All AVS ({flattenedData.length})
                </button>
                <button onClick={() => setSelectedFilter('eigenlayer')}
                  className={`px-4 py-2 rounded-lg ${selectedFilter === 'eigenlayer' ? 'bg-bgButton text-textPrimary' : 'text-textSecondary hover:bg-textGrey'}`}
                >
                  EigenLayer ({flattenedData.filter(row => row.protocol.toLowerCase() === 'eigenlayer').length})
                </button>
                <button onClick={() => setSelectedFilter('symbiotic')}
                  className={`px-4 py-2 rounded-lg ${selectedFilter === 'symbiotic' ? 'bg-bgButton text-textPrimary' : 'text-textSecondary hover:bg-textGrey'}`}
                >
                  Symbiotic ({flattenedData.filter(row => row.protocol.toLowerCase() === 'symbiotic').length})
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <input type="text" placeholder="Search AVS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-black bg-opacity-30 rounded-lg text-textPrimary border border-textGrey/20 focus:ring-1 focus:ring-textGrey"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-textGrey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  onClick={handleModalOpen}
                  className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
                >
                  Filter by Address
                </button>
              </div>
            </div>

            <div className="w-full">
              <Table>
                <Tr>
                  <Th content="AVS" sortKey="avs" currentSort={sortConfig} onSort={setSortConfig} />
                  <Th content="Chain" sortKey="chain" currentSort={sortConfig} onSort={setSortConfig} />
                  <Th content="Protocol" sortKey="protocol" currentSort={sortConfig} onSort={setSortConfig} />
                  <Th content="Address Name" sortKey="addressName" currentSort={sortConfig} onSort={setSortConfig} />
                  <Th content="Address" sortKey="address" currentSort={sortConfig} onSort={setSortConfig} />
                  <Th content="Active Set" sortKey="activeSet" currentSort={sortConfig} onSort={setSortConfig} />
                </Tr>
                {filteredData.map((row, index) => (
                  <Tr key={`${row.address}-${row.avs}-${index}`}>
                    <Td><AvsWidget name={row.avs} /></Td>
                    <Td>
                      <div className="text-base text-textSecondary text-left">
                        {row.chain}
                      </div>
                    </Td>
                    <Td>
                      <div className="text-base text-textSecondary text-left">
                        {row.protocol}
                      </div>
                    </Td>
                    <Td>
                      <div className="text-base text-textSecondary text-left">
                        {row.addressName}
                      </div>
                    </Td>
                    <Td>
                      <div className="text-base text-textSecondary text-left">
                        {formatAddress(row.address)}
                      </div>
                    </Td>
                    <Td isChecked={row.activeSet} />
                  </Tr>
                ))}
              </Table>
            </div>

            {showFilterModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-widgetBg rounded-lg p-8 max-w-md w-full relative">
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="absolute top-4 right-4 text-textGrey hover:text-textPrimary"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                  <h2 className="text-2xl font-semibold text-textPrimary mb-6">Filter by Address</h2>
                  <div className="w-full grid gap-2">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => toggleAddress(option.value)}
                        className={`w-full p-3 text-left rounded-lg text-textSecondary border ${
                          tempSelectedAddresses.has(option.value)
                            ? 'border-primary bg-primary/10'
                            : 'border-textGrey/20'
                        } hover:bg-widgetHoverBg`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleFilterUpdate}
                      className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 text-white"
                    >
                      Update Filter
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div className="mt-6">
          <Outlet />
        </div>
      </>
    );
  }
