import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { toast } from 'react-toastify';
import closeIcon from './../../images/x-close.svg';
import { apiFetch } from '../../utils';

interface OperatorData {
  organization_id: number;
  name: string;
  public_key: string;
}

export const AddKeysModal: React.FC = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { data: existingKeys } = useSWR<any>('pubkey', (url: string) => apiFetch(url, "GET"));

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

  const validateDuplicates = (name: string, address: string): boolean => {
    if (!existingKeys?.data) return true;

    const isDuplicateName = existingKeys.data.some((key: OperatorData) =>
      key.name.toLowerCase() === name.toLowerCase()
    );

    const isDuplicateAddress = existingKeys.data.some((key: OperatorData) =>
      key.public_key.toLowerCase() === address.toLowerCase()
    );

    if (isDuplicateName) {
      toast.error("Operator name already exists", { theme: "dark" });
      return false;
    }

    if (isDuplicateAddress) {
      toast.error("Address already exists", { theme: "dark" });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!address || !name) {
      toast.error("Please fill in all fields", { theme: "dark" });
      return;
    }

    if (!validateAddress(address) || !validateDuplicates(name, address)) {
      return;
    }

    try {
      setIsSubmitting(true);
      const baseUrl = `${process.env.REACT_APP_API_ENDPOINT}/pubkey`;
      const url = new URL(baseUrl);
      url.searchParams.set('public_key', address.trim());
      url.searchParams.set('name', name.trim());

      await apiFetch(url.toString(), "POST");
      toast.success("Address added successfully", { theme: "dark" });
      navigate("/activeset");
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to add public key';
      toast.error(errorMessage, { theme: "dark" });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <div className="text-md leading-5 font-medium text-ivywhite">Operator Name</div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              placeholder="Add an operator key name..."
              className="w-full px-3 py-2 bg-transparent border border-textGrey/20 rounded-lg text-textPrimary focus:border-white focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="text-md leading-5 font-medium text-ivywhite">Operator Address</div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isSubmitting}
              placeholder="Enter operator address..."
              className="w-full px-3 py-2 bg-transparent border border-textGrey/20 rounded-lg text-textPrimary focus:border-white focus:outline-none disabled:opacity-50"
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
          <button
            disabled={!address || !name || isSubmitting}
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textPrimary disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
