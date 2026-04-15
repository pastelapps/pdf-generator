import React from 'react';

type PageHeaderProps = {
  logoBranco: string;
};

export function PageHeader({ logoBranco }: PageHeaderProps) {
  return (
    <header className="page-header">
      <img src={logoBranco} alt="Logo" className="page-header-logo" />
    </header>
  );
}
