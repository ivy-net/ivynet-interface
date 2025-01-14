import React, { useState, useMemo } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Topbar } from '../Topbar';
import { Table } from '../shared/table';
import { Td } from '../shared/table/Td';
import { Th } from '../shared/table/Th';
import { Tr } from '../shared/table/Tr';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { apiFetch } from '../../utils';
import { ConsolidatedMachine, Metric } from '../../interfaces/responses';

const formatMetricValue = (metric: Metric): string => {
  if (!metric || metric.value === null || metric.value === undefined) {
    return 'N/A';
  }

  const value = Number(metric.value);
  if (isNaN(value)) {
    return 'Invalid';
  }

  switch(metric.name) {
    case 'ram_usage':
    case 'free_ram':
    case 'disk_usage':
    case 'free_disk':
      return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    case 'cpu_usage':
      return `${value.toFixed(2)}%`;
    case 'uptime':
      return `${Math.floor(value / 3600)} hours`;
    default:
      return Number.isInteger(value) ? value.toString() : value.toFixed(3);
  }
};

const formatAttributeTags = (metric: Metric): string[] => {
  if (!metric.attributes) {
    return metric.avs_name ? [] : ['machine'];
  }

  return Object.entries(metric.attributes).map(([key, value]) => `${value}`);
};

const fetcher = (url: string) => apiFetch(url, "GET");

