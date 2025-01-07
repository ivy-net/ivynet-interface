import React, { useState } from 'react';
import { apiFetch } from '../../utils';
import { toast } from 'react-toastify';

interface NodeTypeCellProps {
  nodeType: string | null;
  avsName: string;
  machineId: string;
  mutateMachines: () => Promise<any>;
}

const NODE_TYPES = [
    'AethosHolesky', // Predicate was Aethos - still live in holesky?
    'AlignedLayer',
    'AltlayerMach',  // Altlayer Mach AVS 
    'ArpaNetworkNodeClient',
    'Automata',
    'AvaProtocol',
    'Brevis',
    'ChainbaseNetworkV1',
    'ChainbaseNetworkV2', 
    'CyberMach',     // Altlayer Mach AVS
    'DodoChainMach', // Altlayer Mach AVS
    'EigenDA',
    'EOracle',
    'GMNetworkMach', // Altlayer Mach AVS
    'GoPlusAVS',
    'Hyperlane',
    'K3LabsAvs',
    'K3LabsAvsHolesky',
    'LagrangeStateCommittee',
    'LagrangeZkWorkerHolesky',
    'LagrangeZkWorkerMainnet',
    'Omni',
    'OpenLayerHolesky',
    'OpenLayerMainnet',
    'Predicate',
    'PrimevMevCommit',
    'SkateChainBase', /* Othentic-cli - not sure whats going on here either https://github.com/Skate-Org/avs-X-othentic/blob/main/docker-compose.yml */
    'SkateChainMantle', /* Othentic-cli - not sure whats going on here either https://github.com/Skate-Org/avs-X-othentic/blob/main/docker-compose.yml */
    'UnifiAVS', // I think this is on-chain only - https://docs.puffer.fi/unifi-avs-protocol
    'UngateInfiniRouteBase',    //Built locally
    'UngateInfiniRoutePolygon', // Built locally
    'Unknown',
    'WitnessChain',
    'XterioMach',    // Altlayer Mach AVS
   ].sort();

interface NodeTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  avsName: string;
  machineId: string;
  mutateMachines: () => Promise<any>;
}

const NodeTypeModal: React.FC<NodeTypeModalProps> = ({
    isOpen,
    onClose,
    avsName,
    machineId,
    mutateMachines
   }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);
   
    if (!isOpen) return null;
   
    const getFilteredTypes = () => {
      if (selectedType) return [selectedType];
      return NODE_TYPES.filter(type =>
        type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    };
   
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };
   
    const handleSelect = (type: string) => {
      setSelectedType(type);
    };
   
    const handleSelectType = async (selectedType: string | null) => {
        setIsUpdating(true);
        try {
          const url = `/machine/${machineId}/node_type?avs_name=${encodeURIComponent(avsName)}${
            selectedType ? `&node_type=${encodeURIComponent(selectedType)}` : ''
          }`;
          const response = await apiFetch(url, 'PUT');
          
          if (response.status === 200) {
            await mutateMachines();
            toast.success(`Successfully updated node type for ${avsName}`, { theme: "dark" });
            onClose();
          }
        } catch (error) {
          toast.error(`Failed to update node type for ${avsName}`, { theme: "dark" });
          console.error('Error updating node type:', error);
        } finally {
          setIsUpdating(false);
        }
       };
   
    const handleConfirm = async () => {
      if (!selectedType) return;
      await handleSelectType(selectedType);
    };
   
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
        <div className="bg-widgetBg border border-textGrey rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto mx-4">
          <div className="flex items-center justify-between p-4 border-b border-textGrey">
            <h2 className="text-xl font-semibold text-textPrimary">
              {`Select Node Type for ${avsName}`}
            </h2>
            <button onClick={onClose} className="text-textGrey hover:text-textPrimary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
   
          <div className="p-4 space-y-2">
            {!selectedType && (
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
            )}
   
            <div className="space-y-1">
              {getFilteredTypes().map((type) => (
                <button
                  key={type}
                  onClick={() => handleSelect(type)}
                  disabled={isUpdating}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                    selectedType === type 
                      ? 'bg-ivygray text-white border-2 border-textGrey'
                      : 'bg-black bg-opacity-20 text-textSecondary hover:bg-opacity-30'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
   
            {selectedType && (
              <div className="mt-4 flex justify-end gap-2 border-t border-textGrey/20 pt-4">
                <button 
                  onClick={() => setSelectedType(null)}
                  className="px-4 py-2 text-textSecondary hover:text-textPrimary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-bgButton hover:bg-textGrey text-textSecondary rounded-lg"
                  disabled={isUpdating}
                >
                  Select
                </button>
              </div>
            )}
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

  if (!nodeType || nodeType.toLowerCase() === 'unknown') {
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

  return <span className="text-textSecondary">{nodeType}</span>;
};