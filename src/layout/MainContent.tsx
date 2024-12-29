import React from 'react';
interface MainContentProps {
  children: React.ReactNode
}

export const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <div className="flex m-2.5 w-[calc(100%-256px)]">
      <div className="grid grid-rows-[auto_1fr] bg-contentBg w-full rounded-2xl py-9 px-10 gap-10 h-[calc(100vh-20px)]">
        {children}
      </div>
    </div>
  );
}