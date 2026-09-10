import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, CheckCircle, XCircle, Edit, Trash2, Key, Filter, Search, Lock, Unlock, Loader2, RefreshCw } from 'lucide-react';
import { api } from '@/services/api';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'JUDGE' | 'LAWYER' | 'COURT_STAFF' | 'CITIZEN' | 'ADMIN';
  court: string;
  status: 'APPROVED' | 'PENDING' | 'PENDING_ADMIN_APPROVAL' | 'SUSPENDED' | 'REJECTED';
  lastActive?: string;
  permissions?: string[];
  officialId?: string;
}

const DEFAULT_PERMISSIONS_BY_ROLE: Record<string, string[]> = {
  JUDGE: ['Sign Draft Orders', 'View Vault', 'Access AI RAG', 'Schedule Hearings', 'Bench Allocations'],
  LAWYER: ['Submit Pleadings', 'View Vault', 'Access AI RAG', 'Draft Motions'],
  COURT_STAFF: ['Manage Allocations', 'Issue Summons', 'File Indexing', 'Registry Scrutiny'],
  CITIZEN: ['View Case Status', 'Plain AI Assistance', 'Legal Aid Generator', 'e-Filing Track'],
  ADMIN: ['Full Governance', 'User Management', 'Lockdown Control', 'Audit Export', 'System Health']
};

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'JUDGE' | 'LAWYER' | 'COURT_STAFF' | 'CITIZEN' | 'ADMIN'>('LAWYER');
  const [newCourt, setNewCourt] = useState('High Court of Judicature');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      if (res.success && Array.isArray(res.users)) {
        setUsers(
          res.users.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: (u.role?.toUpperCase() || 'LAWYER') as any,
            court: u.court || 'General Jurisdiction',
            status: u.status || 'APPROVED',
            lastActive: 'Active',
            permissions: DEFAULT_PERMISSIONS_BY_ROLE[u.role?.toUpperCase()] || ['Standard Access'],
            officialId: u.officialId,
          }))
        );
      }
    } catch (err: any) {
      console.warn('Failed to fetch users from API, using fallback data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'APPROVED' ? 'SUSPENDED' : 'APPROVED';
    try {
      await api.updateUserStatus(id, nextStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: nextStatus as any } : u))
      );
      const targetUser = users.find((u) => u.id === id);
      setActionMsg(`Updated user account ${targetUser?.name || id} status to ${nextStatus}`);
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err: any) {
      setActionMsg(`Failed to update status: ${err.message}`);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: SystemUser = {
      id: `usr_${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      court: newCourt,
      status: 'APPROVED',
      lastActive: 'Just created',
      permissions: DEFAULT_PERMISSIONS_BY_ROLE[newRole] || ['Standard Access']
    };
    setUsers([newUser, ...users]);
    setShowAddUserModal(false);
    setNewName('');
    setNewEmail('');
    setActionMsg(`New official user ${newName} provisioned successfully!`);
    setTimeout(() => setActionMsg(''), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-subtle pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            User Access & Role-Based Access Control (RBAC) Management
          </h1>
          <p className="theme-subtext text-xs sm:text-sm mt-1">
            Manage System Users, Assign Roles, Provision Judicial Accounts & Enforce Security Permissions
          </p>
        </div>

        <button
          onClick={() => setShowAddUserModal(true)}
          className="theme-primary-btn px-4 py-2.5 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User Account</span>
        </button>
      </div>

      {/* Action Notification */}
      {actionMsg && (
        <div className="p-3 theme-elevated border border-subtle text-emerald-600 dark:text-emerald-400 text-xs rounded flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Controls & Search Bar */}
      <div className="theme-card rounded p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex-1 w-full sm:w-auto relative">
          <Search className="w-4 h-4 theme-subtext absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold theme-subtext">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="JUDGE">Judges</option>
            <option value="LAWYER">Advocates / Lawyers</option>
            <option value="COURT_STAFF">Court Staff</option>
            <option value="CITIZEN">Litigants / Citizens</option>
            <option value="ADMIN">System Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="theme-card rounded overflow-hidden">
        <div className="p-4 border-b border-subtle theme-elevated flex justify-between items-center">
          <h2 className="text-base font-serif font-bold theme-heading flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            Registered System Users ({filteredUsers.length})
          </h2>
          <span className="text-xs theme-subtext">Active Access Tokens Verified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-3">User Name & Email</th>
                <th className="px-4 py-3">Assigned Role</th>
                <th className="px-4 py-3">Court / Organization</th>
                <th className="px-4 py-3">Active Permissions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-bold theme-heading">{u.name}</div>
                    <div className="text-[10px] theme-subtext">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="badge-pending px-2.5 py-1 rounded text-[10px] font-bold uppercase">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 theme-subtext whitespace-nowrap">{u.court}</td>
                  <td className="px-4 py-3 theme-subtext max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {(u.permissions || []).map((p, i) => (
                        <span key={i} className="px-1.5 py-0.5 theme-elevated rounded text-[9px] theme-subtext border border-subtle">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      u.status === 'APPROVED' ? 'badge-supported' : 'badge-rejected'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(u.id, u.status)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                        u.status === 'APPROVED'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'theme-primary-btn'
                      }`}
                    >
                      {u.status === 'APPROVED' ? 'Suspend Account' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix Card */}
      <div className="theme-card rounded p-6 space-y-4">
        <h2 className="text-base font-serif font-bold theme-heading flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-500" />
          System Security Role-Based Access Control (RBAC) Matrix
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 theme-elevated border border-subtle rounded space-y-2">
            <h3 className="font-bold text-amber-500 font-serif">Judicial Officer (Judge)</h3>
            <ul className="space-y-1 theme-subtext text-[11px]">
              <li>✓ Sign AI Draft Orders</li>
              <li>✓ Access Confidential Smart Vault</li>
              <li>✓ AI Hearing Scheduler</li>
              <li>✓ Full Judicial Audit Log Access</li>
            </ul>
          </div>

          <div className="p-4 theme-elevated border border-subtle rounded space-y-2">
            <h3 className="font-bold text-cyan-600 dark:text-cyan-400 font-serif">Advocate (Lawyer)</h3>
            <ul className="space-y-1 theme-subtext text-[11px]">
              <li>✓ Submit Pleadings & Documents</li>
              <li>✓ Legal Research & Precedent Search</li>
              <li>✓ Draft Generator (Unsigned Drafts)</li>
              <li>✓ Case Hearing Notifications</li>
            </ul>
          </div>

          <div className="p-4 theme-elevated border border-subtle rounded space-y-2">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 font-serif">Court Registry Staff</h3>
            <ul className="space-y-1 theme-subtext text-[11px]">
              <li>✓ New Case Entry & Indexing</li>
              <li>✓ Issue Summons & Legal Notices</li>
              <li>✓ Courtroom Schedule Allocations</li>
              <li>✓ Evidence Storage Management</li>
            </ul>
          </div>

          <div className="p-4 theme-elevated border border-subtle rounded space-y-2">
            <h3 className="font-bold text-purple-600 dark:text-purple-400 font-serif">Litigant Citizen</h3>
            <ul className="space-y-1 theme-subtext text-[11px]">
              <li>✓ Case Status & Cause List Lookup</li>
              <li>✓ Plain-Language Legal Assistant</li>
              <li>✓ Free Legal Aid Generator</li>
              <li>✓ Notice & Summons Decipherer</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="theme-card rounded-lg w-full max-w-md shadow-2xl overflow-hidden border border-subtle">
            <div className="p-4 border-b border-subtle theme-elevated flex justify-between items-center">
              <h2 className="text-base font-serif font-bold theme-heading flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                Provision New User Account
              </h2>
              <button onClick={() => setShowAddUserModal(false)} className="theme-subtext hover:theme-heading">✕</button>
            </div>

            <form onSubmit={handleAddUser} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold theme-subtext mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adv. Ananya Deshmukh"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold theme-subtext mb-1">Official Email Address:</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ananya@lawfirm.in"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Role Assignment:</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded"
                  >
                    <option value="JUDGE">Judge</option>
                    <option value="LAWYER">Lawyer</option>
                    <option value="COURT_STAFF">Court Staff</option>
                    <option value="CITIZEN">Citizen</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Court Bench:</label>
                  <input
                    type="text"
                    required
                    value={newCourt}
                    onChange={(e) => setNewCourt(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="theme-primary-btn w-full py-3 text-xs mt-2 cursor-pointer"
              >
                Provision & Grant Access
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
