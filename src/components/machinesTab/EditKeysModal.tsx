import React, { useState } from "react";
import { Link } from "react-router-dom";
import closeIcon from "./../../images/x-close.svg"
import Select from 'react-select';
import { Table } from "../shared/table";
import { Tr } from "../shared/table/Tr";
import { Th } from "../shared/table/Th";
import { Td } from "../shared/table/Td";


interface EditKeysModalProps {
};

export const EditKeysModal: React.FC<EditKeysModalProps> = () => {
  const keys = [
    { label: 'Key 1', value: '12121121212' },
    { label: 'Key 2', value: '12121121212' },
    { label: 'Key 3', value: '12121121212' },
    { label: 'Key 4', value: '12121121212' },
    { label: 'Key 5', value: '12121121212' },
  ];
  const [selectedOption, setSelectedOption] = useState<{ value: string; label: string; } | null>(null);

  return (
    <div className="fixed left-0 top-0 w-screen h-screen flex justify-center items-center bg-black/[0.8]">
      <div className="flex flex-col bg-widgetBg w-[730px] rounded-xl p-8 gap-10">
        {/* <div className="flex items-start">
          <Link to="/settings" relative="path" className="ml-auto">
            <img src={closeIcon} alt="close icon" />
          </Link>
        </div> */}
        <div className="flex items-center">
          <h2>Edit Addresses</h2>
          <Link to="/machines" relative="path" className="ml-auto">
            <img src={closeIcon} alt="close icon" />
          </Link>
        </div>

        <Table>
          <Tr>
            <Th content="Name"></Th>
            <Th content="Key"></Th>
          </Tr>
          {keys.map((key, idx) => (
            <Tr key={idx}>
              <Td content={key.label} className="!h-6 font-bold"></Td>
              <Td content={key.value} className="!h-6"></Td>
            </Tr>
          ))}
        </Table>

        <div className="flex justify-center ml-auto">
          <Link to="/machines" relative="path">
            <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textPrimary">Save Keys</div>
          </Link>
        </div>
      </div>
    </div >
  );
}
