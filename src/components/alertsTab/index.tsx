import React, { useState, useMemo } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Topbar } from '../Topbar';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { apiFetch } from '../../utils';
import { SectionTitle } from '../shared/sectionTitle';

// Interface for the node alert format
interface NodeAlertEntry {
  alert_id: string;
  alert_type: {
    [key: string]: {
      node_name: string;
      node_type: string;
    }
  };
  machine_id: string;
  organization_id: number;
  client_id: string;
  node_name: string;
  created_at: string;
  acknowledged_at: string | null;
  telegram_send: string;
  sendgrid_send: string;
  pagerduty_send: string;
}

// Interface for the organization (EigenAVS) alert format
interface OrgAlertEntry {
  alert_id: string;
  alert_type: {
    NewEigenAvs?: {
      address: string;
      block_number: number;
      log_index: number;
      name: string;
      metadata_uri: string;
      description: string;
      website: string;
      logo: string;
      twitter: string;
    };
    UpdatedEigenAvs?: {
      address: string;
      block_number: number;
      log_index: number;
      name: string;
      metadata_uri: string;
      description: string;
      website: string;
      logo: string;
      twitter: string;
    };
  };
  organization_id: number;
  created_at: string;
  telegram_send: string;
  sendgrid_send: string;
  pagerduty_send: string;
  acknowledged_at: string | null;
}

const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 30000, // Poll every 30 seconds
  dedupingInterval: 5000,
  errorRetryCount: 3,
  refreshWhenHidden: false,
  refreshWhenOffline: false
};

// Use the existing apiFetch utility with proper error handling
const fetcher = async (url: string) => {
  try {
    const response = await apiFetch(url, "GET");
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// Carry over and extend the icons from the original component while adding new ones for alerts
const AlertIcons = {
  // Original icons
  CrashedNode: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  NeedsUpdate: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9h-1.8M3 12a9 9 0 009 9m-9-9a9 9 0 019-9m-9 9h1.8"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4M12 8h.01"/>
    </svg>
  ),
  UnregisteredFromActiveSet: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),

  // New alert type icons
  NoChainInfo: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  NoOperatorId: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  // New EigenAVS icons
  NewEigenAvs: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
    </svg>
  ),
  UpdatedEigenAvs: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
    </svg>
  ),
  Default: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  )
};

const formatTimestamp = (timestamp: string) => {
  try {
    const updateTimeUTC = new Date(timestamp);
    const nowUTC = new Date();
    const diffMs = nowUTC.getTime() - updateTimeUTC.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    const timeAgo = diffMinutes < 1 ? '< 1 Min Ago' :
                 diffMinutes < 60 ? `${diffMinutes} Min Ago` :
                 diffHours < 24 ? `${diffHours} ${diffHours === 1 ? 'Hr' : 'Hrs'} Ago` :
                 `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'} Ago`;

    const exactTime = updateTimeUTC.toISOString().split('.')[0].replace('T', ' ');

    return {
      timeAgo,
      exactTime,
      textColorClass: diffDays >= 1 ? 'text-textSecondary' : 'text-textSecondary'
    };
  } catch {
    return {
      timeAgo: 'N/A',
      exactTime: 'N/A',
      textColorClass: 'text-textSecondary'
    };
  }
};

// Function to get a clear alert type name
const getAlertTypeName = (alert: NodeAlertEntry | OrgAlertEntry): string => {
  if ('node_name' in alert) {
    // It's a NodeAlertEntry
    return Object.keys(alert.alert_type)[0] || 'Unknown Alert';
  } else {
    // It's an OrgAlertEntry
    return Object.keys(alert.alert_type)[0] || 'Unknown Alert';
  }
};

