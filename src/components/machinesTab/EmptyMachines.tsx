import React from "react";
import server from "../../images/server.svg"
import { Link } from "react-router-dom";


interface EmptyMachinesProps {
  onClick: any;
};

export const EmptyMachines: React.FC<EmptyMachinesProps> = ({ onClick }) => {

  return (
    <div className="flex flex-col w-full justify-center items-center gap-5">
      <img className="w-[76px]" src={server} alt="server" />
      <div className="w-[552px]">
        <span className="justify-center text-base font-medium text-ivywhite">Install IvyNet Client on your operator node </span>
        <span className="justify-center text-sidebarColor">in order to optimize your restaking experience, starting with the EigenLayer ecosystem</span>
      </div>
      <Link to="" onClick={onClick}>
        <button className="py-2.5 px-4 bg-accent/[0.10] border border-accent text-accent rounded-lg text-base font-semibold">+ Install IvyNet Client</button>
      </Link>
      <div className="w-[552px]">
        <span className="justify-center text-sidebarColor">Just deployed IvyNet? It can take a few minutes to display.</span>
      </div>

      <div>
        <span className="text-ivygrey3">Need help reach out on </span>
        <Link to="">
          <span className="text-ivypurple">Telegram.</span>
        </Link>
      </div>
    </div>
  );
}
