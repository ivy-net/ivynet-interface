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
  // Fetch operator addresses from pubkey endpoint
  const { data: pubkeysResponse } = useSWR<AxiosResponse<PubKeyData[]>>(
    'pubkey',
    () => apiFetch('pubkey', 'GET')
  );

  const pubkeys = pubkeysResponse?.data;

  // Get unique operators from pubkey endpoint instead of AVS data
  const uniqueOperators = pubkeys
    ? Array.from(new Set(pubkeys.map(item => item.public_key)))
    : [];

  // Get the number of unique machines that have running AVS
  const runningMachines = new Set(avs?.filter(a => a.avs_name).map(a => a.machine_id)).size;

  // Get the total number of running AVS nodes
  const runningNodes = avs?.filter(a => a.avs_name).length ?? 0;

  // Get the number of AVS in active set
  const activeSetCount = avs?.filter(item => item.active_set === true).length ?? 0;

  // Get the number of unhealthy AVS
  const unhealthyCount = avs?.filter(item => item.errors && item.errors.length > 0).length ?? 0;

  return (
    <div className="grid grid-cols-4 gap-4">
      <WidgetItem
        title="AVS Nodes"
        description={`${runningNodes}`}
        to="/machines?filter=running"
      />
      <WidgetItem
        title="Machines"
        description={`${runningMachines}`}
        to="/machines?filter=running"
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
        to="/machines?filter=unhealthy"
        connected={false}
      />
    </div>
  );
}