export const AvsTab: React.FC = () => {
  const [selectedAvs, setSelectedAvs] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
//  const [refreshCount, setRefreshCount] = useState(0);
//  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [avsSearchTerm, setAvsSearchTerm] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);  const [includeNullAttributes, setIncludeNullAttributes] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | 'none' }>({
    key: null,
    direction: 'none'
  });

  const { data: machinesData } = useSWR<{ data: ConsolidatedMachine[] }>(
    'machine',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshInterval: 0,
      errorRetryCount: 3,
      onError: () => {
        toast.error('Error loading machines data', { theme: "dark" });
      }
    }
  );

  const handleDownloadCSV = () => {
    if (!filteredMetrics.length) return;

    // Create CSV content
    const headers = ['AVS Name', 'Chain', 'Metric Type', 'Metric', 'Value', 'Attributes'];
    const rows = filteredMetrics.map(metric => [
      selectedAvs,
      getSelectedAvsChain(),
      metric.avs_name ? 'avs' : 'machine',
      metric.name,
      formatMetricValue(metric),
      formatAttributeTags(metric).join(', ')
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell =>
        `"${String(cell).replace(/"/g, '""')}"`
      ).join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedAvs}_metrics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const availableAvs = useMemo(() => {
    if (!machinesData?.data) return [] as string[];
    const uniqueAvs = machinesData.data
      .flatMap(machine => machine.avs_list.map(avs => avs.avs_name))
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    return uniqueAvs as string[];
  }, [machinesData]);

  const getSelectedAvsChain = () => {
    const selectedAvsInfo = machinesData?.data
      ?.find(m => m.avs_list.some(a => a.avs_name === selectedAvs))
      ?.avs_list.find(a => a.avs_name === selectedAvs);
    return selectedAvsInfo?.chain || 'Unknown';
  };

//  const uniqueMetricNames = useMemo(() => {
//    const uniqueNames = new Set<string>();
//    metrics.forEach(metric => {
//      if (metric.name) {
//        uniqueNames.add(metric.name);
//      }
//    });
//    return Array.from(uniqueNames).sort();
//  }, [metrics]);

  const uniqueAttributeValues = useMemo(() => {
    const uniqueValues = new Set<string>();

    // Only add 'machine' if there are metrics without avs_name
    if (metrics.some(metric => !metric.avs_name)) {
      uniqueValues.add('machine');
    }

    metrics.forEach(metric => {
      if (metric.attributes) {
        Object.values(metric.attributes).forEach(value => {
          if (value) uniqueValues.add(value.toString());
        });
      }
    });
    return Array.from(uniqueValues).sort();
  }, [metrics]);

  const filteredMetrics = useMemo(() => {
    if (!metrics.length) return [];

    return metrics.filter(metric => {
      const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAttributeFilter = selectedAttributes.length === 0 ||
        (metric.attributes && Object.values(metric.attributes).some(value =>
          value && selectedAttributes.includes(value.toString())
        ));

      const matchesNullFilter = (
        (!metric.avs_name && !metric.attributes) ||
        (metric.attributes !== null) ||
        (includeNullAttributes)
      );

      return matchesSearch && matchesAttributeFilter && matchesNullFilter;
    });
  }, [metrics, searchTerm, selectedAttributes, includeNullAttributes]);


  const handleSort = (newSort: { key: string; direction: 'asc' | 'desc' | 'none' }) => {
    setSortConfig(newSort);
  };

//  const handleRefresh = async () => {
//    const now = Date.now();
//    if (now - lastRefreshTime < 60000) {
//      if (refreshCount >= 3) {
//        toast.warning('Refresh limit reached. Please wait.', { theme: "dark" });
//        return;
//      }
//      setRefreshCount(prev => prev + 1);
//    } else {
//      setRefreshCount(1);
 //     setLastRefreshTime(now);
//    }

//    if (selectedAvs) {
//      await fetchMetrics(selectedAvs);
//    }
//  };

  const fetchMetrics = async (avsName: string) => {
    try {
      const machineId = machinesData?.data.find(m =>
        m.avs_list.some(a => a.avs_name === avsName)
      )?.machine_id;

      if (!machineId) {
        throw new Error('Machine ID not found');
      }

      const response = await apiFetch(`machine/${machineId}/metrics/all?avs_name=${avsName}`, 'GET');
      if (response.data) {
        setMetrics(response.data);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Error fetching metrics';
      toast.error(errorMsg, { theme: "dark", toastId: errorMsg });
      setMetrics([]);
    }
  };

  const sortedMetrics = useMemo(() => {
    if (!sortConfig.key || sortConfig.direction === 'none') return filteredMetrics;

    return [...filteredMetrics].sort((a, b) => {
      let aValue = '';  // Removed explicit ': string'
      let bValue = '';  // Removed explicit ': string'

      if (sortConfig.key === 'metric_type') {
        aValue = a.avs_name ? 'avs' : 'machine';
        bValue = b.avs_name ? 'avs' : 'machine';
      } else if (sortConfig.key === 'name') {
        aValue = a.name || '';
        bValue = b.name || '';
      } else {
        const aField = a[sortConfig.key as keyof Metric];
        const bField = b[sortConfig.key as keyof Metric];

        // Handle different types of fields
        if (aField === null || aField === undefined) {
          aValue = '';
        } else if (typeof aField === 'object') {
          aValue = JSON.stringify(aField);
        } else {
          aValue = String(aField);
        }

        if (bField === null || bField === undefined) {
          bValue = '';
        } else if (typeof bField === 'object') {
          bValue = JSON.stringify(bField);
        } else {
          bValue = String(bField);
        }
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredMetrics, sortConfig]);

  const formatTimestamp = (timestamp: string) => {
    try {
      // Force parse as UTC by appending Z
      const date = new Date(timestamp + 'Z');
      return date.toISOString().split('.')[0].replace('T', ' ') + ' UTC';
    } catch (error) {
      console.error('Timestamp error:', error);
      return 'N/A';
    }
  };

  return (
    <>
      <Topbar title="Metrics Overview" />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-textPrimary">
          {selectedAvs
            ? `${selectedAvs} Metrics on ${getSelectedAvsChain()} as of ${formatTimestamp(metrics[0]?.created_at || '')}`
            : 'AVS Metrics Snapshot'
          }
        </h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search metrics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-lg bg-black bg-opacity-30 text-textPrimary"
          />
          {selectedAvs && (
            <button
              onClick={() => setSelectedAvs(null)}
              className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
            >
              Switch AVS
            </button>
          )}
          <button
            onClick={() => setShowFilterModal(true)}
            className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
          >
            Filter
          </button>
          {selectedAvs && (
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
            >
              Download
            </button>
          )}
          <Link to="add" relative="path">
            <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary">
              Add Metrics
            </div>
          </Link>
        </div>
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
      <h2 className="text-2xl font-semibold text-textPrimary mb-6">Filter by Attributes</h2>
      <div className="mb-4">
        <label className="flex items-center text-textSecondary mb-2">
          <input
            type="checkbox"
            checked={includeNullAttributes}
            onChange={(e) => setIncludeNullAttributes(e.target.checked)}
            className="mr-2"
          />
          Show metrics with null attributes
        </label>
      </div>
      <div className="w-full grid gap-2 max-h-[60vh] overflow-y-auto pr-2">
        {uniqueAttributeValues.map(attribute => (
          <button
            key={attribute}
            onClick={() => {
              setSelectedAttributes(current =>
                current.includes(attribute)
                  ? current.filter(a => a !== attribute)
                  : [...current, attribute]
              );
            }}
            className={`w-full p-3 text-left rounded-lg text-textSecondary border border-textGrey/20 ${
              selectedAttributes.includes(attribute) ? 'bg-bgButton' : 'hover:bg-widgetHoverBg'
            }`}
          >
            {attribute}
          </button>
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={() => {
            setSelectedAttributes([]);
            setIncludeNullAttributes(false);
          }}
          className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
        >
          Reset
        </button>
        <button
          onClick={() => setShowFilterModal(false)}
          className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
)}

      {!selectedAvs ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] max-w-md mx-auto bg-widgetBg rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-textPrimary mb-6">Select an AVS to view metrics</h2>
          <div className="relative w-full mb-4">
            <input
              type="text"
              placeholder="Search AVS..."
              value={avsSearchTerm}
              onChange={(e) => setAvsSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black bg-opacity-30 rounded-lg text-textPrimary border border-textGrey/20 focus:ring-1 focus:ring-textGrey"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-textGrey"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="w-full grid gap-2">
            {availableAvs
              .filter(avs => avs.toLowerCase().includes(avsSearchTerm.toLowerCase()))
              .map(avs => (
                <button
                  key={avs}
                  onClick={() => {
                    setSelectedAvs(avs);
                    fetchMetrics(avs);
                  }}
                  className="w-full p-3 text-left hover:bg-widgetHoverBg rounded-lg text-textSecondary border border-textGrey/20"
                >
                  {avs}
                </button>
              ))}
          </div>
        </div>

      ) : filteredMetrics.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-widgetBg rounded-lg p-8">
          <h2 className="text-xl font-semibold text-textPrimary mb-4">No metrics available for {selectedAvs}</h2>
          <p className="text-textSecondary mb-6">Try adding metrics with one of our scripts!</p>
          <Link to="edit/keys" relative="path">
            <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary">
              Add Metrics
            </div>
          </Link>
        </div>
      ) : (
        <Table>
          <Tr>
            <Th content="AVS Name" />
            <Th content="Chain" />
            <Th
              content="Metric Type"
              sortKey="metric_type"
              currentSort={sortConfig}
              onSort={handleSort}
            />
            <Th
              content="Metric"
              sortKey="name"
              currentSort={sortConfig}
              onSort={handleSort}
            />
            <Th content="Value" />
            <Th content="Attributes" />
          </Tr>
          {sortedMetrics.map((metric, index) => {
            const chain = getSelectedAvsChain();
            const attributeTags = formatAttributeTags(metric);

            return (
              <Tr key={`${metric.machine_id}-${metric.name}-${index}`}>
                <Td content={selectedAvs} />
                <Td content={chain} />
                <Td content={metric.avs_name ? 'avs' : 'machine'} />
                <Td content={metric.name} />
                <Td content={formatMetricValue(metric)} className="text-right" />
                <Td>
                  <div className="flex flex-wrap gap-2">
                    {attributeTags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 text-sm rounded-full bg-bgButton text-textSecondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Table>
      )}
      <Outlet />
      </>
  );
};
