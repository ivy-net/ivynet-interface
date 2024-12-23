import React from "react";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = "" }) => {
  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <table className={`w-full ${className}`}>
          <tbody className="relative">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
