import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from "../../utils";
import { getMessage } from "../../utils/UiMessages";
import { toast } from 'react-toastify';
import ivySmall from "../../images/ivy-small.svg";

export const PasswordReset: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');
  const [password2, setPassword2] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      try {
        // Note: Using the same endpoint as PasswordSet for token validation
        const response = await apiFetch(`authorize/invitation/${token}`, "GET");
        console.log('Token validation response:', response);
        setIsValid(true);
      } catch (err) {
        console.error('Token validation failed:', err);
        toast.error("This reset link is invalid or has expired");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      validateToken();
    }
  }, [token, navigate]);

  const passwordMismatch = (): boolean => {
    return password !== "" && password2 !== "" && password !== password2;
  };

  const allowResetBtn = () => {
    return password === password2 && password.length >= 8;
  };

  const buttonClasses = allowResetBtn()
    ? "border-accent text-accent"
    : "text-accent/60 border-accent/60 cursor-not-allowed";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allowResetBtn()) return;

    try {
      await apiFetch('authorize/set_password', 'POST', {
        verification_id: token,  // Changed from token to match PasswordSet
        password
      });
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (err: any) {
      // Match error handling from PasswordSet
      if (err?.response?.data === "AlreadySet") {
        toast.error("This reset link has already been used. Please log in or use 'Forgot Password' if needed.");
        navigate("/login");
        return;
      }
      toast.error(getMessage(err), { theme: "dark" });
      console.error('Password reset failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isValid) {
    return null;
  }

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-contentBg">
      <div className="flex flex-col w-[440px] h-[464px] gap-4">
        <div className="flex flex-col gap-3">
          <img className="w-[48px] h-[48px]" src={ivySmall} alt="ivy-logo" />
          <div className="text-ivywhite text-2xl leading-9 font-bold">Reset Password</div>
          <div className="text-textPrimary text-sm leading-6 font-normal">
            <span>Please reset your password to access </span>
            <span className="font-bold">Ivynet</span>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <div className="text-sm leading-5 font-medium text-ivygrey">Password*</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border border-textGrey py-2.5 px-3 rounded-lg outline-none focus:border-white text-ivygrey2 placeholder:text-ivygrey2 text-base font-normal"
                placeholder="Create a password"
              />
            </div>
            <div className="flex flex-col gap-1.5 mt-4">
              <div className="text-sm leading-5 font-medium text-ivygrey">Confirm Password*</div>
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className="bg-transparent border border-textGrey py-2.5 px-3 rounded-lg outline-none focus:border-white text-ivygrey2 text-base font-normal placeholder:text-ivygrey2"
                placeholder="Confirm Password"
              />
              {passwordMismatch() && (
                <div className="text-sm leading-5 font-medium text-red-800">
                  {getMessage("ConfirmPasswordMismatch")}
                </div>
              )}
              {!passwordMismatch() && (
                <div className="text-sm leading-5 font-medium text-ivygrey">
                  Must be at least 8 characters.
                </div>
              )}
            </div>
            <button
              type="submit"
              className={`mt-6 py-2.5 px-4 bg-accent/[0.10] border rounded-lg w-full ${buttonClasses}`}
              disabled={!allowResetBtn()}
            >
              Reset Password
            </button>
          </form>
        </div>
        <div className="flex text-ivygrey gap-1 justify-center">
          <div>Remember your password?</div>
          <Link to="/login">
            <div className="text-accent">Log in</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
