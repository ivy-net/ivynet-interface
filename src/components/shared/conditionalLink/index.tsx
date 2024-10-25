import React, { FC } from 'react'
import { Link } from 'react-router-dom';

export type ConditionalLinkProps = {
  children: React.ReactNode;
  to?: string;
  openInNewTab?: boolean;
}

export const ConditionalLink: FC<ConditionalLinkProps> = ({ children, to, openInNewTab = false }) => {
  if (to === undefined) {
    return <>{children}</>
  }

  return <Link to={to} target={openInNewTab ? "_blank" : undefined}> {children}</Link>
}
