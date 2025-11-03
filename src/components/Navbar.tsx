'use client';

import { useAuth } from '@/context/AuthContext';
import { NavbarAdmin } from './NavbarAdmin';
import { NavbarUser } from './NavbarUser';
import { NavbarPublic } from './NavbarPublic';

interface NavbarProps {
  activeTab?: string; // optional, to avoid errors when not passed
}

export const Navbar = ({ activeTab }: NavbarProps) => {
  const { user } = useAuth();

  if (!user) {
    // No one is logged in → show public navbar
    return <NavbarPublic />;
  }

  // Logged in user → show based on role
   if (user.role === 'user') {         
    return <NavbarUser />;
    }
  if (user.role === 'admin') {
    return <NavbarAdmin activeTab={activeTab || ''} />;
  }
   
  }