export const AlertsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedAlertTypes, setSelectedAlertTypes] = useState<string[]>([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set<string>());
  const [expandedOrgs, setExpandedOrgs] = useState(new Set<string>());
  const [sortOrder, setSortOrder] = useState<'node' | 'newest' | 'oldest'>('newest');
  const [alertView, setAlertView] = useState<'node' | 'org' | 'all'>('all');
  // New state for hamburger menus
  const [nodeAlertsExpanded, setNodeAlertsExpanded] = useState(true);
  const [eigenAvsAlertsExpanded, setEigenAvsAlertsExpanded] = useState(true);

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'node', label: 'Node Name' }
  ] as const;

  const location = useLocation();

  // Fetch node alerts data
  const { data: nodeAlertsDataResponse, error: nodeAlertsError, mutate: refreshNodeAlertsData } =
    useSWR('alerts/node/active', fetcher, swrConfig);

  // Fetch org alerts data (EigenAVS)
  const { data: orgAlertsDataResponse, error: orgAlertsError, mutate: refreshOrgAlertsData } =
    useSWR('alerts/org/active', fetcher, swrConfig);

  // Fetch machines data for reference
  const { data: machinesDataResponse, error: machinesError } = useSWR('machine', fetcher, swrConfig);

  // Extract data from response objects
  const nodeAlertsData = useMemo(() => (nodeAlertsDataResponse || []) as NodeAlertEntry[], [nodeAlertsDataResponse]);
  const orgAlertsData = useMemo(() => (orgAlertsDataResponse || []) as OrgAlertEntry[], [orgAlertsDataResponse]);
  const machinesData = useMemo(() => machinesDataResponse?.data || [], [machinesDataResponse]);

  // Extract unique alert types for filtering
  const alertTypes = useMemo(() => {
    if (!nodeAlertsData && !orgAlertsData) return [];

    const types = new Set<string>();

    // Add node alert types
    nodeAlertsData.forEach((alert: NodeAlertEntry) => {
      const alertType = Object.keys(alert.alert_type)[0];
      if (alertType) types.add(alertType);
    });

    // Add org alert types
    orgAlertsData.forEach((alert: OrgAlertEntry) => {
      const alertType = Object.keys(alert.alert_type)[0];
      if (alertType) types.add(alertType);
    });

    return Array.from(types);
  }, [nodeAlertsData, orgAlertsData]);

  // Get machine name from machine ID
  const getMachineName = useMemo(() => (machineId: string): string => {
    if (!machinesData) return 'Unknown Machine';
    const machine = machinesData.find((m: any) => m.machine_id === machineId);
    return machine?.name?.replace(/"/g, '') || 'Unknown Machine';
  }, [machinesData]);

  // Group node alerts by node_name and machine_id combination
  const groupedNodeAlerts = useMemo(() => {
    if (!nodeAlertsData) return {};

    return nodeAlertsData.reduce((acc: Record<string, NodeAlertEntry[]>, alert: NodeAlertEntry) => {
      const groupKey = `${alert.node_name}-${alert.machine_id}`;

      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }

      acc[groupKey].push(alert);
      return acc;
    }, {});
  }, [nodeAlertsData]);

  // Group org alerts by alert type (NewEigenAvs or UpdatedEigenAvs)
  const groupedOrgAlerts = useMemo(() => {
    if (!orgAlertsData) return {};

    return orgAlertsData.reduce((acc: Record<string, OrgAlertEntry[]>, alert: OrgAlertEntry) => {
      // Get the alert type (NewEigenAvs or UpdatedEigenAvs)
      const alertType = Object.keys(alert.alert_type)[0];

      if (!acc[alertType]) {
        acc[alertType] = [];
      }

      acc[alertType].push(alert);
      return acc;
    }, {});
  }, [orgAlertsData]);

  // Apply filters and search to grouped node alerts
  const filteredGroupedNodeAlerts = useMemo(() => {
    // Skip if not viewing node alerts
    if (alertView === 'org') return {};

    let filtered = { ...groupedNodeAlerts };

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = Object.entries(filtered).reduce((acc: Record<string, NodeAlertEntry[]>, [key, alerts]) => {
        const typedAlerts = alerts as NodeAlertEntry[];
        const nodeName = typedAlerts[0]?.node_name.toLowerCase();
        const machineName = getMachineName(typedAlerts[0]?.machine_id).toLowerCase();

        if (nodeName.includes(searchLower) || machineName.includes(searchLower)) {
          acc[key] = typedAlerts;
        }

        return acc;
      }, {});
    }

    if (selectedAlertTypes.length > 0) {
      filtered = Object.entries(filtered).reduce((acc: Record<string, NodeAlertEntry[]>, [key, alerts]) => {
        const typedAlerts = alerts as NodeAlertEntry[];
        const filteredAlerts = typedAlerts.filter((alert: NodeAlertEntry) => {
          const alertType = Object.keys(alert.alert_type)[0];
          return selectedAlertTypes.includes(alertType);
        });

        if (filteredAlerts.length > 0) {
          acc[key] = filteredAlerts;
        }

        return acc;
      }, {});
    }

    // Apply the selected filter
    if (selectedFilter !== 'all') {
      filtered = Object.entries(filtered).reduce((acc: Record<string, NodeAlertEntry[]>, [key, alerts]) => {
        const typedAlerts = alerts as NodeAlertEntry[];
        const filteredAlerts = typedAlerts.filter((alert: NodeAlertEntry) => {
          if (selectedFilter === 'acknowledged') {
            return alert.acknowledged_at !== null;
          } else if (selectedFilter === 'unacknowledged') {
            return alert.acknowledged_at === null;
          }
          return true;
        });

        if (filteredAlerts.length > 0) {
          acc[key] = filteredAlerts;
        }

        return acc;
      }, {});
    }

    return filtered;
  }, [groupedNodeAlerts, searchTerm, selectedAlertTypes, selectedFilter, getMachineName, alertView]);

  // Apply filters to grouped org alerts
  const filteredGroupedOrgAlerts = useMemo(() => {
    // Skip if not viewing org alerts
    if (alertView === 'node') return {};

    let filtered = { ...groupedOrgAlerts };

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = Object.entries(filtered).reduce((acc: Record<string, OrgAlertEntry[]>, [key, alerts]) => {
        const typedAlerts = alerts as OrgAlertEntry[];
        const filteredAlerts = typedAlerts.filter(alert => {
          const avsName = alert.alert_type.NewEigenAvs?.name || alert.alert_type.UpdatedEigenAvs?.name || '';
          const avsAddress = alert.alert_type.NewEigenAvs?.address || alert.alert_type.UpdatedEigenAvs?.address || '';

          return avsName.toLowerCase().includes(searchLower) ||
                 avsAddress.toLowerCase().includes(searchLower);
        });

        if (filteredAlerts.length > 0) {
          acc[key] = filteredAlerts;
        }

        return acc;
      }, {});
    }

    if (selectedAlertTypes.length > 0) {
      filtered = Object.entries(filtered).reduce((acc: Record<string, OrgAlertEntry[]>, [key, alerts]) => {
        if (selectedAlertTypes.includes(key)) {
          acc[key] = alerts;
        }
        return acc;
      }, {});
    }

    // Apply the selected filter
    if (selectedFilter !== 'all') {
      filtered = Object.entries(filtered).reduce((acc: Record<string, OrgAlertEntry[]>, [key, alerts]) => {
        const typedAlerts = alerts as OrgAlertEntry[];
        const filteredAlerts = typedAlerts.filter((alert: OrgAlertEntry) => {
          if (selectedFilter === 'acknowledged') {
            return alert.acknowledged_at !== null;
          } else if (selectedFilter === 'unacknowledged') {
            return alert.acknowledged_at === null;
          }
          return true;
        });

        if (filteredAlerts.length > 0) {
          acc[key] = filteredAlerts;
        }

        return acc;
      }, {});
    }

    return filtered;
  }, [groupedOrgAlerts, searchTerm, selectedAlertTypes, selectedFilter, alertView]);

  // Sort the filtered and grouped node alerts
  const sortedGroupedNodeAlerts = useMemo(() => {
    const entries = Object.entries(filteredGroupedNodeAlerts);

    switch(sortOrder) {
      case 'newest':
        return entries.sort(([, alertsA], [, alertsB]) => {
          const typedAlertsA = alertsA as NodeAlertEntry[];
          const typedAlertsB = alertsB as NodeAlertEntry[];
          const dateA = new Date(typedAlertsA[0]?.created_at || '');
          const dateB = new Date(typedAlertsB[0]?.created_at || '');
          return dateB.getTime() - dateA.getTime();
        });
      case 'oldest':
        return entries.sort(([, alertsA], [, alertsB]) => {
          const typedAlertsA = alertsA as NodeAlertEntry[];
          const typedAlertsB = alertsB as NodeAlertEntry[];
          const dateA = new Date(typedAlertsA[0]?.created_at || '');
          const dateB = new Date(typedAlertsB[0]?.created_at || '');
          return dateA.getTime() - dateB.getTime();
        });
      case 'node':
        return entries.sort(([, alertsA], [, alertsB]) => {
          const typedAlertsA = alertsA as NodeAlertEntry[];
          const typedAlertsB = alertsB as NodeAlertEntry[];
          return (typedAlertsA[0]?.node_name || '').localeCompare(typedAlertsB[0]?.node_name || '');
        });
      default:
        return entries;
    }
  }, [filteredGroupedNodeAlerts, sortOrder]);

  // Sort the filtered and grouped org alerts
  const sortedGroupedOrgAlerts = useMemo(() => {
    const entries = Object.entries(filteredGroupedOrgAlerts);

    switch(sortOrder) {
      case 'newest':
        return entries.sort(([, alertsA], [, alertsB]) => {
          const typedAlertsA = alertsA as OrgAlertEntry[];
          const typedAlertsB = alertsB as OrgAlertEntry[];
          const dateA = new Date(typedAlertsA[0]?.created_at || '');
          const dateB = new Date(typedAlertsB[0]?.created_at || '');
          return dateB.getTime() - dateA.getTime();
        });
      case 'oldest':
        return entries.sort(([, alertsA], [, alertsB]) => {
          const typedAlertsA = alertsA as OrgAlertEntry[];
          const typedAlertsB = alertsB as OrgAlertEntry[];
          const dateA = new Date(typedAlertsA[0]?.created_at || '');
          const dateB = new Date(typedAlertsB[0]?.created_at || '');
          return dateA.getTime() - dateB.getTime();
        });
      case 'node':
        return entries.sort(([typeA], [typeB]) => {
          return typeA.localeCompare(typeB);
        });
      default:
        return entries;
    }
  }, [filteredGroupedOrgAlerts, sortOrder]);

  // Calculate total count of alerts
  const totalAlertCount = useMemo(() => nodeAlertsData.length + orgAlertsData.length, [nodeAlertsData, orgAlertsData]);

  // Calculate acknowledged alerts count
  const acknowledgedAlertCount = useMemo(() => {
    const nodeAcknowledged = nodeAlertsData.filter(a => a.acknowledged_at !== null).length;
    const orgAcknowledged = orgAlertsData.filter(a => a.acknowledged_at !== null).length;
    return nodeAcknowledged + orgAcknowledged;
  }, [nodeAlertsData, orgAlertsData]);

  // Calculate unacknowledged alerts count
  const unacknowledgedAlertCount = useMemo(() => {
    const nodeUnacknowledged = nodeAlertsData.filter(a => a.acknowledged_at === null).length;
    const orgUnacknowledged = orgAlertsData.filter(a => a.acknowledged_at === null).length;
    return nodeUnacknowledged + orgUnacknowledged;
  }, [nodeAlertsData, orgAlertsData]);

  // Calculate node alerts counts
  const nodeAlertCount = useMemo(() => nodeAlertsData.length, [nodeAlertsData]);
  const nodeAcknowledgedAlertCount = useMemo(() =>
    nodeAlertsData.filter(a => a.acknowledged_at !== null).length, [nodeAlertsData]);
  const nodeUnacknowledgedAlertCount = useMemo(() =>
    nodeAlertsData.filter(a => a.acknowledged_at === null).length, [nodeAlertsData]);

  // Calculate EigenAVS alerts counts
  const eigenAvsAlertCount = useMemo(() => orgAlertsData.length, [orgAlertsData]);
  const eigenAvsAcknowledgedAlertCount = useMemo(() =>
    orgAlertsData.filter(a => a.acknowledged_at !== null).length, [orgAlertsData]);
  const eigenAvsUnacknowledgedAlertCount = useMemo(() =>
    orgAlertsData.filter(a => a.acknowledged_at === null).length, [orgAlertsData]);

  // Toggle node expansion
  const toggleNode = (nodeKey: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeKey)) {
      newExpanded.delete(nodeKey);
    } else {
      newExpanded.add(nodeKey);
    }
    setExpandedNodes(newExpanded);
  };

  // Toggle org alert expansion
  const toggleOrg = (orgKey: string) => {
    const newExpanded = new Set(expandedOrgs);
    if (newExpanded.has(orgKey)) {
      newExpanded.delete(orgKey);
    } else {
      newExpanded.add(orgKey);
    }
    setExpandedOrgs(newExpanded);
  };

  // Handle node alert acknowledgment
  const acknowledgeNodeAlert = async (alertId: string) => {
    try {
      await apiFetch(`alerts/acknowledge?alert_id=${alertId}`, "POST", undefined);
      toast.success("Alert acknowledged successfully", { theme: "dark" });
      refreshNodeAlertsData(); // Refresh data after acknowledgment
    } catch (error) {
      console.error("Error acknowledging alert:", error);
    }
  };

  // Handle org alert acknowledgment
  const acknowledgeOrgAlert = async (alertId: string) => {
    try {
      await apiFetch(`alerts/org/acknowledge?alert_id=${alertId}`, "POST", undefined);
      toast.success("Alert acknowledged successfully", { theme: "dark" });
      refreshOrgAlertsData(); // Refresh data after acknowledgment
    } catch (error) {
      console.error("Error acknowledging alert:", error);
    }
  };

  // Get alert type icon
  const getAlertTypeIcon = (alertType: string) => {
    if (AlertIcons[alertType as keyof typeof AlertIcons]) {
      return React.createElement(AlertIcons[alertType as keyof typeof AlertIcons]);
    }
    return <AlertIcons.Default />;
  };

  // Get alert type display name from the object
  const getAlertTypeDisplay = (alertTypeObj: any): string => {
    const alertType = Object.keys(alertTypeObj)[0];
    return alertType || "Unknown Alert";
  };

  // Get a formatted description of the alert for org alerts
  const getOrgAlertDescription = (alert: OrgAlertEntry): string => {
    if (alert.alert_type.NewEigenAvs) {
      const { name, address } = alert.alert_type.NewEigenAvs;
      return `New EigenAVS: ${name || 'Unnamed'} at ${address}`;
    }
    else if (alert.alert_type.UpdatedEigenAvs) {
      const { name, address } = alert.alert_type.UpdatedEigenAvs;
      return `Updated EigenAVS: ${name || 'Unnamed'} at ${address}`;
    }
    return "Unknown EigenAVS alert";
  };

  if (nodeAlertsError || orgAlertsError || machinesError) {
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

  if (!nodeAlertsDataResponse || !orgAlertsDataResponse || !machinesDataResponse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-semibold text-textPrimary">Loading...</h2>
      </div>
    );
  }

  const noAlertsToShow = (alertView === 'node' && sortedGroupedNodeAlerts.length === 0) ||
                        (alertView === 'org' && sortedGroupedOrgAlerts.length === 0) ||
                        (alertView === 'all' && sortedGroupedNodeAlerts.length === 0 && sortedGroupedOrgAlerts.length === 0);
                        return (
                          <>
                            <Topbar title="Alerts Overview" />
                            {!location.pathname.includes('/settings') && (
                              <>
                                <div className="flex justify-between items-center mb-6">
                                  <SectionTitle title="Alerts Details" className="text-textPrimary" />
                                  <Link
                                    to="/alerts/settings"
                                    className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
                                  >
                                    Notification Settings
                                  </Link>
                                </div>

{/* Alert type filter buttons and search/filter controls in the same row */}
<div className="flex justify-between items-center mb-4">
  <div className="flex items-center">
    <button onClick={() => setAlertView('all')}
      className={`px-4 py-2 rounded-lg mr-2 ${alertView === 'all' ? 'bg-bgButton text-textPrimary' : 'text-textSecondary hover:bg-textGrey'}`}
    >
      All Alert Types
    </button>
    <button onClick={() => setAlertView('node')}
      className={`px-4 py-2 rounded-lg mr-2 ${alertView === 'node' ? 'bg-bgButton text-textPrimary' : 'text-textSecondary hover:bg-textGrey'}`}
    >
      Node Alerts
    </button>
    <button onClick={() => setAlertView('org')}
      className={`px-4 py-2 rounded-lg ${alertView === 'org' ? 'bg-bgButton text-textPrimary' : 'text-textSecondary hover:bg-textGrey'}`}
    >
      Ecosystem Alerts
    </button>
  </div>

  <div className="flex items-center gap-4">
    <div className="relative">
      <input type="text" placeholder="Search alerts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-black bg-opacity-30 rounded-lg text-textPrimary border border-textGrey/20 focus:ring-1 focus:ring-textGrey"
      />
      <svg className="absolute left-3 top-2.5 w-5 h-5 text-textGrey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <button onClick={() => setShowFilterModal(true)}
      className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary">
      Filter
    </button>
    <button onClick={() => setShowSortModal(true)}
      className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary">
      Sort
    </button>
  </div>
</div>

                                {noAlertsToShow ? (
                                  <div className="flex flex-col items-center justify-center min-h-[400px] bg-widgetBg rounded-lg p-8">
                                    <h2 className="text-xl font-semibold text-textPrimary mb-4">No alerts found!</h2>
                                    <p className="text-textSecondary">All systems are running smoothly</p>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {/* Node Alerts Section with Hamburger Style */}
                                    {(alertView === 'all' || alertView === 'node') && sortedGroupedNodeAlerts.length > 0 && (
                                      <div className="bg-widgetBg rounded-lg p-4">
                                        <div
                                          className="flex items-center justify-between cursor-pointer"
                                          onClick={() => setNodeAlertsExpanded(!nodeAlertsExpanded)}
                                        >
                                          <div className="flex items-center gap-2">
                                            <svg className={`w-5 h-5 text-textGrey transform transition-transform ${
                                              nodeAlertsExpanded ? 'rotate-90' : ''
                                            }`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                            <span className="text-textPrimary font-medium">Node Alerts</span>
                                            <span className="bg-black bg-opacity-30 px-2 py-1 rounded-full text-sm text-textSecondary">
                                              {nodeAlertCount} {nodeAlertCount === 1 ? 'alert' : 'alerts'}
                                            </span>
                                          </div>
                                        </div>

                                        {nodeAlertsExpanded && (
                                          <div className="mt-4 pl-6 space-y-4">
                                            {/* Filter buttons as subset of Node Alerts */}
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                              <button onClick={() => setSelectedFilter('all')}
                                                className={`px-3 py-1 text-sm rounded-lg ${selectedFilter === 'all' ? 'bg-bgButton text-textPrimary' : 'text-textSecondary hover:bg-textGrey'}`}
                                              >
                                                All Alerts ({nodeAlertCount})
                                              </button>
                                              <button onClick={() => setSelectedFilter('acknowledged')}
                                                className={`px-3 py-1 text-sm rounded-lg ${selectedFilter === 'acknowledged' ? 'bg-bgButton text-textPrimary' : 'text-textSecondary hover:bg-textGrey'}`}
                                              >
                                                Acknowledged ({nodeAcknowledgedAlertCount})
                                              </button>
                                              <button onClick={() => setSelectedFilter('unacknowledged')}
                                                className={`px-3 py-1 text-sm rounded-lg ${selectedFilter === 'unacknowledged' ? 'bg-bgButton text-textPrimary' : 'text-textSecondary hover:bg-textGrey'}`}
                                              >
                                                Unacknowledged ({nodeUnacknowledgedAlertCount})
                                              </button>
                                            </div>

                                            {/* Individual Node Alerts */}
                                            {sortedGroupedNodeAlerts.map(([nodeKey, alerts]) => {
                                              const typedAlerts = alerts as NodeAlertEntry[];
                                              const nodeName = typedAlerts[0]?.node_name;
                                              const machineId = typedAlerts[0]?.machine_id;
                                              const machineName = getMachineName(machineId);

                                              return (
                                                <div key={nodeKey} className="bg-black bg-opacity-20 rounded-lg p-4">
                                                  <div
                                                    className="flex items-center justify-between cursor-pointer"
                                                    onClick={() => toggleNode(nodeKey)}
                                                  >
                                                    <div className="flex items-center gap-2">
                                                      <svg className={`w-4 h-4 text-textGrey transform transition-transform ${
                                                        expandedNodes.has(nodeKey) ? 'rotate-90' : ''
                                                      }`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                      </svg>
                                                      <span className="text-textPrimary font-medium">{nodeName}</span>
                                                      <span className="bg-black bg-opacity-30 px-2 py-1 rounded-full text-sm text-textSecondary">
                                                        {typedAlerts.length} {typedAlerts.length === 1 ? 'alert' : 'alerts'}
                                                      </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      {Object.keys(typedAlerts[0]?.alert_type || {}).length > 0 && (
                                                        <div className="text-textSecondary">
                                                          {getAlertTypeIcon(Object.keys(typedAlerts[0].alert_type)[0])}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>

                                                  {expandedNodes.has(nodeKey) && (
                                                    <div className="mt-4 space-y-3 pl-6">
                                                      {typedAlerts.map((alert: NodeAlertEntry) => {
                                                        const timestamp = formatTimestamp(alert.created_at);
                                                        const alertType = getAlertTypeDisplay(alert.alert_type);

                                                        return (
                                                          <div key={alert.alert_id}
                                                            className="bg-black bg-opacity-30 rounded-lg p-4 flex items-center space-x-4">
                                                            <div className="text-textGrey">
                                                              {getAlertTypeIcon(alertType)}
                                                            </div>
                                                            <div className="flex-1 text-textSecondary font-normal">
                                                              <span className={timestamp.textColorClass}>{timestamp.timeAgo}</span>
                                                              <span className="ml-2 text-textSecondary">({timestamp.exactTime} UTC):</span>
                                                              <span className="text-textSecondary font-normal">
                                                                {' '}<span className="text-textWarning">{alertType}</span> on{' '}
                                                                <Link to={`/machines/${alert.machine_id}`} className="text-textSecondary hover:text-textSecondary font-bold">
                                                                  {alert.machine_id}
                                                                </Link>
                                                              </span>
                                                            </div>
                                                            {alert.acknowledged_at === null && (
                                                              <button
                                                                onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  acknowledgeNodeAlert(alert.alert_id);
                                                                }}
                                                                className="px-3 py-1 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary text-sm"
                                                              >
                                                                Acknowledge
                                                              </button>
                                                            )}
                                                            {alert.acknowledged_at !== null && (
                                                              <span className="text-green-500 text-sm">Acknowledged</span>
                                                            )}
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* EigenAVS Alerts Section with Hamburger Style */}
                                    {(alertView === 'all' || alertView === 'org') && sortedGroupedOrgAlerts.length > 0 && (
                                      <div className="bg-widgetBg rounded-lg p-4">
                                        <div
                                          className="flex items-center justify-between cursor-pointer"
                                          onClick={() => setEigenAvsAlertsExpanded(!eigenAvsAlertsExpanded)}
                                        >
                                          <div className="flex items-center gap-2">
                                            <svg className={`w-5 h-5 text-textGrey transform transition-transform ${
                                              eigenAvsAlertsExpanded ? 'rotate-90' : ''
                                            }`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                            <span className="text-textPrimary font-medium">Ecosystem Alerts</span>
                                            <span className="bg-black bg-opacity-30 px-2 py-1 rounded-full text-sm text-textSecondary">
                                              {eigenAvsAlertCount} {eigenAvsAlertCount === 1 ? 'alert' : 'alerts'}
                                            </span>
                                          </div>
                                        </div>

                                        {eigenAvsAlertsExpanded && (
                                          <div className="mt-4 pl-6 space-y-4">
                                            {/* Filter buttons as subset of EigenAVS Alerts */}
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                              <button onClick={() => setSelectedFilter('all')}
                                                className={`px-3 py-1 text-sm rounded-lg ${selectedFilter === 'all' ? 'bg-bgButton text-textPrimary' : 'text-textSecondary hover:bg-textGrey'}`}
                                              >
                                                All Alerts ({eigenAvsAlertCount})
                                              </button>
                                              <button onClick={() => setSelectedFilter('acknowledged')}
                                                className={`px-3 py-1 text-sm rounded-lg ${selectedFilter === 'acknowledged' ? 'bg-bgButton text-textPrimary' : 'text-textSecondary hover:bg-textGrey'}`}
                                              >
                                                Acknowledged ({eigenAvsAcknowledgedAlertCount})
                                              </button>
                                              <button onClick={() => setSelectedFilter('unacknowledged')}
                                                className={`px-3 py-1 text-sm rounded-lg ${selectedFilter === 'unacknowledged' ? 'bg-bgButton text-textPrimary' : 'text-textSecondary hover:bg-textGrey'}`}
                                              >
                                                Unacknowledged ({eigenAvsUnacknowledgedAlertCount})
                                              </button>
                                            </div>

                                            {/* EigenAVS Alert Types */}
                                            {sortedGroupedOrgAlerts.map(([orgType, alerts]) => {
                                              const typedAlerts = alerts as OrgAlertEntry[];

                                              return (
                                                <div key={orgType} className="bg-black bg-opacity-20 rounded-lg p-4">
                                                  <div
                                                    className="flex items-center justify-between cursor-pointer"
                                                    onClick={() => toggleOrg(orgType)}
                                                  >
                                                    <div className="flex items-center gap-2">
                                                      <svg className={`w-4 h-4 text-textGrey transform transition-transform ${
                                                        expandedOrgs.has(orgType) ? 'rotate-90' : ''
                                                      }`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                      </svg>
                                                      <span className="text-textPrimary font-medium">{orgType}</span>
                                                      <span className="bg-black bg-opacity-30 px-2 py-1 rounded-full text-sm text-textSecondary">
                                                        {typedAlerts.length} {typedAlerts.length === 1 ? 'alert' : 'alerts'}
                                                      </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      <div className="text-textSecondary">
                                                        {getAlertTypeIcon(orgType)}
                                                      </div>
                                                    </div>
                                                  </div>

                                                  {expandedOrgs.has(orgType) && (
                                                    <div className="mt-4 space-y-3 pl-6">
                                                      {typedAlerts.map((alert: OrgAlertEntry) => {
                                                        const timestamp = formatTimestamp(alert.created_at);
                                                        const alertDesc = getOrgAlertDescription(alert);
                                                        const avsData = alert.alert_type.NewEigenAvs || alert.alert_type.UpdatedEigenAvs;

                                                        return (
                                                          <div key={alert.alert_id}
                                                            className="bg-black bg-opacity-30 rounded-lg p-4 flex items-center space-x-4">
                                                            <div className="text-textGrey">
                                                              {getAlertTypeIcon(orgType)}
                                                            </div>
                                                            <div className="flex-1 text-textSecondary font-normal">
                                                              <span className={timestamp.textColorClass}>{timestamp.timeAgo}</span>
                                                              <span className="ml-2 text-textSecondary">({timestamp.exactTime} UTC):</span>
                                                              <div className="text-textSecondary font-normal mt-1">
                                                                <span className="text-textWarning">{alertDesc}</span>
                                                                {avsData && (
                                                                  <div className="mt-1 text-sm">
                                                                    <div><span className="font-semibold">Address:</span> {avsData.address}</div>
                                                                    {avsData.name && <div><span className="font-semibold">Name:</span> {avsData.name}</div>}
                                                                    {avsData.block_number && <div><span className="font-semibold">Block:</span> {avsData.block_number}</div>}
                                                                    {avsData.website && (
                                                                      <div>
                                                                        <span className="font-semibold">Website:</span>{' '}
                                                                        <a href={avsData.website} target="_blank" rel="noopener noreferrer"
                                                                          className="text-blue-400 hover:underline">
                                                                          {avsData.website}
                                                                        </a>
                                                                      </div>
                                                                    )}
                                                                  </div>
                                                                )}
                                                              </div>
                                                            </div>
                                                            {alert.acknowledged_at === null && (
                                                              <button
                                                                onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  acknowledgeOrgAlert(alert.alert_id);
                                                                }}
                                                                className="px-3 py-1 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary text-sm flex-shrink-0"
                                                              >
                                                                Acknowledge
                                                              </button>
                                                            )}
                                                            {alert.acknowledged_at !== null && (
                                                              <span className="text-green-500 text-sm flex-shrink-0">Acknowledged</span>
                                                            )}
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Sort Modal */}
                                {showSortModal && (
                                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-widgetBg rounded-lg p-8 max-w-md w-full relative">
                                      <button onClick={() => setShowSortModal(false)}
                                        className="absolute top-4 right-4 text-textGrey hover:text-textPrimary">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M18 6L6 18M6 6l12 12"/>
                                        </svg>
                                      </button>
                                      <h2 className="text-2xl font-semibold text-textPrimary mb-6">Sort By</h2>
                                      <div className="w-full grid gap-2">
                                        {sortOptions.map(option => (
                                          <button key={option.value}
                                            onClick={() => {
                                              setSortOrder(option.value as typeof sortOrder);
                                              setShowSortModal(false);
                                            }}
                                            className={`w-full p-3 text-left rounded-lg text-textSecondary border border-textGrey/20 ${
                                              sortOrder === option.value ? 'bg-bgButton' : 'hover:bg-widgetHoverBg'
                                            }`}>
                                            {option.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Filter Modal */}
                                {showFilterModal && (
                                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-widgetBg rounded-lg p-8 max-w-md w-full relative">
                                      <button onClick={() => setShowFilterModal(false)}
                                        className="absolute top-4 right-4 text-textGrey hover:text-textPrimary">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M18 6L6 18M6 6l12 12"/>
                                        </svg>
                                      </button>
                                      <h2 className="text-2xl font-semibold text-textPrimary mb-6">Filter by Alert Type</h2>
                                      <div className="w-full grid gap-2">
                                        {alertTypes.map(type => (
                                          <button key={type}
                                            onClick={() => {
                                              setSelectedAlertTypes(current =>
                                                current.includes(type) ? current.filter(t => t !== type) : [...current, type]
                                              );
                                            }}
                                            className={`w-full p-3 text-left rounded-lg text-textSecondary border border-textGrey/20 ${
                                              selectedAlertTypes.includes(type) ? 'bg-bgButton' : 'hover:bg-widgetHoverBg'
                                            }`}>
                                            {type}
                                          </button>
                                        ))}
                                      </div>
                                      <div className="mt-6 flex justify-end">
                                        <button onClick={() => setShowFilterModal(false)}
                                          className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary">
                                          Apply Filters
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
                        )
                      };
