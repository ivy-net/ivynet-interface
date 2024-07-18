import React, { useState } from "react";
import optionsIcon from "../../../images/dots-vertical.svg"
import Select from "react-select"
import reactSelect from "react-select";

interface OptionsButtonProps {
};

export const OptionsButton: React.FC<OptionsButtonProps> = ({ }) => {
  const options = [
    { value: 'chocolateeeeeeeee', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
  ]
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const openMenu = () => {
    setMenuIsOpen(true);
  }

  return (
    <div className="relative">
      <img src={optionsIcon} alt="options button" onClick={openMenu} />

      {/* {!!menuIsOpen &&
        // <Select
        //   menuIsOpen={true}
        //   options={options} />

        // <div className="absolute bg-gray-400 p-2">
        //   {options.map((option) => {
        //     return <div key={option.label}>{option.value}</div>
        //   })}
        // </div>
      } */}

      {/*  */}
    </div>
  );
}
