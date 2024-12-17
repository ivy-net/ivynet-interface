import React, { useState } from "react";
import { Link } from "react-router-dom";
import closeIcon from "./../../images/x-close.svg"
import Select from 'react-select';


interface AddUserModalProps {
}

export const AddUserModal: React.FC<AddUserModalProps> = () => {
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
        {/* <div className="flex items-start">
          <Link to="/settings" relative="path" className="ml-auto">
            <img src={closeIcon} alt="close icon" />
          </Link>
        </div> */}
        <div className="flex items-center">
          <h2>Add Member</h2>
          <Link to="/organization" relative="path" className="ml-auto">
            <img src={closeIcon} alt="close icon" />
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="text-sm leading-5 font-medium text-ivygrey">E-Mail</div>
              <input className="bg-transparent border border-textGrey py-2.5 px-3 rounded-lg outline-none focus:border-white text-ivygrey2 text-base font-normal" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-sm leading-5 font-medium text-ivygrey">Role</div>
              <Select
                defaultValue={selectedOption}
                onChange={(value) => setSelectedOption(value as { value: string; label: string; } | null)}
                options={roles}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    backgroundColor: 'transparent',
                    borderColor: state.isFocused ? 'white' : '#6B7280',
                    borderRadius: '0.5rem',
                    padding: '0.25rem 0',
                    '&:hover': {
                      borderColor: 'white',
                    },
                    boxShadow: 'none',
                  }),
                  option: (baseStyles, state) => ({
                    ...baseStyles,
                    backgroundColor: state.isSelected ? '#374151' : 'transparent',
                    color: '#667085',
                    '&:hover': {
                      backgroundColor: '#4B5563',
                    },
                  }),
                  singleValue: (baseStyles) => ({
                    ...baseStyles,
                    color: '#667085',
                  }),
                  input: (baseStyles) => ({
                    ...baseStyles,
                    color: '#667085',
                  }),
                  menu: (baseStyles) => ({
                    ...baseStyles,
                    backgroundColor: '#1F2937',
                    borderRadius: '0.5rem',
                  }),
                }}
              />
            </div>
          </div>
        </div>
        {/* <div className="border-t-[1px] border-white/10"></div> */}
        {/* <MachineRequirements /> */}
        <div className="flex gap-4 ml-auto">
          <Link to="/organization" relative="path">
            <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textPrimary">Add Member</div>
          </Link>
        </div>
      </div>
    </div >
  );
}
