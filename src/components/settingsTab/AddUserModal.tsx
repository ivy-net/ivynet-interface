import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import closeIcon from "./../../images/x-close.svg"
import Select from 'react-select';
import { apiFetch } from "../../utils/";
import { toast } from "react-toastify";

interface AddUserModalProps {
}

type ValidRole = 'Owner' | 'Admin' | 'User' | 'Reader';

export const AddUserModal: React.FC<AddUserModalProps> = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = [
    { value: 'Admin' as ValidRole, label: 'Admin' },
//    { value: 'Owner' as ValidRole, label: 'Owner' },
    { value: 'User' as ValidRole, label: 'User' },
    { value: 'Reader' as ValidRole, label: 'Reader' },
  ];
  
  const [selectedOption, setSelectedOption] = useState<{ value: ValidRole; label: string; } | null>(null);

  const handleSubmit = async () => {
    if (!email || !selectedOption) {
      toast.error("Please fill in all fields", { theme: "dark" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Add debug logs
      console.log('Selected option:', selectedOption);
      console.log('Selected role value:', selectedOption.value);
      
      const requestData = {
        email,
        role: selectedOption.value
      };

      console.log('Sending request with data:', requestData);
      console.log('Role type:', typeof requestData.role);

      await apiFetch("organization/invite", "POST", requestData);
      
      toast.success("Team member invited successfully", { theme: "dark" });
      navigate("..");
    } catch (error) {
      console.error("Failed to invite team member:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed left-0 top-0 w-screen h-screen flex justify-center items-center bg-black/[0.8]">
      <div className="flex flex-col bg-widgetBg w-[730px] rounded-xl p-8 gap-10">
        <div className="flex items-center">
          <h2>Add Team Member</h2>
          <Link to=".." relative="path" className="ml-auto">
            <img src={closeIcon} alt="close icon" />
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="text-sm leading-5 font-medium text-ivygrey">E-Mail</div>
              <input 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border border-textGrey py-2.5 px-3 rounded-lg outline-none focus:border-white text-ivygrey2 text-base font-normal" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-sm leading-5 font-medium text-ivygrey">Role</div>
              <Select
  value={selectedOption}
  onChange={(value) => {
    if (value) {
      // Force the correct capitalization
      const properCaseValue = value.value.charAt(0).toUpperCase() + value.value.slice(1).toLowerCase();
      setSelectedOption({
        value: properCaseValue as ValidRole,
        label: value.label
      });
    } else {
      setSelectedOption(null);
    }
  }}
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
        <div className="flex gap-4 ml-auto">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textPrimary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Adding..." : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}