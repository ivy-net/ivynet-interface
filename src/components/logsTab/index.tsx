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
import { AVSInfo } from '../../interfaces/responses';

interface LogEntry {
  created_at: string;
  log_level: string;
  log: string;
}

const fetcher = (url: string) => apiFetch(url, "GET");

const formatTimestamp = (timestamp: string): string => {
  try {
    // Handle Unix timestamp in milliseconds or seconds
    const timestampNum = parseInt(timestamp);
    if (!isNaN(timestampNum)) {
      // If timestamp is in seconds, convert to milliseconds
      const milliseconds = timestampNum.toString().length === 10 ? timestampNum * 1000 : timestampNum;
      const date = new Date(milliseconds);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[1].slice(0, 8) + ' UTC';
      }
    }
    
    // Try parsing as ISO string if not a timestamp
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[1].slice(0, 8) + ' UTC';
    }
    return 'Invalid Date';
  } catch (error) {
    console.error('Timestamp error:', error);
    return 'N/A';
  }
};

export const LogsTab: React.FC = () => {
  const [selectedAvs, setSelectedAvs] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedLogLevels, setSelectedLogLevels] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | 'none' }>({
    key: null,
    direction: 'none'
  });

  const { data: machinesData, mutate: mutateMachines } = useSWR<{ data: any[] }>(
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

  const availableAvs = useMemo(() => {
    if (!machinesData?.data) return [] as string[];
    const uniqueAvs = machinesData.data
      .flatMap(machine => machine.avs_list.map((avs: AVSInfo) => avs.avs_name))
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    return uniqueAvs as string[];
  }, [machinesData]);

  const uniqueLogLevels = useMemo(() => {
    const uniqueLevels: { [key: string]: boolean } = {};
    logs.forEach(log => {
      if (log.log_level) {
        uniqueLevels[log.log_level] = true;
      }
    });
    return Object.keys(uniqueLevels).sort();
  }, [logs]);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

 /* eslint-disable no-control-regex */
  const cleanLogText = (log: string): string => {
    return log
      .replace(/\x1B\[\d+m/g, '')  // Remove color codes
      .replace(/\x1B\[(?:\d+[A-Za-z]|\d+;\d+[A-Za-z])/g, '')  // Remove ANSI escape sequences
      .replace(/^[A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\.\d{3}\s+/g, '') // Remove timestamp like "Jan 6 14:25:08.305"
      .trim();
  };
  /* eslint-enable no-control-regex */

  const consolidateLogsByTimestamp = (logs: LogEntry[]): LogEntry[] => {
    const consolidated: { [key: string]: LogEntry } = {};
    
    logs.forEach(log => {
      const timestamp = log.created_at;
      const cleanedLog = cleanLogText(log.log);
      
      if (consolidated[timestamp]) {
        consolidated[timestamp].log = `${consolidated[timestamp].log}\n\n${cleanedLog}`;
      } else {
        consolidated[timestamp] = { ...log, log: cleanedLog };
      }
    });
    
    return Object.values(consolidated);
  };

  const filteredAndSortedLogs = useMemo(() => {
    // Filter out null, empty, or undefined logs
    let filtered = logs.filter(log => 
      log && 
      log.log && 
      log.log.trim() !== '' && 
      log.log_level && 
      log.created_at
    );

    // Consolidate logs with same timestamp
    filtered = consolidateLogsByTimestamp(filtered);

    // Apply log level filters
    if (selectedLogLevels.length > 0) {
      filtered = filtered.filter(log => selectedLogLevels.includes(log.log_level));
    }

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.log.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof LogEntry];
        const bValue = b[sortConfig.key as keyof LogEntry];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [logs, selectedLogLevels, searchTerm, sortConfig]);

  const handleRefresh = async () => {
    const now = Date.now();
    if (now - lastRefreshTime < 60000) {
      if (refreshCount >= 3) {
        toast.warning('Refresh limit reached. Please wait.', { theme: "dark" });
        return;
      }
      setRefreshCount(prev => prev + 1);
    } else {
      setRefreshCount(1);
      setLastRefreshTime(now);
    }

    if (selectedAvs) {
      await fetchLogs(selectedAvs);
    }
  };

  const fetchLogs = async (avsName: string) => {
    try {
      const machineId = machinesData?.data.find(m => 
        m.avs_list.some((a: AVSInfo) => a.avs_name === avsName)
      )?.machine_id;
      
      if (!machineId) {
        throw new Error('Machine ID not found');
      }

      const response = await apiFetch(`machine/${machineId}/logs?avs_name=${avsName}`, 'GET');
      if (response.data) {
        setLogs(response.data);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Error fetching logs';
      toast.error(errorMsg, { theme: "dark", toastId: errorMsg });
      setLogs([]);
    }
  };

  const getSelectedAvsChain = () => {
    const selectedAvsInfo = machinesData?.data
      ?.find(m => m.avs_list.some((a: AVSInfo) => a.avs_name === selectedAvs))
      ?.avs_list.find((a: AVSInfo) => a.avs_name === selectedAvs);
    return selectedAvsInfo?.chain || 'Unknown';
  };

  return (
    <>
      <Topbar title="Logs Overview" />
      
      <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-textPrimary">
          {selectedAvs 
            ? `${selectedAvs} Metrics on ${getSelectedAvsChain()} as of ${formatTimestamp(Math.max(...logs.map(log => new Date(log.created_at).getTime())).toString())}`
            : 'AVS Logs Snapshot'
          }
        </h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search logs..."
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
            Filter Logs
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
          >
            Refresh
          </button>
        </div>
      </div>

      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-widgetBg rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-semibold text-textPrimary mb-6">Filter by Log Type</h2>
            <div className="w-full grid gap-2">
              {uniqueLogLevels.map(level => (
                <button
                  key={level}
                  onClick={() => {
                    setSelectedLogLevels(current =>
                      current.includes(level)
                        ? current.filter(l => l !== level)
                        : [...current, level]
                    );
                  }}
                  className={`w-full p-3 text-left rounded-lg text-textSecondary border border-textGrey/20 ${
                    selectedLogLevels.includes(level) ? 'bg-bgButton' : 'hover:bg-widgetHoverBg'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
              >
                Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {!selectedAvs ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] max-w-md mx-auto bg-widgetBg rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-textPrimary mb-6">Select an AVS to view logs</h2>
          <div className="w-full grid gap-2">
            {availableAvs.map(avs => (
              <button
                key={avs}
                onClick={() => {
                  setSelectedAvs(avs);
                  fetchLogs(avs);
                }}
                className="w-full p-3 text-left hover:bg-widgetHoverBg rounded-lg text-textSecondary border border-textGrey/20"
              >
                {avs}
              </button>
            ))}
          </div>
        </div>
      ) : filteredAndSortedLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-widgetBg rounded-lg p-8">
          <h2 className="text-xl font-semibold text-textPrimary mb-4">No logs available for {selectedAvs}</h2>
          <p className="text-textSecondary">Try refreshing or adjusting your filters</p>
        </div>
      ) : (
        <Table>
          <Tr>
            <Th
              content="Created At"
              sortKey="created_at"
              currentSort={sortConfig}
              onSort={() => handleSort('created_at')}
              className="text-base w-[200px] whitespace-nowrap"
            />
            <Th
              content="Type"
              sortKey="log_level"
              currentSort={sortConfig}
              onSort={() => handleSort('log_level')}
              className="text-base w-[100px] whitespace-nowrap ml-8"
            />
            <Th content="Log" className="text-base pl-4" />
          </Tr>
          {filteredAndSortedLogs.map((log, index) => (
            <Tr key={`${log.created_at}-${index}`}>
              <Td 
                content={formatTimestamp(log.created_at)} 
                className="text-xl whitespace-nowrap align-top" 
              />
              <Td 
                content={log.log_level} 
                className="text-xl whitespace-nowrap ml-8 align-top" 
              />
              <Td 
                content={log.log} 
                className="text-xl pl-4 whitespace-pre-line" 
              />
            </Tr>
          ))}
        </Table>
      )}
      <Outlet />
    </>
  );
};