import React from "react";
import { Link } from "react-router-dom";
import closeIcon from "../images/x-close.svg";


interface HelpModalProps {
  onClose?: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed left-0 top-0 w-screen h-screen flex justify-center items-center bg-black/[0.8]"
      onClick={handleBackdropClick}
    >
      <div className="flex flex-col bg-widgetBg w-[730px] rounded-xl p-8 gap-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-ivywhite">Contact Us</h2>
          <Link
            to=".."
            relative="path"
            className="hover:opacity-80 transition-opacity"
            onClick={(e) => {
              if (onClose) {
                e.preventDefault();
                onClose();
              }
            }}
          >
            <img src={closeIcon} alt="close icon" className="w-6 h-6" />
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="text-md leading-5 font-xl text-ivywhite">
                Reach out to us on{" "}
                <a
                  href="https://t.me/ivynetdotdev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline hover:text-blue-500 transition-colors"
                >
                  TG
                </a>
                {" "}and we will come back to you ASAP!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
