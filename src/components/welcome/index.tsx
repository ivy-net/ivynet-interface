import React from "react";
import ivySmall from "../../images/ivy-small.svg"
import checkedIcon from "./../../images/checked.svg";


interface WelcomeProps {
};

export const Welcome: React.FC<WelcomeProps> = ({ }) => {

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-contentBg">
      <div className="flex flex-col w-[440px] h-[122px] gap-4">
        <div className="flex flex-col items-center gap-2">
          <img className="w-[48px] h-[48px]" src={ivySmall} alt="ivy-logo" />
          <div className="text-ivywhite text-2xl leading-9">
            <span className="font-normal">Welcome to </span>
            <span className="font-bold">Ivy</span>
          </div>
          <div className="flex items-center">
            <img className="w-[20px]" src={checkedIcon} alt="checked" />
            <div className="text-positive text-base leading-5 font-medium">Account successfully created.</div>
          </div>
        </div>
      </div>

    </div>
  );
}
