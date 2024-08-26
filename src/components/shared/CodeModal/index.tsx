import React from "react";
import { Link } from "react-router-dom";
import closeIcon from "./../../../images/x-close.svg"
import copyIcon from "./../../../images/copy.svg"

interface CodeModalProps {
  code: string;
  title: string;
};

export const CodeModal: React.FC<CodeModalProps> = ({ title, code }) => {
  const copyCode = () => {
    navigator.clipboard.writeText(code);
  }

  return (
    <div className="fixed left-0 top-0 w-screen h-screen flex justify-center items-center bg-black/[0.8]">
      <div className="flex flex-col bg-widgetBg w-[730px] rounded-xl p-8 gap-8">
        <div className="flex items-center">
          <h2>{title}</h2>
          <Link to={"../.."} relative="path" className="ml-auto">
            <img src={closeIcon} alt="close icon" />
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 text-sidebarColor items-center">
            <div className="border rounded-full text-[10px] font-bold border-sidebarColor w-[20px] h-[20px] flex justify-center items-center">1</div>
            <div className="font-medium">Paste the code below</div>
          </div>
          <div className="flex p-7 border border-bgButton text-textPrimary">
            <div className="w-3/4 font-light whitespace-pre-wrap">
              {code}
            </div>
            <div className="flex flex-col justify-start w-1/4">
              <div className="flex gap-3 w-full justify-center text-textPrimary hover:text-sidebarTextHighlightColor cursor-pointer" onClick={copyCode}>
                <img src={copyIcon} className="w-6" alt="copy icon" />
                <div className="text-base font-medium">Copy</div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 text-sidebarColor items-center">
            <div className="border rounded-full text-[10px] font-bold border-sidebarColor w-[20px] h-[20px] flex justify-center items-center">2</div>
            <div className="font-medium">Wait for machine to be detected</div>
          </div>
        </div>
      </div>
    </div >
  );
}
