import React from 'react';
import { Link } from 'react-router-dom';

interface OperatorData {
  organization_id: number;
  name: string;
  public_key: string;
}

interface OperatorCellProps {
  operatorAddress: string;
  operatorData: OperatorData[] | undefined;
  avsName: string;
  machineId: string;
}

const OperatorCell: React.FC<OperatorCellProps> = ({
  operatorAddress,
  operatorData,
  avsName,
  machineId
}) => {
  const formatOperatorAddress = (address: string, data: OperatorData[] | undefined) => {
    const operator = data?.find(op => op.public_key === address);
    if (!operator?.name) {
      return `${address.slice(0, 4)}..${address.slice(-3)}`;
    }
    return `${operator.name}`;
  };

  if (!operatorAddress || !operatorData?.find(op => op.public_key === operatorAddress)?.name) {
    return (
      <div className="w-24 flex justify-start">
        <Link to={`/nodes/edit/${avsName}/${machineId}`}>
          <div className="px-3 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary text-md">
            Add
          </div>
        </Link>
      </div>
    );
  }

  return (
    <Link
      to={`/nodes/edit/${avsName}/${machineId}`}
      className="text-left px-3 py-2 rounded-lg hover:bg-widgetHoverBg text-textSecondary block"
      >
      {formatOperatorAddress(operatorAddress, operatorData)}
    </Link>
  );
};

export default OperatorCell;
