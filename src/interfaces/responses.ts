import { DiskStatus } from "./data"

export interface MachinesStatus {
  total_machines: number,
  healthy_machines: string[],
  unhealthy_machines: string[],
  idle_machines: string[],
  updateable_machines: string[],
  erroring_machines: string[]
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
  "status": "Idle" | "Healthy"| "Error"| "Unhealthy",
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