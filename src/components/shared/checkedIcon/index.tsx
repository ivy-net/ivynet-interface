import React from "react"
import checkedIcon from "./../../../images/checked.svg";
import uncheckedIcon from "./../../../images/unchecked.svg";

interface CheckedIconProps {
  isChecked: boolean
};

export const CheckedIcon: React.FC<CheckedIconProps> = ({ isChecked }) => {

  return (isChecked ?
    <img src={checkedIcon} alt="connected icon" /> :
    <img src={uncheckedIcon} alt="disconnected icon" />
  );
}
