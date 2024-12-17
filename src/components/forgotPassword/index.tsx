import React, { useState } from "react";
import ivySmall from "../../images/ivy-small.svg"
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, validateEmail } from "../../utils";
import { getMessage } from "../../utils/UiMessages";
import { toast } from "react-toastify";

interface ForgotPasswordProps {
};

export const ForgotPassword: React.FC<ForgotPasswordProps> = () => {
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  const forgotPassword = async () => {
    try {
      await apiFetch("authorize/forgot_password", "POST", JSON.stringify({ email }))
      toast.info("ResetCheckEmail", { theme: "dark" })
      navigate("/login")
    } catch (err: any) {
      toast.error(getMessage(err), { theme: "dark" });
      console.log(err)
    } 
  }

  const buttonClasses = validateEmail(email) ? "border-accent text-accent" : "text-accent/60 border-accent/60 cursor-not-allowed"

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-contentBg">
      <div className="flex flex-col w-[440px] h-[464px] gap-4">
        <div className="flex flex-col gap-3">
          <img className="w-[48px] h-[48px]" src={ivySmall} alt="ivy-logo" />
          <div className="text-ivywhite text-2xl leading-9 font-bold">Forgot Password</div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <form>
              <div className="flex flex-col gap-1.5">
                <div className="text-sm leading-5 font-medium text-ivygrey">Email</div>
                <input type="email" value={email} onChange={(input) => setEmail(input.currentTarget.value)} className="bg-transparent border border-textGrey py-2.5 px-3 rounded-lg outline-none focus:border-white text-ivygrey2 placeholder:text-ivygrey2 text-base font-normal" placeholder="Enter Email" />
              </div>
            </form>
          </div>
          <button className={`py-2.5 px-4 bg-accent/[0.10] border rounded-lg w-full ${buttonClasses}`} disabled={!validateEmail(email)} onClick={forgotPassword}>Reset Password</button>
        </div>
        <div className="flex text-ivygrey gap-1 justify-center">
          <div>Still remember the password?</div>
          <Link to="/login">
            <div className="text-accent">Log in</div>
          </Link>
        </div>
      </div>

    </div>
  );
}
