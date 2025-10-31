'use client';

import { useAuth } from '@/context/AuthContext';
import { NavbarAdmin } from './NavbarAdmin';
import { NavbarUser } from './NavbarUser';
import { NavbarPublic } from './NavbarPublic';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <NavbarAdmin />;
  }

  if (user?.role === 'user') {
    return <NavbarUser />;
  }

  return <NavbarPublic />;
};
