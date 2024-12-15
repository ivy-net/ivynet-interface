import React, { ChangeEventHandler, useState } from "react";
import searchIcon from "./../../../images/search-icon.svg";

interface SearchBarProps {
  onSearch?: (term: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch = () => {} }) => {
  const [term, setTerm] = useState("");
  const [expanded, setExpanded] = useState(false);

  const conditionalHover = expanded ? "" : "hover:bg-textGrey";

  const expand = () => {
    setExpanded(true);
  };

  const minimize = () => {
    if (!term) {
      setExpanded(false);
    }
  };

  const change: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newTerm = event.currentTarget.value;
    setTerm(newTerm);
    onSearch(newTerm);
  };

  const clearSearch = () => {
    setTerm("");
    onSearch("");
    setExpanded(false);
  };

  return (
    <div
      onClick={expand}
      className={`border border-iconBorderColor p-2.5 rounded-lg h-10 leading-5 cursor-pointer ${conditionalHover}`}
    >
      <div className="flex justify-center items-center gap-2">
        {expanded && (
          <>
            <input
              autoFocus
              onBlur={minimize}
              className="bg-transparent outline-none text-textSecondary w-48"
              value={term}
              onChange={change}
              placeholder="Search AVS here..."
            />
            {term && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearSearch();
                }}
                className="text-textSecondary hover:text-white"
              >
                ✕
              </button>
            )}
          </>
        )}
        <img src={searchIcon} alt="search bar" />
      </div>
    </div>
  );
};
