import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiFetch } from "../../utils";
import ivySmall from "../../images/ivy-small.svg";


export const OrganizationConfirm = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const handleConfirmation = async () => {
    try {
      const response = await apiFetch(`organization/confirm/${token}`, "GET");

      toast.success('Organization verified successfully!');
      navigate('/login');
    } catch (err) {
      toast.error('Failed to verify organization. Please try again or contact support.');
      console.error('Verification error:', err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-contentBg">
      <div className="flex flex-col w-[440px] h-[464px] gap-4">
        <div className="flex flex-col gap-3">
          <img className="w-[48px] h-[48px]" src={ivySmall} alt="ivy-logo" />
          <div className="text-ivywhite text-2xl leading-9 font-bold">Verify Organization</div>
          <div className="text-ivywhite text-lg leading-6 font-normal">
            <span>Click the button below to verify your organization and activate your </span>
            <span className="font-bold">IvyNet</span>
            <span> account.</span>
          </div>
        </div>
        <div className="flex flex-col gap-6" style={{ marginTop: "30px" }}>
          <button
            onClick={handleConfirmation}
            className="py-2.5 px-4 bg-accent/[0.10] border border-accent text-accent rounded-lg w-full"
          >
            Verify Organization
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationConfirm;
