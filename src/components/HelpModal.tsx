import React, { useState } from "react";
import { Link } from "react-router-dom";
import closeIcon from "../images/x-close.svg"
import Select from 'react-select';
import { getMessage } from "../utils/UiMessages";


interface HelpModalProps {
};

export const HelpModal: React.FC<HelpModalProps> = () => {
  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'owner', label: 'Owner' },
    { value: 'write', label: 'Write' },
    { value: 'read', label: 'Read' },
  ];
  const [selectedOption, setSelectedOption] = useState<{ value: string; label: string; } | null>(null);

  return (
    <div className="fixed left-0 top-0 w-screen h-screen flex justify-center items-center bg-black/[0.8]">
      <div className="flex flex-col bg-widgetBg w-[730px] rounded-xl p-8 gap-10">
        <div className="flex items-center">
          <h2>Help</h2>
          <Link to=".." relative="path" className="ml-auto">
            <img src={closeIcon} alt="close icon" />
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="text-sm leading-5 font-medium text-ivygrey">{getMessage("HelpMessage")}</div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
