import React from "react";
import { Sidebar } from "../components/Sidebar";
import { MainContent } from "./MainContent";


interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex bg-appBg text-textPrimary h-[100vh]">
      <Sidebar />
      <MainContent>
        {children}
      </MainContent>
    </div>
  );
}