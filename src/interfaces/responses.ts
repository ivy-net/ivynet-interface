export interface MachinesStatus {
  total_machines: number,
  healthy_machines: number,
  unhealthy_machines: string[],
  idle_machines: string[],
  updateable_machines: string[],
  erroring_machines: string[]
}

export interface Response<T> {
  error: string[],
  result: T
}