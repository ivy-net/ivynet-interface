import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils';
import { toast } from 'react-toastify';

export const formatNodeType = (nodeType: NodeType | null): string => {
  if (!nodeType) return '';
  if (typeof nodeType === 'string') {
    return nodeType;
  }
  const [type, value] = Object.entries(nodeType)[0];
  return `${type}: ${value}`;
};

// Module-level cache for node types
let cachedNodeTypes: string[] | null = null;
let nodeTypesFetchPromise: Promise<string[]> | null = null;

// Fallback node types list in case the API call fails
const FALLBACK_NODE_TYPES = [
  "AvaProtocol",
  "EigenDA",
  "LagrangeStateCommittee",
  "LagrangeZkWorker",
  "K3LabsAvs",
  "K3LabsAvsHolesky",
  "EOracle",
  "Predicate",
  "Hyperlane",
  "Brevis",
  "WitnessChain",
  "Omni",
  "Automata",
  "OpenLayerMainnet",
  "OpenLayerHolesky",
  "AethosHolesky",
  "ArpaNetworkNodeClient",
  "UnifiAVS",
  "ChainbaseNetwork",
  "GoPlusAVS",
  "PrimevMevCommit",
  "AlignedLayer",
  "DittoNetwork",
  "Gasp",
  "Nuffle",
  "Blockless",
  "Primus",
  "AtlasNetwork",
  "Zellular",
  "Bolt",
  "Redstone",
  "MishtiNetwork",
  "Unknown",
].sort((a: string, b: string) => a.localeCompare(b));

type NodeType = string | { [key: string]: string };

interface NodeTypeCellProps {
  nodeType: NodeType | null;
  avsName: string;
  machineId: string;
  mutateMachines: () => Promise<any>;
}

interface NodeTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  avsName: string;
  machineId: string;
  mutateMachines: () => Promise<any>;
}

// Centralized fetch function with caching
const fetchNodeTypes = async (): Promise<string[]> => {
  if (cachedNodeTypes) return cachedNodeTypes;
  if (nodeTypesFetchPromise) return nodeTypesFetchPromise;

  nodeTypesFetchPromise = (async () => {
    try {
      const response = await apiFetch('info/nodetypes', 'GET');
      const types = response.data
        .filter((t: NodeType) => typeof t === 'string')
        .sort((a: string, b: string) => a.localeCompare(b));

      cachedNodeTypes = types;
      return types;
    } catch (error) {
      console.error('Failed to fetch node types:', error);
      cachedNodeTypes = FALLBACK_NODE_TYPES;
      return FALLBACK_NODE_TYPES;
    } finally {
      nodeTypesFetchPromise = null;
    }
  })();

  return nodeTypesFetchPromise;
};

const NodeTypeModal: React.FC<NodeTypeModalProps> = ({
  isOpen,
  onClose,
  avsName,
  machineId,
  mutateMachines
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [nodeTypes, setNodeTypes] = useState<string[]>(FALLBACK_NODE_TYPES);

  useEffect(() => {
    if (isOpen) {
      fetchNodeTypes().then(setNodeTypes);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSelectType = async (type: string) => {
    if (!type || isUpdating) return;

    setIsUpdating(true);
    try {
      const endpoint = `machine/${machineId}/node_type`;

      // Create the base URL with encoded parameters
      const queryParams = new URLSearchParams({
        avs_name: avsName,
        node_type: type  // Let axios handle the encoding
      }).toString();

      const url = `${endpoint}?${queryParams}`;

      console.log('Making request:', {
        url,
        originalType: type,
        queryParams
      });

      const response = await apiFetch(
        url,
        'PUT',
        undefined,  // no data payload
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response:', response);

      await mutateMachines();
      toast.success(`Successfully updated node type for ${avsName}`, { theme: "dark" });
      onClose();
    } catch (error: any) {
      console.error('Error occurred:', error);
      const errorData = error?.response?.data || 'Unknown error';
      toast.error(`Failed to update node type: ${errorData}`, { theme: "dark" });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTypes = nodeTypes.filter(type =>
    type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className="bg-widgetBg border border-textGrey rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-between p-4 border-b border-textGrey">
          <h2 className="text-xl font-semibold text-textPrimary">
            Update Node Type for {avsName}
          </h2>
          <button onClick={onClose} className="text-textGrey hover:text-textPrimary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search node types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black bg-opacity-30 rounded-lg text-textPrimary border border-textGrey/20 focus:ring-1 focus:ring-textGrey"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-textGrey"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="space-y-1">
            {filteredTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleSelectType(type)}
                disabled={isUpdating}
                className="w-full text-left px-4 py-2.5 rounded-lg transition-colors bg-black bg-opacity-20 text-textSecondary hover:bg-opacity-30"
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const NodeTypeCell: React.FC<NodeTypeCellProps> = ({
  nodeType,
  avsName,
  machineId,
  mutateMachines
}) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!cachedNodeTypes) {
      fetchNodeTypes();
    }
  }, []);

  if (!nodeType || (typeof nodeType === 'string' && nodeType.toLowerCase() === 'unknown')) {
    return (
      <>
        <div className="w-24 flex justify-start">
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary text-md"
          >
            Add
          </button>
        </div>

        <NodeTypeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          avsName={avsName}
          machineId={machineId}
          mutateMachines={mutateMachines}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-left px-3 py-2 rounded-lg hover:bg-widgetHoverBg text-textSecondary"
      >
        <span>{formatNodeType(nodeType)}</span>
      </button>

      <NodeTypeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        avsName={avsName}
        machineId={machineId}
        mutateMachines={mutateMachines}
      />
    </>
  );
};
