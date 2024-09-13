import React from "react";
import { Link } from "react-router-dom";
import closeIcon from "./../../../images/x-close.svg"
import { AvsWidget } from "../../shared/avsWidget";
import { AvsInfo } from "./AvsInfo";
import { MachineRequirements } from "./MachineRequirements";


interface AvsModalProps {
};

export const AvsModal: React.FC<AvsModalProps> = () => {

  return (
    <div className="fixed left-0 top-0 w-screen h-screen flex justify-center items-center bg-black/[0.8]">
      <div className="flex flex-col bg-widgetBg w-[1110px] rounded-xl p-8 gap-10">
        <div className="flex items-start">
          <AvsWidget name="AVS1" description="AVS Description" />
          <Link to={".."} relative="path" className="ml-auto">
            <img src={closeIcon} alt="close icon" />
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <h4>AVS Info</h4>
          <AvsInfo />
        </div>
        <div className="border-t-[1px] border-white/10"></div>
        <MachineRequirements />
        <div className="flex gap-4">
          <Link to="" relative="path" className="ml-auto">
            <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textPrimary">Deploy AVS</div>
          </Link>
          <Link to="" relative="path">
            <div className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textPrimary">Upgrade AVS</div>
          </Link>
        </div>
      </div>
    </div >
  );
}
