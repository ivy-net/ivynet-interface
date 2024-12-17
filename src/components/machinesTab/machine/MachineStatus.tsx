import React from "react";
import { ConnectedIcon } from "../../shared/connectedIcon";

interface MachineStatusProps {
  title: string;
  status?: string;
  connected?: boolean | null;
  children?: React.ReactNode;
}

export const MachineStatus: React.FC<MachineStatusProps> = ({ title, status, connected = null, children }) => {

  return (
    <div className="flex bg-widgetBg p-5 rounded-xl">
      <div className="flex flex-col gap-4">
        {status && <div className="text-2xl text-textPrimary font-semibold">{status}</div>}
        {children}
        <div className="flex gap-2">
          {connected !== null && <ConnectedIcon isConnected={connected} />}
          <div className="text-sm leading-5">{title}</div>
        </div>
      </div>
    </div>
  );
}
