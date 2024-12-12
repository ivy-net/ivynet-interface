import React, { ChangeEventHandler, useState } from "react";
import searchIcon from "./../../../images/search-icon.svg";

interface SearchBarProps {
  onSearch?: (term: string) => void;  // Make it optional with ?
};

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch = () => {} }) => {  // Provide default empty function
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

  return (
    <>
      <div onClick={expand} className={`border border-iconBorderColor p-2.5 rounded-lg h-10 leading-5 cursor-pointer ${conditionalHover}`}>
        <div className="flex justify-center items-center gap-2">
          {expanded && <input autoFocus onBlur={minimize} className="bg-transparent outline-none" value={term} onChange={change} />}
          <img src={searchIcon} alt="search bar" />
        </div>
      </div>
    </>
  );
};
