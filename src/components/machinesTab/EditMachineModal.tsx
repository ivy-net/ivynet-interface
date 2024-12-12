import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import closeIcon from "./../../images/x-close.svg"
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { chains, getMessage } from "../../utils/UiMessages";
import { MachineDetails } from "../../interfaces/responses";
import { apiFetch } from "../../utils";
import { AxiosResponse } from "axios";
import useSWR from "swr";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface EditMachineModalProps {
}

interface OperatorAddress {
  value: string;
  label: string;
}

interface PubKeyData {
  public_key: string;
  name: string;
}

export const EditMachineModal: React.FC<EditMachineModalProps> = () => {
  const [selectedChain, setSelectedChain] = useState<{ value: string; label: string; } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<OperatorAddress | null>(null);
  const [operatorAddresses, setOperatorAddresses] = useState<OperatorAddress[]>([]);
  const navigate = useNavigate();

  const { avsName, machineId } = useParams();
  const apiFetcher = (url: string) => apiFetch(url, "GET");

  // Fetch machine details
  const machineResponse = useSWR<AxiosResponse<MachineDetails>, any>(`machine/${machineId}`, apiFetcher);
  const machine = machineResponse.data?.data;
  const avs = machine?.avs_list.find(avs => avs.avs_name === avsName);

  // Fetch operator addresses from pubkey endpoint
  const pubkeysResponse = useSWR<AxiosResponse<PubKeyData[]>, any>('pubkey', apiFetcher);

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
    if (avs) {
      setSelectedChain({ label: avs.chain || "", value: avs.chain || "" });
      if (avs.operator_address) {
        setSelectedAddress({
          value: avs.operator_address,
          label: avs.operator_address
        });
      }
    }
  }, [avs]);

  const addNewPubKey = async (publicKey: string) => {
      try {
        // Build URL with query parameters
        const baseUrl = `${process.env.REACT_APP_API_ENDPOINT}/pubkey`;
        const url = new URL(baseUrl);
        url.searchParams.set('public_key', publicKey.trim());
        url.searchParams.set('name', 'operator'); // Providing a default name since it's required

        console.log('Making pubkey POST request to:', url.toString());

        await apiFetch(url.toString(), "POST");
        await pubkeysResponse.mutate();
      } catch (err: any) {
        console.error('Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        });

        const errorMessage = err.response?.data?.error || 'Failed to add public key';
        toast.error(errorMessage, { theme: "dark" });
        throw err;
      }
    };

  const editMachine = async (machineId: string, avsName: string, chain: string, address: string) => {
    try {
      // If this is a new address (not in the existing options), add it to pubkey endpoint first
      const isNewAddress = !operatorAddresses.some(opt => opt.value === address);
      if (isNewAddress) {
        await addNewPubKey(address);
      }

      // Then update the machine
      const url = `machine/${machineId}`;
      const urlObj = new URL(`${process.env.REACT_APP_API_ENDPOINT}/${url}`);
      urlObj.searchParams.set("avs_name", avsName);
      urlObj.searchParams.set("chain", chain);
      urlObj.searchParams.set("operator_address", address);
      const fetchUrl = urlObj.toString();

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
          <h2>Edit Address</h2>
          <Link to="/machines" relative="path" className="ml-auto">
            <img src={closeIcon} alt="close icon" />
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
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
              <div className="text-sm leading-5 font-medium text-ivygrey">Address</div>
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
        </div>
        <div className="flex gap-4 ml-auto">
          <Link to="/machines" relative="path">
            <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textPrimary">Cancel</div>
          </Link>
          <Link to="" relative="path" onClick={() =>
            machine && editMachine(
              machine.machine_id,
              avs?.avs_name || "",
              selectedChain?.value || "",
              selectedAddress?.value || ""
            )
          }>
            <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textPrimary">Save Changes</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
