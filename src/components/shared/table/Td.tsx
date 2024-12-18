import React, { useState } from "react";
import { ConditionalLink } from "../conditionalLink";
import arrowUpRight from "./../../../images/arrow-up-right.svg"
import { ConnectedIcon } from "../connectedIcon";
import { CheckedIcon } from "../checkedIcon";
import { DiskSpaceStatus } from "../diskSpaceStatus";
import { DiskStatus } from "../../../interfaces/data";

export type Chain = "holesky" | "ethereum" | null;


interface TdProps {
  isConnected?: boolean | null
  isChecked?: boolean
  diskStatus?: DiskStatus
  content?: string
  avs_type?: string
  to?: string
  children?: React.ReactNode;
  className?: string;
  score?: number | null;
  chain?: Chain;
  onChainSelect?: (chain: Chain) => void;
  address?: string;
  onAddressSubmit?: (address: string) => void;
  tooltip?: string;
  last_update?: string;
  addressOptions?: string[]
};

export const Td: React.FC<TdProps> = ({ content, avs_type, children, to, isConnected, isChecked, diskStatus, className, score = "", chain, onChainSelect, address, onAddressSubmit, tooltip, last_update, addressOptions = []}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const hoverClasses = to ? "hover:bg-widgetHoverBg" : "";
  const hasConnectedIcon = isConnected !== undefined;
  const hasCheckedIcon = isChecked !== undefined;
  const hasDiskStatus = diskStatus !== undefined;

const [isEditing, setIsEditing] = useState(false);
const [inputAddress, setInputAddress] = useState("");
const [showDropdown, setShowDropdown] = useState(false);

  return (
   <td className={`${className} h-[72px]`}>
     {content && (
       <ConditionalLink to={to}>
         <div className={`flex w-fit gap-1 rounded-lg p-2 ${hoverClasses}`}>
           <div className="text-sm text-white">{content}</div>
           {to && <img src={arrowUpRight} alt="chevron right" />}
         </div>
       </ConditionalLink>
     )}
     {hasConnectedIcon && <div className="flex justify-center"><ConnectedIcon isConnected={isConnected} /></div>}
          {hasCheckedIcon && <div className="flex justify-center"><CheckedIcon isChecked={isChecked} /></div>}
          {hasDiskStatus && <div className="flex justify-center"><DiskSpaceStatus status={diskStatus} /></div>}
     {score !== undefined && score !== 0 && (
       <div className="text-sm text-white">{score}</div>
     )}
     {onChainSelect && (
       <div className="relative">
         <button
           onClick={() => setDropdownOpen(!dropdownOpen)}
           className="flex items-center gap-2 rounded-lg p-2 text-sm text-gray-400 hover:bg-gray-800"
         >
           {chain || "Add"}
           <svg
             className="h-4 w-4"
             viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor"
             strokeWidth="2"
             strokeLinecap="round"
             strokeLinejoin="round"
           >
             <path d="M6 9l6 6 6-6"/>
           </svg>
         </button>
         {dropdownOpen && (
           <div className="absolute z-10 mt-1 w-32 rounded-lg bg-gray-800 shadow-lg">
             <div className="py-1">
               <button
                 className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700"
                 onClick={() => {
                   onChainSelect("holesky");
                   setDropdownOpen(false);
                 }}
               >
                 holesky
               </button>
               <button
                 className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700"
                 onClick={() => {
                   onChainSelect("ethereum");
                   setDropdownOpen(false);
                 }}
               >
                 ethereum
               </button>
             </div>
           </div>
         )}
       </div>
     )}

     {onAddressSubmit && (
  <div className="relative">
    {isEditing ? (
      <>
        <input
          className="bg-transparent border-b border-gray-400 px-2 text-sm text-white focus:outline-none"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onAddressSubmit(inputAddress);
              setIsEditing(false);
            }
          }}
          onFocus={() => setShowDropdown(true)}
          autoFocus
        />
        {showDropdown && addressOptions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg shadow-lg">
            {addressOptions.map(opt => (
              <button
                key={opt}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700"
                onClick={() => {
                  onAddressSubmit(opt);
                  setIsEditing(false);
                  setShowDropdown(false);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </>
    ) : (
      <button
        onClick={() => setIsEditing(true)}
        className="text-sm text-gray-400 hover:text-white"
      >
        {address || "Add"}
      </button>
    )}
  </div>
)}

      {children}
    </td>
  );
}
