'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaChevronRight, FaUserCircle, FaShieldAlt, FaListAlt } from 'react-icons/fa';

// Animation variants for container and items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
};

interface UserData {
  id: string;
  display_name?: string | null;
  company_email?: string | null;
  password_count?: number | null;
}

// Motion-wrapped Next Link
const MotionLink = motion(Link);

export default function UsersTable({ users }: { users: UserData[] }) {
  const list = Array.isArray(users) ? users : [];

  if (list.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-lg mt-4">
        <FaListAlt className="text-6xl text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-lg font-semibold">No active users found.</p>
        <p className="text-sm text-slate-400">The user list is empty or could not be loaded.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-3 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {list.map((user) => {
        const id = user.id ?? '';
        const name = user.display_name ?? 'Unknown User';
        const email = user.company_email ?? '';
        const pwdCount = user.password_count ?? 0;

        // safe href fallback
        const userHref = id ? `/admin/password-manager/users/${id}` : '#';

        return (
          <motion.div key={id || name} variants={itemVariants}>
            <MotionLink
              href={userHref}
              passHref
              onClick={userHref === '#' ? (e) => e.preventDefault() : undefined}
              whileTap={{ scale: 0.97, opacity: 0.9 }}
              whileHover={{
                scale: 1.01,
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                borderColor: '#6366f1',
              }}
              className={`bg-white border rounded-xl p-5 flex items-center gap-5 cursor-pointer transition-all duration-200 ease-out
                ${userHref === '#' ? 'opacity-50 pointer-events-none border-red-300' : 'border-gray-200'}`}
            >
              <div className="flex items-center flex-grow gap-4">
                <FaUserCircle className="text-5xl text-indigo-400" />
                <div className="flex-grow">
                  <p className="font-extrabold text-xl text-slate-800 truncate">{name}</p>
                  <p className="text-sm text-slate-500 font-medium truncate">{email}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 flex-shrink-0">
                <div className="text-right min-w-[120px] pr-2">
                  <div className="flex items-center justify-end gap-2 text-indigo-600">
                    <FaShieldAlt className="text-lg" />
                    <p className="font-extrabold text-2xl">{pwdCount}</p>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Total Passwords</p>
                </div>

                <motion.div className="p-2 bg-indigo-50 rounded-full" whileHover={{ x: 5 }}>
                  <FaChevronRight className="text-indigo-600 text-lg" />
                </motion.div>
              </div>
            </MotionLink>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
