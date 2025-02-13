import React from 'react';
import { MachinesStatus, NodeDetail, AVS } from "../../../interfaces/responses";
import { WidgetItem } from "./widgetItem";
import { apiFetch } from "../../../utils";
import { AxiosResponse } from "axios";
import useSWR from 'swr';

interface MachinesWidgetProps {
  data: MachinesStatus;
  details?: NodeDetail[];
  avs?: AVS[];
}

interface PubKeyData {
  public_key: string;
  name: string;
}

export const MachinesWidget: React.FC<MachinesWidgetProps> = ({ data, details, avs }) => {
  // Fetch operator addresses from pubkey endpoint once
  const { data: pubkeysResponse } = useSWR<AxiosResponse<PubKeyData[]>>(
    'pubkey',
    () => apiFetch('pubkey', 'GET'),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0 // Disable polling completely
    }
  );

  const pubkeys = pubkeysResponse?.data;

  // Rest of the component remains the same...
  const uniqueOperators = pubkeys
    ? Array.from(new Set(pubkeys.map(item => item.public_key)))
    : [];

  const runningMachines = new Set(avs?.filter(a => a.avs_name).map(a => a.machine_id)).size;

  const runningNodes = avs?.filter(a => a.avs_name).length ?? 0;

  const unhealthyCount = avs?.filter(item => {
    if (!item.errors || item.errors.length === 0) return false;
    const significantErrors = item.errors.filter(error => error !== "NoMetrics");
    return significantErrors.length > 0;
  }).length ?? 0;

  return (
    <div className="grid grid-cols-4 gap-4">
      <WidgetItem
        title="AVS Nodes"
        description={`${runningNodes}`}
        to="/nodes?filter=running"
      />
      <WidgetItem
        title="Machines"
        description={`${runningMachines}`}
      />
      <WidgetItem
        title="Addresses"
        description={`${uniqueOperators.length}`}
        to="/overview"
        connected={true}
      />
      <WidgetItem
        title="Unhealthy"
        description={`${unhealthyCount}`}
        to="/nodes?filter=unhealthy"
        connected={false}
      />
    </div>
  );
}
