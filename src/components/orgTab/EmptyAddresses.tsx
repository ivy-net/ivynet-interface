import React from "react";
import server from "../../images/server.svg"
import { Link } from "react-router-dom";


interface EmptyAddressesProps {
};

export const EmptyAddresses: React.FC<EmptyAddressesProps> = () => {

  return (
    <div className="flex flex-col w-full justify-center items-center gap-5">
      <img className="w-[76px]" src={server} alt="server" />
      <div className="w-[552px]">
        <span className="justify-center text-base font-medium text-ivywhite">Add Operator Address </span>
        <span className="justify-center text-sidebarColor">in order to view your metrics on a per address basis</span>
      </div>
      <Link to="edit/keys">
        <button className="py-2.5 px-4 bg-accent/[0.10] border border-accent text-accent rounded-lg text-base font-semibold">+ Add Address</button>
      </Link>
      <div className="w-[552px]">
        <span className="justify-center text-sidebarColor">Just deployed IvyNet? It can take a few minutes to display.</span>
      </div>

      <div>
        <span className="text-ivygrey3">Need help reach out on </span>
        <a href="https://t.me/ivynetdotdev" target="_blank" rel="noopener noreferrer">
          <span className="text-ivypurple">Telegram.</span>
        </a>
      </div>
    </div>
  );
}
