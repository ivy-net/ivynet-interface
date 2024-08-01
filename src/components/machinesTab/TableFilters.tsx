import React from "react";
import { Link, useSearchParams } from "react-router-dom";

interface TableFiltersProps {
};

export const TableFilters: React.FC<TableFiltersProps> = ({ }) => {
  const filters = [
    { label: "All Nodes", query: "all" },
    { label: "Needs Upgrade", query: "upgrade" },
    { label: "AVS Activation", query: "activation" },
    { label: "Idle Nodes", query: "idle" }];

  const [searchParams, setSearchParams] = useSearchParams();

  const selectFilter = (query: string) => {
    if (query === filters[0].query) {
      setSearchParams({}, { replace: true });
    }
    else {
      setSearchParams({ filter: query }, { replace: true })
    }
  }

  const isSelected = (query: string) => {
    const filterParam = searchParams.get("filter")
    if (!filterParam) {
      return query === filters[0].query;
    }

    return query === filterParam;
  }

  return (
    <div className="flex items-center">
      <div className="flex gap-6">
        {filters.map((filter) => <div key={filter.query} className={`cursor-pointer text-base text-sidebarColor font-medium leading-5 hover:text-white ${isSelected(filter.query) ? "text-white underline underline-offset-8" : ""}`} onClick={() => selectFilter(filter.query)}>{filter.label}</div>)}
      </div>
      <div className="ml-auto">

      </div>
      <Link to="install/client" relative="path">
        <div className="px-4 py-2.5 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary">Install Client</div>
      </Link>
    </div>
  );
}
