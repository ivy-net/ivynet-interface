import React from "react";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = "" }) => {
  return (
    <table className={`w-full ${className}`}>
      <tbody>
        {children}
      </tbody>
    </table>
  );
};
