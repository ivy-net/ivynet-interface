import React, { useState } from "react";
import { Link } from "react-router-dom";
import closeIcon from "../images/x-close.svg"
import Select from 'react-select';

interface HelpModalProps {
}

export const HelpModal: React.FC<HelpModalProps> = () => {
  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'owner', label: 'Owner' },
    { value: 'write', label: 'Write' },
    { value: 'read', label: 'Read' },
  ];
  const [selectedOption, setSelectedOption] = useState<{ value: string; label: string; } | null>(null);

  return (
    <div className="fixed left-0 top-0 w-screen h-screen flex justify-center items-center bg-black/[0.8]">
      <div className="flex flex-col bg-widgetBg w-[730px] rounded-xl p-8 gap-10">
        <div className="flex items-center">
          <h2>Contact Us</h2>
          <Link to=".." relative="path" className="ml-auto">
            <img src={closeIcon} alt="close icon" />
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="text-lg leading-5 font-xl text-ivywhite">
                Reach out to us on <a
                  href="https://t.me/ivynetdotdev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline hover:text-blue-500"
                >
                  TG
                </a>
                 {' '}and we will come back to you ASAP!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
