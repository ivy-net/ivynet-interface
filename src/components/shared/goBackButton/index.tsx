import React from "react";
import chevronLeft from "./../../../images/chevron-left.svg"
import { Link } from "react-router-dom";

interface GoBackButtonProps {
  to: string;
};

export const GoBackButton: React.FC<GoBackButtonProps> = ({ to }) => {

  return (
    <>
      <Link to={to}>
        <img src={chevronLeft} alt="go back button" />
      </Link>
    </>
  );
}
