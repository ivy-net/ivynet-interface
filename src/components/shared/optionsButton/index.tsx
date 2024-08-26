import React, { useState } from "react";
import optionsIcon from "../../../images/dots-vertical.svg"
import Select from "react-select"
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import { Link } from "react-router-dom";

interface Option {
  label: string;
  link: string;
}

interface OptionsButtonProps {
  className?: string
  options: Option[]
};

export const OptionsButton: React.FC<OptionsButtonProps> = ({ className = "", options }) => {

  return (
    <Menu menuButton={<MenuButton><img src={optionsIcon} alt="options button" /></MenuButton>}>
      <div className="p-2 bg-sidebarHoverBg rounded-lg flex flex-col w-max">
        {options.map((option, index) => (
          <Link to={option.link} key={index} className="cursor-pointer">
            <MenuItem className="text-sm font-normal text-textSecondary hover:text-textPrimary hover:bg-textGrey px-3 py-2 rounded-[4px]">{option.label}</MenuItem>
          </Link>
        ))}
      </div>
    </Menu>
  );
}
