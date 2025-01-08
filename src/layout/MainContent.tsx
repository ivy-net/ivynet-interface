import React from 'react';
interface MainContentProps {
  children: React.ReactNode
}

export const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <div className="flex m-2.5 w-[calc(100%-256px)]">
      <div className="flex flex-col bg-contentBg w-full rounded-2xl overflow-x-auto">
        <div className="min-w-[1200px] w-full flex flex-col py-9 px-10 gap-10">
          {children}
        </div>
      </div>
    </div>
  );
}


