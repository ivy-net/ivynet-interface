import React, { useState, useRef, useEffect } from "react";
import optionsIcon from "../../../images/dots-vertical.svg"
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
  inHeader?: boolean;
}

export const OptionsButton: React.FC<OptionsButtonProps> = ({ className = "", options,}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const renderMenuItem = (option: Option, index: number) => {
    const menuItemClasses = "block w-full text-left text-sm font-normal text-textSecondary hover:text-textPrimary hover:bg-textGrey px-3 py-2 rounded-[4px]";

    if (option.onClick) {
      return (
        <button
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            option.onClick?.();
            setIsOpen(false);
          }}
          disabled={option.disabled}
          className={`${menuItemClasses} ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {option.label}
        </button>
      );
    }

    return (
      <Link
        key={index}
        to={option.link || ''}
        className={menuItemClasses}
        onClick={() => setIsOpen(false)}
      >
        {option.label}
      </Link>
    );
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="focus:outline-none"
      >
        <img src={optionsIcon} alt="options button" />
      </button>

      {isOpen && (
        <div
        className={`absolute -right-12 bg-sidebarHoverBg border border-textGrey rounded-lg shadow-lg z-[100] ${
          'bottom-[calc(100%+4px)]' // Always show above
        }`}
          style={{ width: '135px' }} // Changed from minWidth to width
        >
          <div className="p-2 flex flex-col">
            {options.map((option, index) => renderMenuItem(option, index))}
          </div>
        </div>
      )}
    </div>
  );
};
