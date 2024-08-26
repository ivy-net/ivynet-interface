import React from "react";
import ivySmall from "../../images/ivy-small.svg"
import { Link } from "react-router-dom";

interface SignupProps {
};

export const Signup: React.FC<SignupProps> = ({ }) => {
  const email = "someemail@gmail.com"
  const company = "Company"

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-contentBg">
      <div className="flex flex-col w-[440px] h-[464px] gap-4">
        <div className="flex flex-col gap-3">
          <img className="w-[48px] h-[48px]" src={ivySmall} alt="ivy-logo" />
          <div className="text-ivywhite text-2xl leading-9 font-bold">Create Account</div>
          <div className="text-textPrimary text-sm leading-6 font-normal">
            <span className="font-bold">{email}</span>
            <span>, please update your password in order to access </span>
            <span className="font-bold">{company}'s </span>
            <span>space in </span>
            <span className="font-bold">Ivynet</span>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="text-sm leading-5 font-medium text-ivygrey">Password*</div>
              <input type="password" className="bg-transparent border border-textGrey py-2.5 px-3 rounded-lg outline-none focus:border-white text-ivygrey2 placeholder:text-ivygrey2 text-base font-normal" placeholder="Create a password" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-sm leading-5 font-medium text-ivygrey">Password*</div>
              <input type="password" className="bg-transparent border border-textGrey py-2.5 px-3 rounded-lg outline-none focus:border-white text-ivygrey2 text-base font-normal placeholder:text-ivygrey2" placeholder="Confirm Password" />
              <div className="text-sm leading-5 font-medium text-ivygrey">Must be at least 8 characters.</div>
            </div>
          </div>
          <Link to="/welcome">
            <button className="py-2.5 px-4 bg-accent/[0.10] border border-accent text-accent rounded-lg w-full">Create Account</button>
          </Link>
        </div>
        <div className="flex text-ivygrey gap-1 justify-center">
          <div>Already have an account?</div>
          <Link to="/login">
            <div className="text-accent">Log in</div>
          </Link>
        </div>
      </div>

    </div>
  );
}
