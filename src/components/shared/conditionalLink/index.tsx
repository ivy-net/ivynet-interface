import React, { FC } from 'react'
import { Link } from 'react-router-dom';

export type ConditionalLinkProps = {
  children: React.ReactNode;
  to?: string;
}

export const ConditionalLink: FC<ConditionalLinkProps> = ({ children, to }) => {
  if (to === undefined) {
    return <>{children}</>
  }

  return <Link to={to}> {children}</Link>
}
