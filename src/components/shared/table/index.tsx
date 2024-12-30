import React from "react";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = "" }) => {
  return (
    <div className="relative min-h-[200px] max-h-[calc(100vh-400px)] overflow-auto mt-6">
      <table className={`w-full ${className}`}>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}