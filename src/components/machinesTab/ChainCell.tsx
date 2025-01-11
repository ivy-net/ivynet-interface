import React from 'react';
import { Link } from 'react-router-dom';
import { getChainLabel } from '../../utils/UiMessages';

interface ChainCellProps {
  chain: string | null;
  avsName: string;
  machineId: string;
}

const ChainCell: React.FC<ChainCellProps> = ({ chain, avsName, machineId }) => {
  const chainLabel = getChainLabel(chain);

  if (!chainLabel) {
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

  return <span className="text-textSecondary">{chainLabel}</span>;
};

export default ChainCell;
