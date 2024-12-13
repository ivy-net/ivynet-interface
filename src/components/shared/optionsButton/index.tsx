import React from "react";
import optionsIcon from "../../../images/dots-vertical.svg"
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import { Link } from "react-router-dom";

interface Option {
  label: string;
  link?: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface OptionsButtonProps {
  className?: string;
  options: Option[];
}

export const OptionsButton: React.FC<OptionsButtonProps> = ({ className = "", options }) => {
  const renderMenuItem = (option: Option, index: number) => {
    const menuItemClasses = "text-sm font-normal text-textSecondary hover:text-textPrimary hover:bg-textGrey px-3 py-2 rounded-[4px]";

    if (option.onClick) {
      return (
        <MenuItem
          key={index}
          onClick={option.onClick}
          disabled={option.disabled}
          className={`${menuItemClasses} ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {option.label}
        </MenuItem>
      );
    }

    return (
      <Link to={option.link || ''} key={index} className="cursor-pointer">
        <MenuItem className={menuItemClasses}>
          {option.label}
        </MenuItem>
      </Link>
    );
  };

  return (
    <Menu menuButton={<MenuButton><img src={optionsIcon} alt="options button" /></MenuButton>}>
      <div className="p-2 bg-sidebarHoverBg rounded-lg flex flex-col w-max">
        {options.map((option, index) => renderMenuItem(option, index))}
      </div>
    </Menu>
  );
};
