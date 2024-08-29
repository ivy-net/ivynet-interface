import React from "react";
import ivySmall from "../../images/ivy-small.svg"
import { Link } from "react-router-dom";

interface LoginProps {
};

export const Login: React.FC<LoginProps> = ({ }) => {

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-contentBg">
      <div className="flex flex-col w-[440px] h-[342px] gap-4">
        <div className="flex flex-col gap-3">
          <img className="w-[48px] h-[48px]" src={ivySmall} alt="ivy-logo" />
          <div className="text-ivywhite text-2xl leading-9 font-bold">Login</div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="text-sm leading-5 font-medium text-ivygrey">E-Mail</div>
              <input className="bg-transparent border border-textGrey py-2.5 px-3 rounded-lg outline-none focus:border-white text-ivygrey2 text-base font-normal" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-sm leading-5 font-medium text-ivygrey">Password*</div>
              <input type="password" className="bg-transparent border border-textGrey py-2.5 px-3 rounded-lg outline-none focus:border-white text-ivygrey2 text-base font-normal placeholder:text-ivygrey2" placeholder="Enter Password" />
            </div>
          </div>
          <button className="py-2.5 px-4 bg-accent/[0.10] border border-accent text-accent rounded-lg">Login</button>
        </div>
        <div className="flex text-ivygrey gap-1 justify-center">
          <div>Forgot password?</div>
          <Link to="">
            <div className="text-accent">Reset</div>
          </Link>
        </div>
      </div>

    </div>
  );
}
