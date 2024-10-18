import { NodeInfo } from "./responses"

export interface NodeData {
  id: string
  cpu_usage: number | undefined
  disk_usage: number | undefined
  uptime: number | undefined
  ram_usage: number | undefined
  free_space: number | undefined
  running: number | undefined
  eigen_rpc_request_total: number | undefined
  eigen_performance_score: number | undefined
  node_reachability_status: number | undefined
}

export const nodeDataFromJSON = (id: string, json: NodeInfo[]): NodeData => {
  return {
    id,
    cpu_usage: json.find(e => e.name === "cpu_usage")?.value,
    disk_usage: json.find(e => e.name === "disk_usage")?.value,
    uptime: json.find(e => e.name === "uptime")?.value,
    ram_usage: json.find(e => e.name === "ram_usage")?.value,
    free_space: json.find(e => e.name === "free_space")?.value,
    running: json.find(e => e.name === "running")?.value,
    eigen_rpc_request_total: json.find(e => e.name === "eigen_rpc_request_total")?.value,
    eigen_performance_score: json.find(e => e.name === "eigen_performance_score")?.value,
    node_reachability_status: json.find(e => e.name === "node_reachability_status")?.value,
  }
}

export type DiskStatus = "Warning" | "Critical" | "Healthy"