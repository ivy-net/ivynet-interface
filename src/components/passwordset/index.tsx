import React, { useState } from "react";
import ivySmall from "../../images/ivy-small.svg"
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../utils";
import { getMessage } from "../../utils/UiMessages";
import { toast } from "react-toastify";

interface PasswordSetProps {}

export const PasswordSet: React.FC<PasswordSetProps> = () => {
  const { token } = useParams<{ token: string }>();
  const email = "someemail@gmail.com"  // You might want to get this from an API call using the token
  const company = "Company"  // You might want to get this from an API call using the token
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      // Send only password in body, token in URL
      const response = await apiFetch(`authorize/set_password`, "POST", JSON.stringify({
        password,
        token
      }))
      console.log(response)
      navigate("/")
    } catch (err: any) {
      toast.error(getMessage(err), { theme: "dark" });
      console.log(err)
    }
  }

  const passwordMismatch = (): boolean => {
    return password !== "" && password2 !== "" && password !== password2
  }

  const allowCreateBtn = () => {
    return password === password2 && password.length >= 8
  }

  const buttonClasses = allowCreateBtn() ? "border-accent text-accent" : "text-accent/60 border-accent/60 cursor-not-allowed"

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-contentBg">
      <div className="flex flex-col w-[440px] h-[464px] gap-4">
        <div className="flex flex-col gap-3">
          <img className="w-[48px] h-[48px]" src={ivySmall} alt="ivy-logo" />
          <div className="text-ivywhite text-2xl leading-9 font-bold">Create Account</div>
          <div className="text-textPrimary text-sm leading-6 font-normal">
          {/*<span className="font-bold">{email}</span>/*}*/}

          <span>Please update your password in order to access </span>
        {/*  <span className="font-bold">{company}'s </span>
          <span>space in </span>*/}
          <span className="font-bold">Ivynet</span>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (allowCreateBtn()) handleSubmit();
            }}>
              <div className="flex flex-col gap-1.5">
                <div className="text-sm leading-5 font-medium text-ivygrey">Password*</div>
                <input
                  type="password"
                  value={password}
                  onChange={(input) => setPassword(input.currentTarget.value)}
                  className="bg-transparent border border-textGrey py-2.5 px-3 rounded-lg outline-none focus:border-white text-ivygrey2 placeholder:text-ivygrey2 text-base font-normal"
                  placeholder="Create a password"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-sm leading-5 font-medium text-ivygrey">Password*</div>
                <input
                  type="password"
                  value={password2}
                  onChange={(input) => setPassword2(input.currentTarget.value)}
                  className="bg-transparent border border-textGrey py-2.5 px-3 rounded-lg outline-none focus:border-white text-ivygrey2 text-base font-normal placeholder:text-ivygrey2"
                  placeholder="Confirm Password"
                />
                {passwordMismatch() && <div className="text-sm leading-5 font-medium text-red-800">{getMessage("ConfirmPasswordMismatch")}</div>}
                {!passwordMismatch() && <div className="text-sm leading-5 font-medium text-ivygrey">Must be at least 8 characters.</div>}
              </div>
              <button
                type="submit"
                className={`mt-6 py-2.5 px-4 bg-accent/[0.10] border rounded-lg w-full ${buttonClasses}`}
                disabled={!allowCreateBtn()}
              >
                Create Account
              </button>
            </form>
          </div>
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
