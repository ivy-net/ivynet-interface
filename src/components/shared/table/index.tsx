import React from "react";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = "" }) => {
  return (
    <div className="relative isolate overflow-auto">
      <table className={`w-full ${className}`}>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}