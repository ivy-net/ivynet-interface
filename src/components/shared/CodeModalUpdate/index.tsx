import React from "react";
import closeIcon from "./../../../images/x-close.svg"
import copyIcon from "./../../../images/copy.svg"

interface CodeModalUpdateProps {
  title: string;
  code: string;
  onClose?: (e?: React.MouseEvent) => void;
  isOpen?: boolean;
}

export const CodeModalUpdate: React.FC<CodeModalUpdateProps> = ({
  title,
  code,
  onClose,
  isOpen = true
}) => {
  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClose) {
      onClose(e);
    }
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div
      className="fixed left-0 top-0 w-screen h-screen flex justify-center items-center bg-black/[0.8] z-[1000]"
      onClick={handleClose} // Close when clicking backdrop
    >
      <div
        className="flex flex-col bg-widgetBg w-[730px] rounded-xl p-8 gap-8"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
      >
        <div className="flex items-center">
          <h2>{title}</h2>
          <button
            onClick={handleClose}
            className="ml-auto"
          >
            <img src={closeIcon} alt="close icon" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 text-sidebarColor items-center">
            <div className="border rounded-full text-[10px] font-bold border-sidebarColor w-[20px] h-[20px] flex justify-center items-center">1</div>
            <div className="font-medium">Scan your machine for new nodes - See IvyNet QuickStart Guide</div>
          </div>
          <div className="flex p-7 border border-bgButton text-textPrimary">
            <div className="w-3/4 font-light whitespace-pre-wrap">
              {code}
            </div>
            <div className="flex flex-col justify-start w-1/4">
              <button
                className="flex gap-3 w-full justify-center text-textPrimary hover:text-sidebarTextHighlightColor cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  copyCode();
                }}
              >
                <img src={copyIcon} className="w-6" alt="copy icon" />
                <div className="text-base font-medium">Copy</div>
              </button>
            </div>
          </div>
          <div className="flex gap-2 text-sidebarColor items-center">
            <div className="border rounded-full text-[10px] font-bold border-sidebarColor w-[20px] h-[20px] flex justify-center items-center">2</div>
            <div className="font-medium">Wait for new nodes to be detected</div>
          </div>
        </div>
      </div>
    </div>
  );
};
