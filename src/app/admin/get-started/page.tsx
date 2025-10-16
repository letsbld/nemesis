'use client';

import Link from 'next/link';
import { LayoutDashboard, Cpu, Users, ShieldCheck, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminGetStarted() {
  const sections = [
    {
      title: 'Dashboard',
      description: 'Your main overview for system status, quick stats, and recent activity.',
      icon: <LayoutDashboard className="w-6 h-6 text-blue-600" />,
    },
    {
      title: 'Device Management',
      description: 'Manage all registered devices, view details, and send commands to endpoints.',
      icon: <Cpu className="w-6 h-6 text-indigo-600" />,
    },
    {
      title: 'User Management',
      description: 'Create and manage users and groups. Assign roles and permissions easily.',
      icon: <Users className="w-6 h-6 text-emerald-600" />,
    },
    {
      title: 'Security',
      description: 'Configure SSO, authentication policies, and review access logs.',
      icon: <ShieldCheck className="w-6 h-6 text-rose-600" />,
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Subtle Background Accent */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-blue-200 rounded-full blur-3xl opacity-20 top-20 -left-40 animate-pulse" />
        <div className="absolute w-[400px] h-[400px] bg-indigo-300 rounded-full blur-3xl opacity-20 bottom-10 -right-20 animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <div className="bg-blue-100 p-4 rounded-full mb-6">
            <Rocket className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get Started with the Admin Panel
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            Welcome to the <span className="font-semibold text-blue-700">DLP Admin Console</span> 🚀  
            Here’s a quick guide to help you explore all the main features available to admins.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid gap-8 md:grid-cols-2"
        >
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-lg p-6 border border-gray-100 text-left transition-all"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                  {section.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{section.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16"
        >
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl text-lg font-medium shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
          >
            <Rocket className="w-5 h-5" />
            Go to Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
