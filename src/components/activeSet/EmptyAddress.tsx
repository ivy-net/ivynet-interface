import React from "react";
import { Link, Outlet } from "react-router-dom";

export const EmptyAddresses: React.FC = () => {
  return (
    <>
      <div className="flex flex-col justify-center items-center w-full min-h-[400px] gap-6">
        <div className="text-xl text-textSecondary text-center">
          Add an operator address to track your active set status across restaking protocols!
        </div>
        <Link
          to="/activeset/add"
          className="px-4 py-2 rounded-lg bg-bgButton hover:bg-textGrey text-textSecondary"
        >
          Add Address
        </Link>
      </div>
      <Outlet />
    </>
  );
};
