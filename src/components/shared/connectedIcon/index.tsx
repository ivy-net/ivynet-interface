import React from "react";
import connectedIcon from "./../../../images/connected.svg";
import disconnectedIcon from "./../../../images/disconnected.svg";
import idleIcon from "./../../../images/idle.svg";

interface ConnectedIconProps {
  isConnected: boolean | null
}

export const ConnectedIcon: React.FC<ConnectedIconProps> = ({ isConnected }) => {

  return <>
    {isConnected === null && <img src={idleIcon} alt="idle icon" />}
    {isConnected === true && <img src={connectedIcon} alt="connected icon" />}
    {isConnected === false && <img src={disconnectedIcon} alt="disconnected icon" />}
  </>

}
