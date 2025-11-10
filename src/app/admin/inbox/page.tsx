'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  MailOpen, 
  Trash2, 
  Star, 
  AlertTriangle, 
  Shield, 
  Users, 
  Key,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

type MessageType = 'security-alert' | 'user-request' | 'system' | 'device-approval';
type MessagePriority = 'high' | 'medium' | 'low';
type MessageStatus = 'unread' | 'read' | 'archived';

interface Message {
  id: number;
  from: string;
  subject: string;
  preview: string;
  type: MessageType;
  priority: MessagePriority;
  status: MessageStatus;
  timestamp: string;
  starred: boolean;
  hasAttachment?: boolean;
}

const DUMMY_MESSAGES: Message[] = [
  {
    id: 1,
    from: 'Security System',
    subject: 'Critical: Multiple Failed Login Attempts Detected',
    preview: 'User john.doe@company.com has attempted to login 5 times with incorrect credentials. Account has been temporarily locked for security purposes.',
    type: 'security-alert',
    priority: 'high',
    status: 'unread',
    timestamp: '2025-11-10T09:30:00Z',
    starred: true,
  },
  {
    id: 2,
    from: 'Sarah Mitchell',
    subject: 'New Device Registration Request',
    preview: 'User requesting approval to register iPhone 15 Pro (iOS 17.1) for MFA authentication. Device fingerprint verified.',
    type: 'device-approval',
    priority: 'medium',
    status: 'unread',
    timestamp: '2025-11-10T08:45:00Z',
    starred: false,
    hasAttachment: true,
  },
  {
    id: 3,
    from: 'DLP System',
    subject: 'Password Manager: Weak Password Alert',
    preview: '15 users are currently using weak passwords. Recommended action: enforce password policy update and notify affected users.',
    type: 'security-alert',
    priority: 'medium',
    status: 'read',
    timestamp: '2025-11-10T07:20:00Z',
    starred: false,
  },
  {
    id: 4,
    from: 'Michael Chen',
    subject: 'Access Request: Admin Dashboard',
    preview: 'User requesting elevated privileges to access admin dashboard for quarterly reporting. Current role: User.',
    type: 'user-request',
    priority: 'low',
    status: 'read',
    timestamp: '2025-11-09T16:30:00Z',
    starred: false,
  },
  {
    id: 5,
    from: 'System Notification',
    subject: 'Daily Security Report - November 9, 2025',
    preview: 'Summary: 3 new users added, 12 password changes, 45 successful logins, 2 failed MFA attempts. All systems operational.',
    type: 'system',
    priority: 'low',
    status: 'read',
    timestamp: '2025-11-09T15:00:00Z',
    starred: true,
  },
  {
    id: 6,
    from: 'Emily Rodriguez',
    subject: 'Passkey Setup Assistance Required',
    preview: 'User experiencing issues setting up WebAuthn passkey on Windows device. Browser: Chrome 119. Error code: NotAllowedError.',
    type: 'user-request',
    priority: 'medium',
    status: 'unread',
    timestamp: '2025-11-09T14:15:00Z',
    starred: false,
  },
  {
    id: 7,
    from: 'Security System',
    subject: 'Suspicious Activity: Data Export Attempt',
    preview: 'User david.brown@company.com attempted to export sensitive credential data at unusual hours (2:30 AM). Action blocked by DLP policy.',
    type: 'security-alert',
    priority: 'high',
    status: 'unread',
    timestamp: '2025-11-09T02:30:00Z',
    starred: true,
  },
  {
    id: 8,
    from: 'User Group Manager',
    subject: 'New User Group Created: Engineering Team',
    preview: '25 users added to new user group "Engineering Team". Permissions: Password Manager access, Device Registration, Standard User.',
    type: 'system',
    priority: 'low',
    status: 'read',
    timestamp: '2025-11-08T11:00:00Z',
    starred: false,
  },
  {
    id: 9,
    from: 'James Wilson',
    subject: 'TOTP Reset Request',
    preview: 'User lost access to authenticator app after phone replacement. Requesting 2FA reset to setup new TOTP credentials.',
    type: 'user-request',
    priority: 'high',
    status: 'unread',
    timestamp: '2025-11-08T09:45:00Z',
    starred: false,
  },
  {
    id: 10,
    from: 'DLP System',
    subject: 'Shared Password Expired',
    preview: 'Password shared with maria.garcia@company.com has expired after 24 hours. Access automatically revoked as per security policy.',
    type: 'system',
    priority: 'low',
    status: 'read',
    timestamp: '2025-11-07T18:00:00Z',
    starred: false,
  },
];

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>(DUMMY_MESSAGES);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | MessageType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const getTypeIcon = (type: MessageType) => {
    switch (type) {
      case 'security-alert': return <AlertTriangle className="text-red-500" size={18} />;
      case 'user-request': return <Users className="text-blue-500" size={18} />;
      case 'device-approval': return <Shield className="text-purple-500" size={18} />;
      case 'system': return <Key className="text-gray-500 dark:text-gray-400" size={18} />;
    }
  };

  const getPriorityColor = (priority: MessagePriority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'low': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleMarkAsRead = (id: number) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, status: 'read' as MessageStatus } : msg
    ));
  };

  const handleToggleStar = (id: number) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, starred: !msg.starred } : msg
    ));
  };

  const handleDelete = (id: number) => {
    setMessages(messages.filter(msg => msg.id !== id));
    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
    }
  };

  const filteredMessages = messages
    .filter(msg => filter === 'all' || msg.type === filter)
    .filter(msg => 
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.preview.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const unreadCount = messages.filter(msg => msg.status === 'unread').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#101828] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Inbox</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter size={16} />
                Filter
                <ChevronDown size={16} />
              </button>
              
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => { setFilter('all'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 first:rounded-t-lg"
                  >
                    All Messages
                  </button>
                  <button
                    onClick={() => { setFilter('security-alert'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                  >
                    <AlertTriangle size={16} className="text-red-500" />
                    Security Alerts
                  </button>
                  <button
                    onClick={() => { setFilter('user-request'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                  >
                    <Users size={16} className="text-blue-500" />
                    User Requests
                  </button>
                  <button
                    onClick={() => { setFilter('device-approval'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                  >
                    <Shield size={16} className="text-purple-500" />
                    Device Approvals
                  </button>
                  <button
                    onClick={() => { setFilter('system'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2 last:rounded-b-lg"
                  >
                    <Key size={16} className="text-gray-500" />
                    System Messages
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1 space-y-2">
            <AnimatePresence>
              {filteredMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (message.status === 'unread') handleMarkAsRead(message.id);
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedMessage?.id === message.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600'
                      : message.status === 'unread'
                      ? 'bg-white dark:bg-[#1a2332] border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {message.status === 'unread' ? (
                        <Mail className="text-blue-600 dark:text-blue-400" size={20} />
                      ) : (
                        <MailOpen className="text-gray-400 dark:text-gray-500" size={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-semibold text-sm truncate ${
                          message.status === 'unread' 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {message.from}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStar(message.id);
                          }}
                          className="flex-shrink-0"
                        >
                          <Star
                            size={16}
                            className={message.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
                          />
                        </button>
                      </div>
                      <p className={`text-sm mb-2 truncate ${
                        message.status === 'unread'
                          ? 'text-gray-900 dark:text-white font-medium'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {message.subject}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2 mb-2">
                        {message.preview}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getTypeIcon(message.type)}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredMessages.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700">
                <Mail className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={48} />
                <p className="text-gray-500 dark:text-gray-400">No messages found</p>
              </div>
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <motion.div
                key={selectedMessage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(selectedMessage.type)}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedMessage.subject}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        From: {selectedMessage.from}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleStar(selectedMessage.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Star
                        size={20}
                        className={selectedMessage.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 dark:text-gray-500'}
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} className="text-red-500 dark:text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(selectedMessage.priority)}`}>
                    {selectedMessage.priority} priority
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(selectedMessage.timestamp).toLocaleString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="prose dark:prose-invert max-w-none mb-6">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedMessage.preview}
                  </p>
                </div>

                {selectedMessage.type === 'security-alert' && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 dark:text-red-300 mb-1">Security Alert</h4>
                        <p className="text-sm text-red-800 dark:text-red-400">
                          Immediate action may be required. Review the details and take appropriate measures to secure your system.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMessage.type === 'user-request' && (
                  <div className="flex gap-3 mt-6">
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                      <CheckCircle2 size={18} />
                      Approve Request
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                      <XCircle size={18} />
                      Deny Request
                    </button>
                  </div>
                )}

                {selectedMessage.type === 'device-approval' && (
                  <div className="flex gap-3 mt-6">
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                      <Shield size={18} />
                      Approve Device
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                      View Device Details
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-[#1a2332] rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Mail className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select a message
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a message from the list to view its details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}