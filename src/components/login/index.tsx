import React, { useState } from "react";
import ivySmall from "../../images/ivy-small.svg"
import { Link, useNavigate, Navigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { apiFetch } from "../../utils";
import { getMessage } from "../../utils/UiMessages";

interface LoginProps {
};

export const Login: React.FC<LoginProps> = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  const login = async () => {
  try {
    const response = await apiFetch("authorize", "POST", JSON.stringify({ email, password }));
    // Access session_id from response.data instead of directly from response
    localStorage.setItem("session_id", response.data.session_id);
    navigate("/");
  } catch (err: any) {
    if (err.status !== 401) {
      toast.error(getMessage(err), { theme: "dark" });
    }
    console.log(err);
  }
};

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
              <div className="text-lg leading-5 font-medium text-ivygrey">E-Mail</div>
              <input type="email" className="bg-transparent border border-textGrey py-2.5 px-3 rounded-lg outline-none focus:border-white text-ivygrey2 text-base font-normal" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-lg leading-5 font-medium text-ivygrey">Password*</div>
              <input type="password" className="bg-transparent border border-textGrey py-2.5 px-3 rounded-lg outline-none focus:border-white text-ivygrey2 text-base font-normal placeholder:text-ivygrey2"
                placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <button className="text-lg py-2.5 px-4 bg-accent/[0.10] border border-accent text-accent rounded-lg" onClick={login}>Login</button>
        </div>
        <div className="flex text-ivywhite gap-1 justify-center">
          <div>Forgot password?</div>
          <Link to="/reset">
            <div className="text-accent hover:text-accent/80">Reset</div>
          </Link>
        </div>
        <div className="flex text-ivywhite gap-1 justify-center">
          <div>New to IvyNet?</div>
          <a href="https://t.me/ivynetdotdev" target="_blank" rel="noopener noreferrer">
            <div className="text-accent hover:text-accent/80">DM</div>
          </a>
        </div>
      </div>
    </div>
  );
}
