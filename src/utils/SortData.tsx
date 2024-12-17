interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc' | 'none';
}

export const sortData = <T extends Record<string, any>>(
  data: T[],
  sortConfig: SortConfig
): T[] => {
  if (!sortConfig.key || sortConfig.direction === 'none') return data;
  return [...data].sort((a, b) => {
    let aValue = a[sortConfig.key!];
    let bValue = b[sortConfig.key!];
    // Handle special cases
    if (sortConfig.key === 'avs_name' || sortConfig.key === 'avs_type' || sortConfig.key === 'chain') {
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
    } else if (sortConfig.key === 'performance_score') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    } else if (sortConfig.key === 'updated_at') {
      aValue = new Date(aValue || 0).getTime();
      bValue = new Date(bValue || 0).getTime();
    } else if (sortConfig.key === 'errors') {
      aValue = Array.isArray(aValue) ? aValue.length : 0;
      bValue = Array.isArray(bValue) ? bValue.length : 0;
    }
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
};
