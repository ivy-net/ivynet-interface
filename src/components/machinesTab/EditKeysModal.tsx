import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GroupBase, Props } from 'react-select';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { AxiosResponse } from "axios";
import useSWR from "swr";
import { toast } from "react-toastify";
import closeIcon from "./../../images/x-close.svg";
import { chains, getMessage, getChainLabel } from "../../utils/UiMessages";
import { apiFetch } from "../../utils";

interface EditKeysModalProps {}

interface OperatorData {
  organization_id: number;
  name: string;
  public_key: string;
}

interface AvsOption {
  value: string;
  label: string;
  chain?: string;
  machineId?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

export const EditKeysModal: React.FC<EditKeysModalProps> = () => {
  const [selectedChain, setSelectedChain] = useState<SelectOption | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<SelectOption | null>(null);
  const [selectedAvs, setSelectedAvs] = useState<AvsOption | null>(null);
  const [operatorName, setOperatorName] = useState<string>("");
  const [operatorData, setOperatorData] = useState<OperatorData[]>([]);
  const [avsOptions, setAvsOptions] = useState<AvsOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const apiFetcher = (url: string) => apiFetch(url, "GET");
  const avsResponse = useSWR<AxiosResponse<any[]>, any>('avs', apiFetcher);
  const pubkeysResponse = useSWR<AxiosResponse<OperatorData[]>, any>('pubkey', apiFetcher);

  useEffect(() => {
    if (avsResponse.data?.data) {
      const avsOptionsList = avsResponse.data.data.map((avs: any) => ({
        value: avs.avs_name,
        label: avs.avs_name,
        chain: avs.chain,
        machineId: avs.machine_id
      }));
      setAvsOptions(avsOptionsList);
    }
  }, [avsResponse.data]);

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
    }
  }, [pubkeysResponse.data]);

  useEffect(() => {
    if (selectedAvs) {
      // Auto-populate chain if it exists
      if (selectedAvs.chain) {
        setSelectedChain({
          value: selectedAvs.chain,
          label: getChainLabel(selectedAvs.chain)
        });
      }

      // Fetch the machine details to get operator address
      const fetchMachineDetails = async () => {
        if (!selectedAvs.machineId) return;

        try {
          const response = await apiFetch(`machine/${selectedAvs.machineId}`, "GET");
          const machineData = response.data;

          // Find the specific AVS in the machine's AVS list
          const avsData = machineData.avs_list.find(
            (avs: any) => avs.avs_name === selectedAvs.value
          );

          // If there's an operator address, set it and find its name
          if (avsData?.operator_address) {
            // Set the address
            setSelectedAddress({
              value: avsData.operator_address,
              label: avsData.operator_address
            });

            // Find and set the operator name from our operator data
            const operatorEntry = operatorData.find(
              entry => entry.public_key === avsData.operator_address
            );
            if (operatorEntry) {
              setOperatorName(operatorEntry.name);
            }
          }
        } catch (err) {
          console.error('Error fetching machine details:', err);
        }
      };

      fetchMachineDetails();
    }
  }, [selectedAvs, operatorData]);

  const handleAddressChange = (option: SelectOption | null) => {
    setSelectedAddress(option);
    if (option) {
      const operatorEntry = operatorData.find(
        entry => entry.public_key === option.value
      );
      if (operatorEntry) {
        setOperatorName(operatorEntry.name);
        // Update the selectedAddress with the combined format
        setSelectedAddress({
          value: option.value,
          label: `${option.value} | ${operatorEntry.name}`
        });
      } else {
        setOperatorName(""); // Clear name if new address
        // For new addresses, just use the address as the label until a name is provided
        setSelectedAddress({
          value: option.value,
          label: option.value
        });
      }
    } else {
      setOperatorName("");
      setSelectedAddress(null);
    }
  };

  const validateAddress = (address: string): boolean => {
    if (!address || address.trim() === '') {
      toast.error("Operator address cannot be empty", { theme: "dark" });
      return false;
    }

    const trimmedAddress = address.trim();
    if (!trimmedAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error("Invalid Ethereum address format", { theme: "dark" });
      return false;
    }

    return true;
  };

  const addNewPubKey = async (publicKey: string, name: string) => {
    if (!validateAddress(publicKey)) {
      return false;
    }

    try {
      const baseUrl = `${process.env.REACT_APP_API_ENDPOINT}/pubkey`;
      const url = new URL(baseUrl);
      url.searchParams.set('public_key', publicKey.trim());
      url.searchParams.set('name', name.trim());

      await apiFetch(url.toString(), "POST");
      await pubkeysResponse.mutate();
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to add public key';
      toast.error(errorMessage, { theme: "dark" });
      return false;
    }
  };

  const editKeys = async (machineId: string, avsName: string, chain: string, address: string) => {
    if (!validateAddress(address)) {
      return;
    }

    try {
      setIsSubmitting(true);
      const trimmedAddress = address.trim();

      // If this is a new address, add it to pubkey endpoint first
      const isNewAddress = !operatorData.some(entry => entry.public_key === trimmedAddress);
      if (isNewAddress && operatorName) {
        const success = await addNewPubKey(trimmedAddress, operatorName);
        if (!success) {
          return;
        }
      }

      // Update the machine
      const url = `machine/${machineId}`;
      const urlObj = new URL(`${process.env.REACT_APP_API_ENDPOINT}/${url}`);
      urlObj.searchParams.set("avs_name", avsName);
      urlObj.searchParams.set("chain", chain);
      urlObj.searchParams.set("operator_address", trimmedAddress);

      await apiFetch(urlObj.toString(), "PUT");
      toast.success(getMessage("MachineEditedMessage"), { theme: "dark" });
      navigate("/machines", { state: { refetch: true } });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to update machine';
      toast.error(errorMessage, { theme: "dark" });
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

  const isValid = selectedAvs && selectedChain && selectedAddress &&
    (operatorName || operatorData.some(entry => entry.public_key === selectedAddress.value));

//    const truncateAddress = (address: string) => {
//      if (address.length <= 13) return address;
//      return `${address.slice(0, 6)}...${address.slice(-4)}`;
//    };

    // The return statement should look like this:
  return (
      <div className="fixed left-0 top-0 w-screen h-screen flex justify-center items-center bg-black/[0.8]">
        <div className="flex flex-col bg-widgetBg w-[730px] rounded-xl p-8 gap-10">
          <div className="flex items-center">
            <h2>Add Address Details</h2>
            <div onClick={() => !isSubmitting && navigate(-1)} className="ml-auto cursor-pointer">
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
                isDisabled={isSubmitting}
                placeholder="Select an AVS..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="text-sm leading-5 font-medium text-ivygrey">Chain</div>
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
              <div className="text-sm leading-5 font-medium text-ivygrey">Operator Address</div>
              <CreatableSelect<SelectOption>
              value={selectedAddress ? {
                value: selectedAddress.value,
                label: `${(selectedAddress.value)} | ${operatorName}`
              } : null}
              onChange={handleAddressChange}
              options={operatorData.map(entry => ({
                value: entry.public_key,
                label: `${(entry.public_key)} | ${entry.name}`
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

            {selectedAddress && !operatorData.some(entry => entry.public_key === selectedAddress.value) && (
              <div className="flex flex-col gap-1.5">
                <div className="text-sm leading-5 font-medium text-ivygrey">Operator Name</div>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="bg-transparent border border-gray-600 rounded-lg p-2 text-gray-400"
                  placeholder="Enter operator name..."
                  disabled={isSubmitting}
                />
              </div>
            )}
            {selectedAddress && operatorData.some(entry => entry.public_key === selectedAddress.value) && (
              <div className="flex flex-col gap-1.5">
                <div className="text-sm leading-5 font-medium text-ivygrey">Operator Name</div>
                <div className="p-2 text-gray-400">
                  {operatorName}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 ml-auto">
            <div
              onClick={() => !isSubmitting && navigate(-1)}
              className={`px-4 py-2 rounded-lg bg-bgButton text-textPrimary
                ${!isSubmitting ? 'hover:bg-textGrey cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            >
              Cancel
            </div>
            <button
              disabled={!isValid || isSubmitting}
              onClick={() => {
                if (!selectedAvs?.machineId || !selectedAvs.value || !selectedChain?.value || !selectedAddress?.value) {
                  toast.error("Please fill in all fields", { theme: "dark" });
                  return;
                }

                editKeys(
                  selectedAvs.machineId,
                  selectedAvs.value,
                  selectedChain.value,
                  selectedAddress.value
                );
              }}
              className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textPrimary disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    )};
