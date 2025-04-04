import React, { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
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

const formatTimestamp = (timestamp: string) => {
  try {
    // Handle Unix timestamp in milliseconds or seconds
    const timestampNum = parseInt(timestamp);
    let updateTimeUTC;

    if (!isNaN(timestampNum)) {
      // If timestamp is in seconds, convert to milliseconds
      const milliseconds = timestampNum.toString().length === 10 ? timestampNum * 1000 : timestampNum;
      updateTimeUTC = new Date(milliseconds);
    } else {
      // Try parsing as ISO string if not a timestamp
      updateTimeUTC = new Date(timestamp + 'Z');
    }

    if (isNaN(updateTimeUTC.getTime())) {
      throw new Error('Invalid date');
    }

    // Get current UTC time
    const nowUTC = new Date();
    const nowUTCMs = Date.UTC(
      nowUTC.getUTCFullYear(),
      nowUTC.getUTCMonth(),
      nowUTC.getUTCDate(),
      nowUTC.getUTCHours(),
      nowUTC.getUTCMinutes(),
      nowUTC.getUTCSeconds()
    );

    // Calculate the time difference in milliseconds
    const diffMs = nowUTCMs - updateTimeUTC.getTime();

    // Convert time differences to various units
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Create human-readable time difference
    let timeAgo;
    if (diffMinutes < 1) {
      timeAgo = '< 1 Mn Ago';
    } else if (diffMinutes < 60) {
      timeAgo = `${diffMinutes} ${diffMinutes === 1 ? 'Mn' : 'Mn'} Ago`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} ${diffHours === 1 ? 'Hr' : 'Hrs'} Ago`;
    } else {
      timeAgo = `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'} Ago`;
    }

    // Determine text color class based on time difference
    let textColorClass = 'text-positive';
    if (diffMinutes >= 60) {
      textColorClass = 'text-textWarning';
    } else if (diffMinutes >= 15) {
      textColorClass = 'text-ivygrey';
    }

    // Format exact UTC time
    const exactTime = updateTimeUTC
      .toISOString()
      .split('.')[0]
      .replace('T', ' ') + ' UTC';

    return {
      timeAgo,
      textColorClass,
      exactTime
    };
  } catch (error) {
    console.error('Timestamp error:', error);
    return {
      timeAgo: 'N/A',
      textColorClass: 'text-textWarning',
      exactTime: 'N/A'
    };
  }
};

