import React from "react"
import { NavLink, useLocation } from "react-router-dom";

interface SidebarItemProps {
  title: string;
  Logo: any;
  to?: string
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ title = "", Logo, to }) => {
  to = to !== undefined ? to : title.toLowerCase()
  const location = useLocation();

  if (to.startsWith("./")) {
    to = to.replace("./", `${location.pathname}/`)
  }

  return (
    <NavLink to={to} className={({ isActive }) => [isActive ? "stroke-sidebarIconHighlightColor text-sidebarTextHighlightColor" : "stroke-sidebarColor text-sidebarColor"].join(" ")}>
      <div className="flex justify-left items-center gap-2.5 p-3 rounded-lg   hover:bg-sidebarHoverBg">
        <Logo />
        <div className="text-base font-medium leading-5">{title}</div>
      </div>
    </NavLink>
  );
}
