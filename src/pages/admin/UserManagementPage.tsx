import React, { useState } from 'react';
import { Users, UserPlus, Shield, CheckCircle, XCircle, Edit, Trash2, Key, Filter, Search, Lock, Unlock } from 'lucide-react';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'JUDGE' | 'LAWYER' | 'COURT_STAFF' | 'CITIZEN' | 'ADMIN';
  court: string;
  status: 'APPROVED' | 'PENDING' | 'SUSPENDED';
  lastActive: string;
  permissions: string[];
}

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>([
    {
      id: 'usr_1',
      name: 'Hon\'ble Justice Rajesh Sharma',
      email: 'r.sharma@judiciary.gov.in',
      role: 'JUDGE',
      court: 'High Court of Judicature at Bombay',
      status: 'APPROVED',
      lastActive: 'Just now',
      permissions: ['Sign Draft Orders', 'View Vault', 'Access AI RAG', 'Schedule Hearings']
    },
    {
      id: 'usr_2',
      name: 'Adv. Vikramaditya Sen',
      email: 'vikram.sen@lawfirm.in',
      role: 'LAWYER',
      court: 'Bombay High Court & DRT',
      status: 'APPROVED',
      lastActive: '10 mins ago',
      permissions: ['Submit Pleadings', 'View Vault', 'Access AI RAG']
    },
    {
      id: 'usr_3',
      name: 'Suresh Patil (Registrar)',
      email: 'patil.s@judiciary.gov.in',
      role: 'COURT_STAFF',
      court: 'District Civil & Criminal Court',
      status: 'APPROVED',
      lastActive: '1 hour ago',
      permissions: ['Manage Allocations', 'Issue Summons', 'File Indexing']
    },
    {
      id: 'usr_4',
      name: 'Ramesh Patel',
      email: 'ramesh.patel@gmail.com',
      role: 'CITIZEN',
      court: 'Litigant Citizen Portal',
      status: 'APPROVED',
      lastActive: '3 hours ago',
      permissions: ['View Case Status', 'Plain AI Assistance', 'Legal Aid Generator']
    },
    {
      id: 'usr_5',
      name: 'Priya Nair (System Admin)',
      email: 'admin@lexora.gov.in',
      role: 'ADMIN',
      court: 'National Judicial Data Grid',
      status: 'APPROVED',
      lastActive: 'Just now',
      permissions: ['Full Governance', 'User Management', 'Lockdown Control', 'Audit Export']
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'JUDGE' | 'LAWYER' | 'COURT_STAFF' | 'CITIZEN' | 'ADMIN'>('LAWYER');
  const [newCourt, setNewCourt] = useState('High Court of Judicature');

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED';
          setActionMsg(`Updated user account ${u.name} status to ${nextStatus}`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
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
      permissions: newRole === 'JUDGE' ? ['Sign Draft Orders', 'View Vault', 'Access AI RAG'] : ['Submit Pleadings', 'View Vault']
    };
    setUsers([newUser, ...users]);
    setShowAddUserModal(false);
    setNewName('');
    setNewEmail('');
    setActionMsg(`New official user ${newName} provisioned successfully!`);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="border-b border-white/15 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#C9A24B]" />
            User Access & Role-Based Access Control (RBAC) Management
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Manage System Users, Assign Roles, Provision Judicial Accounts & Enforce Security Permissions
          </p>
        </div>

        <button
          onClick={() => setShowAddUserModal(true)}
          className="px-4 py-2.5 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User Account</span>
        </button>
      </div>

      {/* Action Notification */}
      {actionMsg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Controls & Search Bar */}
      <div className="bg-[#132240] border border-white/15 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-lg">
        <div className="flex-1 w-full sm:w-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-slate-400 outline-none focus:border-[#C9A24B]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#C9A24B]" />
          <span className="text-xs font-bold text-slate-300">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-[#0F1B33] border border-white/20 rounded-lg text-xs font-bold text-[#C9A24B] outline-none cursor-pointer"
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
      <div className="bg-[#132240] border border-white/15 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/15 bg-[#0F1B33] flex justify-between items-center">
          <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#C9A24B]" />
            Registered System Users ({filteredUsers.length})
          </h2>
          <span className="text-xs text-slate-300">Active Access Tokens Verified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0A1428] text-slate-300 font-serif uppercase tracking-wider border-b border-white/15">
              <tr>
                <th className="px-4 py-3">User Name & Email</th>
                <th className="px-4 py-3">Assigned Role</th>
                <th className="px-4 py-3">Court / Organization</th>
                <th className="px-4 py-3">Active Permissions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-bold text-white">{u.name}</div>
                    <div className="text-[10px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold border ${
                      u.role === 'JUDGE' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      u.role === 'LAWYER' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                      u.role === 'ADMIN' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                      'bg-slate-500/20 text-slate-300 border-slate-500/30'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{u.court}</td>
                  <td className="px-4 py-3 text-slate-300 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {u.permissions.map((p, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-slate-300">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      u.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                        u.status === 'APPROVED'
                          ? 'bg-rose-600/30 text-rose-200 border border-rose-500/40 hover:bg-rose-600/50'
                          : 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-600/50'
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
      <div className="bg-[#132240] border border-white/15 rounded-xl p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-[#C9A24B]" />
          System Security Role-Based Access Control (RBAC) Matrix
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white/5 border border-white/15 rounded-xl space-y-2">
            <h3 className="font-bold text-amber-400 font-serif">Judicial Officer (Judge)</h3>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>✓ Sign AI Draft Orders</li>
              <li>✓ Access Confidential Smart Vault</li>
              <li>✓ AI Hearing Scheduler</li>
              <li>✓ Full Judicial Audit Log Access</li>
            </ul>
          </div>

          <div className="p-4 bg-white/5 border border-white/15 rounded-xl space-y-2">
            <h3 className="font-bold text-cyan-400 font-serif">Advocate (Lawyer)</h3>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>✓ Submit Pleadings & Documents</li>
              <li>✓ Legal Research & Precedent Search</li>
              <li>✓ Draft Generator (Unsigned Drafts)</li>
              <li>✓ Case Hearing Notifications</li>
            </ul>
          </div>

          <div className="p-4 bg-white/5 border border-white/15 rounded-xl space-y-2">
            <h3 className="font-bold text-emerald-400 font-serif">Court Registry Staff</h3>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>✓ New Case Entry & Indexing</li>
              <li>✓ Issue Summons & Legal Notices</li>
              <li>✓ Courtroom Schedule Allocations</li>
              <li>✓ Evidence Storage Management</li>
            </ul>
          </div>

          <div className="p-4 bg-white/5 border border-white/15 rounded-xl space-y-2">
            <h3 className="font-bold text-purple-400 font-serif">Litigant Citizen</h3>
            <ul className="space-y-1 text-slate-300 text-[11px]">
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#132240] border border-white/20 rounded-2xl w-full max-w-md text-white shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/15 bg-[#0F1B33] flex justify-between items-center">
              <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#C9A24B]" />
                Provision New User Account
              </h2>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddUser} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adv. Ananya Deshmukh"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email Address:</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ananya@lawfirm.in"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role Assignment:</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#0F1B33] border border-white/20 rounded-lg text-white"
                  >
                    <option value="JUDGE">Judge</option>
                    <option value="LAWYER">Lawyer</option>
                    <option value="COURT_STAFF">Court Staff</option>
                    <option value="CITIZEN">Citizen</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Court Bench:</label>
                  <input
                    type="text"
                    required
                    value={newCourt}
                    onChange={(e) => setNewCourt(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] font-bold rounded-xl shadow-lg mt-2 cursor-pointer"
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