export const LogsTab: React.FC = () => {
  const [selectedAvs, setSelectedAvs] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [avsSearchTerm, setAvsSearchTerm] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedLogLevels, setSelectedLogLevels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | 'none' }>({
    key: 'created_at',
    direction: 'desc'
  });

  const { data: machinesData } = useSWR<{ data: any[] }>(
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
    if (!machinesData?.data) return [];
    return machinesData.data.flatMap(machine =>
      machine.avs_list.map((avs: AVSInfo) => ({
        avs_name: avs.avs_name,
        machine_name: machine.name
      }))
    ).sort((a, b) => a.avs_name.localeCompare(b.avs_name));
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

  const handleDownloadCSV = () => {
    const headers = ['Timestamp', 'Type', 'Log'];
    const rows = filteredAndSortedLogs.map(log => [
      formatTimestamp(log.created_at).exactTime,  // Update here
      log.log_level,
      log.log.replace(/[\n\r]+/g, ' ')
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell =>
        // Escape quotes and wrap in quotes if contains comma
        `"${String(cell).replace(/"/g, '""')}"`
      ).join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedAvs}_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* eslint-disable no-control-regex */
  const cleanLogText = (log: string): string => {
    return log
      // Remove ANSI color codes and escape sequences
      .replace(/\x1B\[\d+m/g, '')
      .replace(/\x1B\[(?:\d+[A-Za-z]|\d+;\d+[A-Za-z])/g, '')
      .replace(/\[2m|\[0m/g, '')  // Remove specific color codes like [2m and [0m

      // Remove various timestamp formats
      .replace(/^<\d+>[\d-]+T[\d:.]+Z\s+/g, '')  // Remove <1>2025-01-06T14:24:21.010Z format
      .replace(/^[\d-]+T[\d:.]+Z\s+/g, '')  // Remove ISO timestamp
      .replace(/^(?:[A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\.\d{3}\s+)/g, '')  // Remove Jan 10 00:10:48.046 format
      .replace(/^\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2}\s+/g, '')  // Remove 2025/01/07 12:15:00 format

      // Clean up any leftover spaces and trim
      .replace(/\s+/g, ' ')
      .trim();
  };
  /* eslint-enable no-control-regex */

//  const consolidateLogsByTimestamp = (logs: LogEntry[]): LogEntry[] => {
//    const consolidated: { [key: string]: LogEntry } = {};

 //   logs.forEach(log => {
 //     const timestamp = log.created_at;
 //     const cleanedLog = cleanLogText(log.log);

 //     if (consolidated[timestamp]) {
 //       consolidated[timestamp].log = `${consolidated[timestamp].log}\n\n${cleanedLog}`;
 //     } else {
 //       consolidated[timestamp] = { ...log, log: cleanedLog };
 //     }
 //   });

    //return Object.values(consolidated);
 // };

  const cleanedLogs = useMemo(() => {
    return logs.map(log => ({
      ...log,
      log: log.log ? cleanLogText(log.log) : ''
    }));
  }, [logs]);

  const filteredAndSortedLogs = useMemo(() => {
    // Filter out null, empty, or undefined logs
    let filtered = cleanedLogs.filter(log =>
      log &&
      log.log &&
      log.log.trim() !== '' &&
      log.log_level &&
      log.created_at
    );


    // Consolidate logs with same timestamp
  //  filtered = consolidateLogsByTimestamp(filtered);

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

  const fetchLogs = async (avsName: string) => {
    setIsLoading(true);
    try {
      const machineId = machinesData?.data.find(m =>
        m.avs_list.some((a: AVSInfo) => a.avs_name === avsName)
      )?.machine_id;

      if (!machineId) {
        throw new Error('Machine ID not found');
      }

      const response = await apiFetch(`machine/${machineId}/logs?avs_name=${avsName}`, 'GET');
      if (response?.data?.length) {  // Add null check and length check
        const limitedLogs = response.data.slice(Math.max(response.data.length - 100, 0));
        setLogs(limitedLogs);
      } else {
        setLogs([]);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Error fetching logs';
      toast.error(errorMsg, { theme: "dark", toastId: errorMsg });
      setLogs([]);
    } finally {
      setIsLoading(false);
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

      <div className="mb-6">
        {selectedAvs ? (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-textPrimary">
                {`${selectedAvs} Logs`}
              </h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-black bg-opacity-30 text-textPrimary"
                />
                <button
                  onClick={() => setSelectedAvs(null)}
                  className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
                >
                  Switch
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
                >
                  Download
                </button>
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
                >
                  Filter Type
                </button>
              </div>
            </div>

            <div className="flex gap-6 mt-2">
              <div className="flex flex-col">
                <div className="text-sidebarColor text-base font-medium">Chain</div>
                <div className="text-sidebarColor text-base font-medium">Last Updated</div>
              </div>
              <div className="flex flex-col">
                <div className="text-textPrimary text-base font-medium">{getSelectedAvsChain()}</div>
                <div className="text-textPrimary text-base font-medium">
                {logs.length > 0 && (
                    <>
                      <span className={formatTimestamp(logs[logs.length - 1].created_at).textColorClass}>
                        {formatTimestamp(logs[logs.length - 1].created_at).timeAgo}
                      </span>
                      {' '}
                      <span className="text-textPrimary">
                        ({formatTimestamp(logs[logs.length - 1].created_at).exactTime})
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-textPrimary">
              AVS Logs Snapshot
            </h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 rounded-lg bg-black bg-opacity-30 text-textPrimary"
              />
              <button
                onClick={() => setShowFilterModal(true)}
                className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
              >
                Filter Type
              </button>
            </div>
          </div>
        )}
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
            .filter(avs => avs.avs_name.toLowerCase().includes(avsSearchTerm.toLowerCase()))
            .map(avs => (
              <button
                key={`${avs.avs_name}-${avs.machine_name}`}
                onClick={() => {
                  setSelectedAvs(avs.avs_name);
                  fetchLogs(avs.avs_name);
                }}
                className="w-full p-3 text-left hover:bg-widgetHoverBg rounded-lg text-textSecondary border border-textGrey/20"
              >
                <div className="flex flex-col">
                  <span className="text-lg font-medium">{avs.avs_name}</span>
                  <span className="text-md text-textGrey">{avs.machine_name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-widgetBg rounded-lg p-8">
          <h2 className="text-xl font-semibold text-textPrimary mb-4">Loading logs...</h2>
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
            content="Timestamp"
            sortKey="created_at"
            currentSort={sortConfig}
            onSort={() => handleSort('created_at')}
            className="text-base w-[200px] whitespace-nowrap text-left"
          />
          <Th
            content="Type"
            sortKey="log_level"
            currentSort={sortConfig}
            onSort={() => handleSort('log_level')}
            className="text-base w-[100px] whitespace-nowrap ml-8 text-left"
          />
          <Th
            content="Log"
            className="text-base pl-4 text-left"
          />
        </Tr>
        {filteredAndSortedLogs.map((log, index) => (
  <Tr key={`${log.created_at}-${index}`}>
    <Td
      content={formatTimestamp(log.created_at).exactTime}
      className="text-xl whitespace-nowrap align-top pt-6"
    />
    <Td
      className="text-sm whitespace-nowrap ml-16 align-top pt-7"
    >
      <div className={`pt-1 ${
        log.log_level === 'ERROR' ? 'text-textWarning' :
        log.log_level === 'WARNING' ? 'text-textWarningyellow' :
        log.log_level === 'DEBUG' ? 'text-blue' :
        log.log_level === 'INFO' ? 'text-positive' : ''
      }`}>
        {log.log_level}
      </div>
    </Td>
    <Td
      content={log.log}
      className="text-xl pl-4 whitespace-pre-line align-top pt-6"
    />
  </Tr>
))}
        </Table>
      )}
      <Outlet />
    </>
  );
};
