import React from "react";

interface SectionTitleProps {
  title: string;
};

export const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => {

  return (
    <h3>{title}</h3>
  );
}
