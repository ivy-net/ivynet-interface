import React from "react";

interface TrProps {
  children: React.ReactNode;
};

export const Tr: React.FC<TrProps> = ({ children }) => {
  return (
    <tr className="relative"> {/* Added relative positioning */}
      {children}
    </tr>
  );
}
