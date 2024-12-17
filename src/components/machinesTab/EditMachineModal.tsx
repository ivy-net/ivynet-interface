import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { GroupBase, Props } from 'react-select';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { AxiosResponse } from "axios";
import useSWR from "swr";
import { toast } from "react-toastify";
import closeIcon from "./../../images/x-close.svg"
import { chains, getMessage, getChainLabel } from "../../utils/UiMessages";
import { MachineDetails } from "../../interfaces/responses";
import { apiFetch } from "../../utils";

interface EditMachineModalProps {}

interface OperatorData {
  organization_id: number;
  name: string;
  public_key: string;
}

interface SelectOption {
  value: string;
  label: string;
}

export const EditMachineModal: React.FC<EditMachineModalProps> = () => {
  const [selectedChain, setSelectedChain] = useState<SelectOption | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<SelectOption | null>(null);
  const [operatorName, setOperatorName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [operatorData, setOperatorData] = useState<OperatorData[]>([]);
  const navigate = useNavigate();

  const { avsName, machineId } = useParams();
  const apiFetcher = (url: string) => apiFetch(url, "GET");

  // Fetch machine details
  const machineResponse = useSWR<AxiosResponse<MachineDetails>, any>(`machine/${machineId}`, apiFetcher);
  const machine = machineResponse.data?.data;
  const avs = machine?.avs_list.find(avs => avs.avs_name === avsName);

  // Fetch operator addresses from pubkey endpoint
  const pubkeysResponse = useSWR<AxiosResponse<OperatorData[]>, any>('pubkey', apiFetcher);

  useEffect(() => {
    if (pubkeysResponse.data?.data) {
      // Create unique address-name pairs by filtering out duplicates
      const uniqueOperators = pubkeysResponse.data.data.reduce((acc, curr) => {
        const existingOperator = acc.find(op => op.public_key === curr.public_key);
        if (!existingOperator) {
          acc.push(curr);
        }
        return acc;
      }, [] as OperatorData[]);

      setOperatorData(uniqueOperators);

      // If current AVS has an operator_address, select it and its corresponding name
      if (avs?.operator_address) {
        const operatorEntry = uniqueOperators.find(
          entry => entry.public_key === avs.operator_address
        );
        if (operatorEntry) {
          setSelectedAddress({
            value: operatorEntry.public_key,
            label: operatorEntry.public_key
          });
          setOperatorName(operatorEntry.name);
        }
      }
    }
  }, [pubkeysResponse.data, avs]);

  useEffect(() => {
    if (avs?.chain) {
      setSelectedChain({
        value: avs.chain || "",
        label: getChainLabel(avs.chain)
      });
    }
  }, [avs]);

  // When an existing address is selected, auto-populate the name
  const handleAddressChange = (option: SelectOption | null) => {
    setSelectedAddress(option);
    if (option) {
      const operatorEntry = operatorData.find(
        entry => entry.public_key === option.value
      );
      if (operatorEntry) {
        setOperatorName(operatorEntry.name);
      } else {
        setOperatorName(""); // Clear name if new address
      }
    } else {
      setOperatorName("");
    }
  };

  const addNewPubKey = async (publicKey: string, name: string) => {
    try {
      const baseUrl = `${process.env.REACT_APP_API_ENDPOINT}/pubkey`;
      const url = new URL(baseUrl);
      url.searchParams.set('public_key', publicKey.trim());
      url.searchParams.set('name', name.trim());

      await apiFetch(url.toString(), "POST");
      await pubkeysResponse.mutate();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to add public key';
      toast.error(errorMessage, { theme: "dark" });
      throw err;
    }
  };

  const editMachine = async (machineId: string, avsName: string, chain: string, address: string) => {
    try {
      setIsSubmitting(true);

      // If this is a new address, add it to pubkey endpoint first
      const isNewAddress = !operatorData.some(entry => entry.public_key === address);
      if (isNewAddress && operatorName) {
        await addNewPubKey(address, operatorName);
      }

      // Update the machine with address, chain, and AVS name
      const url = `machine/${machineId}`;
      const urlObj = new URL(`${process.env.REACT_APP_API_ENDPOINT}/${url}`);
      urlObj.searchParams.set("avs_name", avsName);
      urlObj.searchParams.set("chain", chain);
      urlObj.searchParams.set("operator_address", address);

      await apiFetch(urlObj.toString(), "PUT");
      toast.success(getMessage("MachineEditedMessage"), { theme: "dark" });
      navigate("/machines", { state: { refetch: true } });
    } catch (err) {
      toast.error("Failed to update machine", { theme: "dark" });
    } finally {
      setIsSubmitting(false);
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

  const isValid = selectedChain && selectedAddress &&
    (operatorName || operatorData.some(entry => entry.public_key === selectedAddress.value));

    return (
    <div className="fixed left-0 top-0 w-screen h-screen flex justify-center items-center bg-black/[0.8]">
      <div className="flex flex-col bg-widgetBg w-[730px] rounded-xl p-8 gap-10">
        <div className="flex items-center">
          <h2>Add Address Details</h2>
          <Link to="/machines" relative="path" className="ml-auto">
            <img src={closeIcon} alt="close icon" />
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="text-md leading-5 font-lg text-ivygrey">Chain</div>
              <Select
                value={selectedChain}
                onChange={(value) => setSelectedChain(value)}
                options={chains}
                styles={selectStyles}
                isDisabled={isSubmitting}
                placeholder="Select a chain..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="text-md leading-5 font-lg text-ivygrey">Operator Name</div>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="bg-transparent border border-gray-600 rounded-lg p-2 text-gray-400 placeholder-[#667085]"
                placeholder="Enter operator name..."
                disabled={isSubmitting || (selectedAddress?.value ? operatorData.some(entry => entry.public_key === selectedAddress.value) : false)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="text-md leading-5 font-lg text-ivygrey">Operator Address</div>
              <CreatableSelect<SelectOption>
                value={selectedAddress}
                onChange={handleAddressChange}
                options={operatorData.map(entry => ({
                  value: entry.public_key,
                  label: `${entry.public_key} | ${entry.name}`
                }))}
                styles={{
                  ...selectStyles,
                  option: (baseStyles: any, state: any) => ({
                    ...baseStyles,
                    backgroundColor: state.isSelected ? '#374151' : 'transparent',
                    color: '#667085',
                    '&:hover': {
                      backgroundColor: '#4B5563',
                    },
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }),
                  singleValue: (baseStyles: any) => ({
                    ...baseStyles,
                    color: '#667085',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }),
                }}
                isDisabled={isSubmitting}
                isClearable
                placeholder="Select or enter an operator address..."
              />
            </div>
          </div>
        </div>
        <div className="flex gap-4 ml-auto">
          <Link to="/machines" relative="path">
            <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textPrimary">
              Cancel
            </div>
          </Link>
          <button
            disabled={!isValid || isSubmitting}
            onClick={() => machine && editMachine(
              machine.machine_id,
              avs?.avs_name || "",
              selectedChain?.value || "",
              selectedAddress?.value || ""
            )}
            className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textPrimary disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
