import React, { ReactNode } from 'react';
import { Box } from 'folds';
import { MobileDrawerGestures } from '../../components/mobile-drawer';

type ClientLayoutProps = {
  nav: ReactNode;
  children: ReactNode;
};
export function ClientLayout({ nav, children }: ClientLayoutProps) {
  return (
    <Box grow="Yes">
      <MobileDrawerGestures />
      <Box shrink="No">{nav}</Box>
      <Box grow="Yes">{children}</Box>
    </Box>
  );
}
