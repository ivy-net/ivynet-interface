import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import closeIcon from "./../../images/x-close.svg"
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { chains, getChainLabel, getMessage } from "../../utils/UiMessages";
import { apiFetch } from "../../utils";
import { AxiosResponse } from "axios";
import useSWR from "swr";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface EditKeysModalProps {
}

interface OperatorAddress {
  value: string;
  label: string;
}

interface AvsOption {
  value: string;
  label: string;
  chain?: string;
  machineId?: string;
}

export const EditKeysModal: React.FC<EditKeysModalProps> = () => {
  const [selectedChain, setSelectedChain] = useState<{ value: string; label: string; } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<OperatorAddress | null>(null);
  const [selectedAvs, setSelectedAvs] = useState<AvsOption | null>(null);
  const [operatorAddresses, setOperatorAddresses] = useState<OperatorAddress[]>([]);
  const [avsOptions, setAvsOptions] = useState<AvsOption[]>([]);
  const navigate = useNavigate();

  const apiFetcher = (url: string) => apiFetch(url, "GET");
  const avsResponse = useSWR<AxiosResponse<any[]>, any>('avs', apiFetcher);

  useEffect(() => {
    if (avsResponse.data?.data) {
      // Create options list from AVS data, including operator addresses and machine IDs
      const addresses = new Set<string>();
      const avsOptionsList = avsResponse.data.data.map((avs: any) => {
        if (avs.operator_address) {
          addresses.add(avs.operator_address);
        }
        return {
          value: avs.avs_name,
          label: avs.avs_name,
          chain: avs.chain,
          machineId: avs.machine_id
        };
      });

      // Set operator addresses for the dropdown
      const addressOptions = Array.from(addresses).map(address => ({
        value: address,
        label: address
      }));
      setOperatorAddresses(addressOptions);

      setAvsOptions(avsOptionsList);
    }
  }, [avsResponse.data]);

  useEffect(() => {
    if (selectedAvs?.chain && !selectedChain) {
      const chainLabel = getChainLabel(selectedAvs.chain);
      setSelectedChain({
        value: selectedAvs.chain,
        label: chainLabel || selectedAvs.chain
      });
    }
  }, [selectedAvs]);

  const editKeys = async (machineId: string, avsName: string, chain: string, address: string) => {
    const url = `machine/${machineId}`;
    const urlObj = new URL(`${process.env.REACT_APP_API_ENDPOINT}/${url}`);
    urlObj.searchParams.set("avs_name", avsName);
    urlObj.searchParams.set("chain", chain);
    urlObj.searchParams.set("operator_address", address);
    const fetchUrl = urlObj.toString();
    try {
      await apiFetch(fetchUrl, "PUT");
      toast.success(getMessage("MachineEditedMessage"), { theme: "dark" });
      navigate("/machines", { state: { refetch: true } });
    } catch (err) {
      toast.error("Failed to update machine", { theme: "dark" });
    }
  };

  const selectStyles = {
    control: (baseStyles: any, state: any) => ({
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
    option: (baseStyles: any, state: any) => ({
      ...baseStyles,
      backgroundColor: state.isSelected ? '#374151' : 'transparent',
      color: '#667085',
      '&:hover': {
        backgroundColor: '#4B5563',
      },
    }),
    singleValue: (baseStyles: any) => ({
      ...baseStyles,
      color: '#667085',
    }),
    input: (baseStyles: any) => ({
      ...baseStyles,
      color: '#667085',
    }),
    menu: (baseStyles: any) => ({
      ...baseStyles,
      backgroundColor: '#1F2937',
      borderRadius: '0.5rem',
    }),
  };

  return (
    <div className="fixed left-0 top-0 w-screen h-screen flex justify-center items-center bg-black/[0.8]">
      <div className="flex flex-col bg-widgetBg w-[730px] rounded-xl p-8 gap-10">
        <div className="flex items-center">
          <h2>Edit Keys</h2>
          <div onClick={() => navigate(-1)} className="ml-auto cursor-pointer">
            <img src={closeIcon} alt="close icon" />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <div className="text-sm leading-5 font-medium text-ivygrey">AVS Name</div>
            <Select
              value={selectedAvs}
              onChange={(value) => {
                setSelectedAvs(value as AvsOption);
                setSelectedChain(null);
              }}
              options={avsOptions}
              styles={selectStyles}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="text-sm leading-5 font-medium text-ivygrey">Chain</div>
            <Select
              value={selectedChain}
              onChange={(value) => setSelectedChain(value as { value: string; label: string; } | null)}
              options={chains}
              styles={selectStyles}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="text-sm leading-5 font-medium text-ivygrey">Operator Address</div>
            <CreatableSelect
              value={selectedAddress}
              onChange={(value) => setSelectedAddress(value as OperatorAddress)}
              options={operatorAddresses}
              styles={selectStyles}
              isClearable
              placeholder="Select or enter an operator address..."
              formatCreateLabel={(inputValue) => `Use address: ${inputValue}`}
            />
          </div>
        </div>

        <div className="flex gap-4 ml-auto">
          <div
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textPrimary cursor-pointer"
          >
            Cancel
          </div>
          <div
            onClick={() => {
              if (selectedAvs?.value && selectedChain?.value && selectedAddress?.value) {
                // Use the machine_id from selectedAvs instead of the AVS name
                const machineId = selectedAvs.machineId;
                if (machineId) {
                  editKeys(
                    machineId,
                    selectedAvs.value,
                    selectedChain.value,
                    selectedAddress.value
                  );
                } else {
                  toast.error("Could not find machine ID for this AVS", { theme: "dark" });
                }
              } else {
                toast.error("Please fill in all fields", { theme: "dark" });
              }
            }}
            className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textPrimary cursor-pointer"
          >
            Save Changes
          </div>
        </div>
      </div>
    </div>
  );
}
