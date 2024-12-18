
import { DiskStatus } from "./data"

export interface VersionInfo {
  node_type: string;
  chain: string;
  latest_version: string;
  latest_version_digest: string;
  breaking_change_version: string | null;
  breaking_change_datetime: string | null;
}

export interface SystemMetrics {
  cores: number;
  cpu_usage: number;
  memory_info: {
    usage: number;
    free: number;
    status: string;
  };
  disk_info: {
    usage: number;
    free: number;
    status: string;
  };
}

export interface AVSInfo extends AVS {
  machineName?: string;
  machineStatus?: string;
  systemMetrics?: SystemMetrics;
}



export interface AVSInfoFull {
  machine_id: string;
  avs_name: string;
  avs_type: string;
  avs_version: string;
  chain: string;
  version_hash: string;
  operator_address: string;
  active_set: boolean;
  created_at: string;
  updated_at: string;
  uptime: number;
  performance_score: number;
  update_status: string;
  errors: string[];
}

export interface ConsolidatedMachine {
  machine_id: string;
  name: string;
  status: string;
  system_metrics: SystemMetrics;
  avs_list: AVSInfo[];
  errors: {
    NodeError: {
      name: string;
      node_type: string;
      errors: string[];
    };
  }[];
}





export interface MachinesStatus {
  total_machines: number,
  healthy_machines: string[],
  unhealthy_machines: string[],
  idle_machines: string[],
  updateable_machines: string[],
  erroring_machines: string[]
}


export interface MachineDetails {
  machine_id: string;
  name: string;
  status: string;
  system_metrics: {
    cores: number;
    cpu_usage: number;
    memory_info: {
      usage: number;
      free: number;
      status: string;
    };
    disk_info: {
      usage: number;
      free: number;
      status: string;
    };
  };
  avs_list: AVS[];
  errors: NodeError[];
}


export interface NodeError {
  NodeError: {
    name: string;
    node_type: string;
    errors: string[];
  };
}

export interface Response<T> {
  error: string[],
  result: T
}

export interface NodeInfo {
  "node_id": string,
  "name": "cpu_usage" | "disk_usage" | "uptime" | "ram_usage" | "free_space" | "running" | "eigen_rpc_request_total" | "eigen_performance_score" | "node_reachability_status",
  "value": number,
  "attributes": any,
  "created_at": string
}

export interface NodeDetail {
  "machine_id": string,
  "name": string,
  "status": "Idle" | "Healthy" | "Error" | "Unhealthy",
  "metrics": {
    "cpu_usage": number,
    "memory_info": {
      "usage": number,
      "free": number,
      "status": DiskStatus
    },
    "disk_info": {
      "usage": number,
      "free": number,
      "status": DiskStatus
    },
    "uptime": 1412452,
    "deployed_avs": {
      "name": string | null,
      "chain": string | null,
      "version": string | null,
      "active_set": string | null,
      "operator_id": string | null,
      "performance_score": number
    },
    "error": []
  },
  "last_checked": "2024-10-16T18:39:44.546848"
}

export interface AVS {
  machine_id: string;
  avs_name: string;
  avs_type: string;
  avs_version: string;
  chain: string | null;
  version_hash: string;
  operator_address: string | null;
  active_set: boolean;
  created_at: string;
  updated_at: string;
  uptime: number;
  performance_score: number;
  update_status: string;
  errors: string[];
}


export const avsFromJSON = (json: any): AVS[] => {
  return json.map((avs: any) => ({
    machine_id: avs.machine_id,
    avs_name: avs.avs_name,
    avs_type: avs.avs_type,
    avs_version: avs.avs_version,
    chain: avs.chain,
    version_hash: avs.version_hash,
    operator_address: avs.operator_address,
    active_set: avs.active_set,
    created_at: avs.created_at,
    updated_at: avs.updated_at,
    uptime: avs.uptime,
    performance_score: avs.performance_score,
    update_status: avs.update_status,
    errors: avs.errors
  }));
};
