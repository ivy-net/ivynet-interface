import React from "react";
import server from "../../images/server.svg"
import { Link } from "react-router-dom";

interface EmptyMachinesProps {
};

export const EmptyMachines: React.FC<EmptyMachinesProps> = () => {
  return (
    <div className="flex flex-col w-full justify-center items-center gap-5">
      <img className="w-[76px]" src={server} alt="server" />
      <div className="w-[552px]">
        <span className="justify-center text-base font-medium text-ivywhite">Install IvyNet on your machines and track your active set status </span>
        <span className="justify-center text-sidebarColor">in order to optimize your restaking experience</span>
      </div>
      <div className="flex gap-4">
        <a href="https://docs.ivynet.dev/docs/client/quickstartguide/" target="_blank" rel="noopener noreferrer">
          <button className="py-2.5 px-4 bg-accent/[0.10] border border-accent text-accent rounded-lg text-base font-semibold">
            Install IvyNet Client
          </button>
        </a>
        <Link to="/activeset">
          <button className="py-2.5 px-4 bg-accent/[0.10] border border-accent text-accent rounded-lg text-base font-semibold">
            Active Set
          </button>
        </Link>
      </div>
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
