import React from 'react';
import useSWR from 'swr';
import { AxiosResponse } from 'axios';
import { apiFetch } from "../../utils";

interface OperatorInfo {
  id: number;
  organization_id: number;
  name: string;
  public_key: string;
}

interface OperatorNameProps {
  address: string | null | undefined;
}

const OperatorName: React.FC<OperatorNameProps> = ({ address }) => {
  const { data: operatorsResponse } = useSWR<AxiosResponse<OperatorInfo[]>>(
    'pubkey',
    (url: string) => apiFetch(url, 'GET'),
    {
      onError: (error) => {
        console.error('Operator fetch error:', error);
        return [];
      }
    }
  );

  if (!address) return <span>-</span>;

  const formatAddress = (addr: string): string => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const operator = operatorsResponse?.data?.find(
    op => op.public_key.toLowerCase() === address.toLowerCase()
  );

  const operatorName = operator?.name || formatAddress(address);

  return (
    <div className="relative inline-block group">
      <span className="cursor-default">{operatorName}</span>
      <div className="invisible group-hover:visible absolute z-50 px-2 py-1 text-sm bg-gray-900 text-white rounded-md top-full left-0 mt-1">
        {address}
      </div>
    </div>
  );
};

export default OperatorName;
