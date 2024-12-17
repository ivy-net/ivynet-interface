import React from "react";
import separator from "../../images/separator.svg"

interface UserProps {
  name: string;
  role?: string;
  desc: string;
  size?: "sm" | "md"
}

export const User: React.FC<UserProps> = ({ name, desc, role, size = "sm" }) => {
  const sizes = {
    "sm": {
      name: "text-base font-light",
      desc: "text-base font-light"
    },
    "md": {
      name: "text-xl leading-7 font-medium",
      desc: "text-base leading-6 font-medium"
    }
  }

  return (
    <div className="flex gap-1 items-center">
      <div className="p-2.5 h-[60px] w-[60px] flex justify-center items-center bg-sidebarIconHighlightColor/[0.15] rounded-full relative">
        <div className="text-accent">{name.charAt(0)}</div>
      </div>
      <div className="flex flex-col py-1.5 px-3 gap-1">
        <div className="flex gap-4">
          <h3 className={`text-textPrimary ${sizes[size].name}`}>{name}</h3>
          {role && <>
            <img src={separator} alt="separator" />
            <div className="text-base font-medium text-sidebarColor">Owner</div>
          </>}
        </div>
        <div className={`text-sidebarColor ${sizes[size].name}`}>{desc}</div>
      </div>
    </div>
  );
}
