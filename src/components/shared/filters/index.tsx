import React from "react";
import { useSearchParams } from "react-router-dom";
import { SearchBar } from "../searchBar";

interface Filter {
  label: string;
  query: string;
}

interface FiltersProps {
  filters: Filter[];
  children?: React.ReactNode;
};

export const Filters: React.FC<FiltersProps> = ({ filters, children }) => {
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
      <div className="flex gap-4">
        {/* <SearchBar /> */}
        {children}
      </div>
    </div>
  );
}
