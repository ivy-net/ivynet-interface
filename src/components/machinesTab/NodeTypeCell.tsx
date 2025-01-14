import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils';
import { toast } from 'react-toastify';
import { ChevronDown } from 'lucide-react';

// Module-level cache for node types
let cachedNodeTypes: string[] | null = null;
let nodeTypesFetchPromise: Promise<string[]> | null = null;

// Fallback node types list in case the API call fails
const FALLBACK_NODE_TYPES = [
  "AvaProtocol",
  "EigenDA",
  "LagrangeStateCommittee",
  "LagrangeZkWorkerHolesky",
  "LagrangeZkWorkerMainnet",
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
  "SkateChainBase",
  "SkateChainMantle",
  "ChainbaseNetworkV1",
  "ChainbaseNetwork",
  "GoPlusAVS",
  "UngateInfiniRouteBase",
  "UngateInfiniRoutePolygon",
  "PrimevMevCommit",
  "AlignedLayer",
  "Unknown"
].sort((a: string, b: string) => a.localeCompare(b));

type NodeType = string | { [key: string]: string };
type CategoryName = 'Altlayer' | 'AltlayerMach';
type SpecialCategories = Record<CategoryName, string[]>;

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
  // Return cached result if available
  if (cachedNodeTypes) return cachedNodeTypes;

  // If there's an ongoing fetch, return its promise
  if (nodeTypesFetchPromise) return nodeTypesFetchPromise;

  // Create new fetch promise
  nodeTypesFetchPromise = (async () => {
    try {
      const response = await apiFetch('info/nodetypes', 'GET');
      const types = response.data;
      const stringTypes = types
        .filter((t: NodeType) => typeof t === 'string')
        .sort((a: string, b: string) => a.localeCompare(b));

      cachedNodeTypes = stringTypes;
      return stringTypes;
    } catch (error) {
      console.warn('Failed to fetch node types, using fallback list');
      cachedNodeTypes = FALLBACK_NODE_TYPES;
      return FALLBACK_NODE_TYPES;
    } finally {
      nodeTypesFetchPromise = null;
    }
  })();

  return nodeTypesFetchPromise;
};

const formatNodeType = (nodeType: NodeType | null): string => {
  if (!nodeType) return '';
  if (typeof nodeType === 'string') return nodeType;

  const [type, value] = Object.entries(nodeType)[0];
  if (type === 'Altlayer') {
    const displayValue = value
      .replace('AltlayerMach', 'Mach')
      .replace('GmNetworkMach', 'GMNetwork');
    return `${type}: ${displayValue}`;
  }
  if (type === 'MachType') {
    return `Mach: ${value}`;
  }
  return `${type}: ${value}`;
};

const isExpandableType = (nodeType: NodeType | null): boolean => {
  if (!nodeType || typeof nodeType === 'string') return false;
  return Object.keys(nodeType)[0] === 'Altlayer' || Object.keys(nodeType)[0] === 'MachType';
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
  const [selectedCategory, setSelectedCategory] = useState<CategoryName | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<string | null>(null);
  const [nodeTypes, setNodeTypes] = useState<string[]>(cachedNodeTypes || FALLBACK_NODE_TYPES);

  const specialCategories: SpecialCategories = {
    Altlayer: ['AltlayerMach', 'GmNetworkMach', 'Unknown'],
    AltlayerMach: ['Xterio', 'DodoChain', 'Cyber', 'Unknown']
  };

  // Load node types only once when modal opens
  useEffect(() => {
    if (isOpen && !cachedNodeTypes) {
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

      const nodeTypeValue = selectedCategory === 'Altlayer' && type === 'AltlayerMach'
        ? `Altlayer(${type})`
        : selectedCategory
          ? `${selectedCategory}(${type})`
          : type;

      const queryParams = `avs_name=${encodeURIComponent(avsName)}&node_type=${encodeURIComponent(nodeTypeValue)}`;
      const url = `${endpoint}?${queryParams}`;

      await apiFetch(url, 'PUT');
      await mutateMachines();
      toast.success(`Successfully updated node type for ${avsName}`, { theme: "dark" });
      onClose();
    } catch (error: any) {
      console.error('Error details:', error);
      const errorData = error?.response?.data || 'Unknown error';
      toast.error(`Failed to update node type: ${errorData}`, { theme: "dark" });
    } finally {
      setIsUpdating(false);
    }
  };

  const getFilteredTypes = () => {
    if (selectedCategory) {
      return specialCategories[selectedCategory].filter((type: string) =>
        type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const baseTypes = nodeTypes.filter((type: string) =>
      type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const categories = (Object.keys(specialCategories) as CategoryName[]).filter(cat =>
      cat.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...categories, ...baseTypes];
  };

  const handleSelect = (type: string) => {
    // Special case: if we're inside Altlayer category, treat everything as a value
    // not as a potential subcategory, even if it exists in specialCategories
    if (selectedCategory === 'Altlayer') {
      setSelectedSubType(type);
      handleSelectType(type);
      return;
    }

    // Regular category selection logic for non-Altlayer cases
    if (type in specialCategories && !selectedCategory) {
      setSelectedCategory(type as CategoryName);
      setSelectedSubType(null);
    } else if (selectedCategory) {
      setSelectedSubType(type);
      handleSelectType(type);
    } else {
      handleSelectType(type);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className="bg-widgetBg border border-textGrey rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-between p-4 border-b border-textGrey">
          <h2 className="text-xl font-semibold text-textPrimary">
            {selectedCategory
              ? `Select ${selectedCategory} Type`
              : `Update Node Type for ${avsName}`}
          </h2>
          <button onClick={onClose} className="text-textGrey hover:text-textPrimary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-2">
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 text-textSecondary hover:text-textPrimary mb-4"
            >
              <ChevronDown className="w-4 h-4 transform rotate-90" />
              Back to Categories
            </button>
          )}

          <div className="relative">
            <input
              type="text"
              placeholder={selectedCategory ? `Search ${selectedCategory} types...` : "Search node types..."}
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
            {getFilteredTypes().map((type) => (
              <button
                key={type}
                onClick={() => handleSelect(type)}
                disabled={isUpdating}
                className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                  (selectedCategory ? selectedSubType === type : false)
                    ? 'bg-ivygray text-white border-2 border-textGrey'
                    : 'bg-black bg-opacity-20 text-textSecondary hover:bg-opacity-30'
                }`}
              >
                <span>{type}</span>
                {(type in specialCategories) && !selectedCategory && (
                  <ChevronDown className="w-4 h-4 transform -rotate-90" />
                )}
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

  // Pre-fetch node types when component mounts
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
