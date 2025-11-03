'use client';
import { useAuth } from '@/context/AuthContext';
import { SideNavBarAdmin } from './SideNavBarAdmin';
import { SideNavBarUser } from './SideNavBarUser';

export const SideNavBar = () => {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'user') return <SideNavBarUser />;
  if (user.role === 'admin') return <SideNavBarAdmin />;
  
};