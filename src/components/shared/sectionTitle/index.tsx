import React from "react";

interface SectionTitleProps {
  title: string;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, className = "" }) => {

  return (
    <h3 className={className}>{title}</h3>
  );
}
