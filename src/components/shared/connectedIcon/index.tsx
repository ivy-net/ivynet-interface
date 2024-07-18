import React from "react";
import connectedIcon from "./../../../images/connected.svg";
import disconnectedIcon from "./../../../images/disconnected.svg";

interface ConnectedIconProps {
  isConnected: boolean
};

export const ConnectedIcon: React.FC<ConnectedIconProps> = ({ isConnected }) => {

  return (isConnected ?
    <img src={connectedIcon} alt="connected icon" /> :
    <img src={disconnectedIcon} alt="disconnected icon" />
  );
}
