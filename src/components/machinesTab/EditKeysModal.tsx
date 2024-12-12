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

interface PubKeyData {
  public_key: string;
  name: string;
}

export const EditKeysModal: React.FC<EditKeysModalProps> = () => {
  const [selectedChain, setSelectedChain] = useState<{ value: string; label: string; } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<OperatorAddress | null>(null);
  const [selectedAvs, setSelectedAvs] = useState<AvsOption | null>(null);
  const [operatorAddresses, setOperatorAddresses] = useState<OperatorAddress[]>([]);
  const [avsOptions, setAvsOptions] = useState<AvsOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const apiFetcher = (url: string) => apiFetch(url, "GET");
  const avsResponse = useSWR<AxiosResponse<any[]>, any>('avs', apiFetcher);
  const pubkeysResponse = useSWR<AxiosResponse<PubKeyData[]>, any>('pubkey', apiFetcher);

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
      const addressOptions = pubkeysResponse.data.data.map((pubkey: PubKeyData) => ({
        value: pubkey.public_key,
        label: pubkey.public_key
      }));
      setOperatorAddresses(addressOptions);
    }
  }, [pubkeysResponse.data]);

  useEffect(() => {
    if (selectedAvs?.chain && !selectedChain) {
      const chainLabel = getChainLabel(selectedAvs.chain);
      setSelectedChain({
        value: selectedAvs.chain,
        label: chainLabel || selectedAvs.chain
      });
    }
  }, [selectedAvs]);

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

  const addNewPubKey = async (publicKey: string): Promise<boolean> => {
      if (!validateAddress(publicKey)) {
        return false;
      }

      const trimmedAddress = publicKey.trim();

      try {
        // Build URL with query parameters
        const baseUrl = `${process.env.REACT_APP_API_ENDPOINT}/pubkey`;
        const url = new URL(baseUrl);
        url.searchParams.set('public_key', trimmedAddress);
        url.searchParams.set('name', 'operator'); // Providing a default name since it's required

        console.log('Making pubkey POST request to:', url.toString());

        await apiFetch(url.toString(), "POST");
        await pubkeysResponse.mutate();
        return true;
      } catch (err: any) {
        console.error('Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        });

        const errorMessage = err.response?.data?.error || 'Failed to add public key';
        toast.error(errorMessage, { theme: "dark" });
        return false;
      }
    };
    
const editKeys = async (machineId: string, avsName: string, chain: string, address: string) => {
  if (!validateAddress(address)) {
    return;
  }

  setIsSubmitting(true);

  try {
    const trimmedAddress = address.trim();

    // If this is a new address, add it to pubkey endpoint first
    const isNewAddress = !operatorAddresses.some(opt => opt.value === trimmedAddress);
    if (isNewAddress) {
      console.log('Adding new pubkey:', trimmedAddress);
      const success = await addNewPubKey(trimmedAddress);
      if (!success) {
        setIsSubmitting(false);
        return;
      }
    }
      // Then update the machine
      const url = `machine/${machineId}`;
            const urlObj = new URL(`${process.env.REACT_APP_API_ENDPOINT}/${url}`);
            urlObj.searchParams.set("avs_name", avsName);
            urlObj.searchParams.set("chain", chain);
            urlObj.searchParams.set("operator_address", trimmedAddress);
            const fetchUrl = urlObj.toString();

            console.log('Making machine PUT request to:', fetchUrl);
            await apiFetch(fetchUrl, "PUT");
            toast.success(getMessage("MachineEditedMessage"), { theme: "dark" });
            navigate("/machines", { state: { refetch: true } });
          } catch (err: any) {
            console.error('Full error object:', err);
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

  return (
    <div className="fixed left-0 top-0 w-screen h-screen flex justify-center items-center bg-black/[0.8]">
      <div className="flex flex-col bg-widgetBg w-[730px] rounded-xl p-8 gap-10">
        <div className="flex items-center">
          <h2>Add Operator Address</h2>
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
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="text-sm leading-5 font-medium text-ivygrey">Chain</div>
            <Select
              value={selectedChain}
              onChange={(value) => setSelectedChain(value as { value: string; label: string; } | null)}
              options={chains}
              styles={selectStyles}
              isDisabled={isSubmitting}
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
              isDisabled={isSubmitting}
              placeholder="Select or enter an operator address..."
              formatCreateLabel={(inputValue) => `Use address: ${inputValue}`}
            />
          </div>
        </div>

        <div className="flex gap-4 ml-auto">
          <div
            onClick={() => !isSubmitting && navigate(-1)}
            className={`px-4 py-2 rounded-lg bg-bgButton text-textPrimary
              ${!isSubmitting ? 'hover:bg-textGrey cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
          >
            Cancel
          </div>
          <div
            onClick={() => {
              if (isSubmitting) return;

              if (!selectedAvs?.value || !selectedChain?.value || !selectedAddress?.value) {
                toast.error("Please fill in all fields", { theme: "dark" });
                return;
              }

              const machineId = selectedAvs.machineId;
              if (!machineId) {
                toast.error("Could not find machine ID for this AVS", { theme: "dark" });
                return;
              }

              editKeys(
                machineId,
                selectedAvs.value,
                selectedChain.value,
                selectedAddress.value
              );
            }}
            className={`px-4 py-2 rounded-lg bg-bgButton text-textPrimary
              ${!isSubmitting ? 'hover:bg-textGrey cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </div>
        </div>
      </div>
    </div>
  );
}
