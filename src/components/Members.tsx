import { useState, useRef, useEffect } from 'react';
import { UserPlus, Mail, MoreVertical, Shield, Clock, CheckCircle, Trash2 } from 'lucide-react';
import type { View } from '../App';
import { Navbar } from './Navbar';

interface MembersProps {
  onNavigate: (view: View) => void;
  language: 'en' | 'es';
  onLanguageChange: (lang: 'en' | 'es') => void;
}

interface MemberData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'member' | 'admin';
  status: 'active' | 'pending' | 'inactive';
  subscriptions: number;
  totalContribution: number;
  joinedDate: string;
  lastPayment: string;
}

// Initialize with empty members - will be loaded from database
const members: MemberData[] = [];

const translations = {
  en: {
    title: 'Family Members',
    subtitle: 'Manage your family group and their subscriptions',
    search: 'Search members...',
    inviteMember: 'Invite Member',
    totalMembers: 'Total Members',
    activeMembers: 'Active Members',
    pendingInvites: 'Pending Invites',
    name: 'Name',
    role: 'Role',
    subscriptions: 'Subscriptions',
    contribution: 'Contribution',
    status: 'Status',
    actions: 'Actions',
    owner: 'Owner',
    member: 'Member',
    admin: 'Admin',
    active: 'Active',
    pending: 'Pending',
    inactive: 'Inactive',
    makeAdmin: 'Make Admin',
    removeMember: 'Remove Member',
    removeAdmin: 'Remove Admin',
    confirmRemove: 'Confirm Removal',
    confirmRemoveMessage: 'Are you sure you want to remove this member? They will lose access to all shared subscriptions.',
    cancel: 'Cancel',
    confirm: 'Confirm',
    onlyAdminsCanPromote: 'Only administrators can promote members to admin',
    sendReminder: 'Send Reminder',
    removeUser: 'Remove User',
    joined: 'Joined',
    noMembers: 'No Members Yet',
    noMembersDesc: 'Start building your sharing group by inviting the first member'
  },
  es: {
    title: 'Miembros de la Familia',
    subtitle: 'Administra tu grupo familiar y sus suscripciones',
    search: 'Buscar miembros...',
    inviteMember: 'Invitar Miembro',
    totalMembers: 'Miembros Totales',
    activeMembers: 'Miembros Activos',
    pendingInvites: 'Invitaciones Pendientes',
    name: 'Nombre',
    role: 'Rol',
    subscriptions: 'Suscripciones',
    contribution: 'Contribución',
    status: 'Estado',
    actions: 'Acciones',
    owner: 'Propietario',
    member: 'Miembro',
    admin: 'Administrador',
    active: 'Activo',
    pending: 'Pendiente',
    inactive: 'Inactivo',
    makeAdmin: 'Hacer Administrador',
    removeMember: 'Eliminar Miembro',
    removeAdmin: 'Quitar Administrador',
    confirmRemove: 'Confirmar Eliminación',
    confirmRemoveMessage: '¿Estás seguro de que quieres eliminar este miembro? Perderá acceso a todas las suscripciones compartidas.',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    onlyAdminsCanPromote: 'Solo los administradores pueden promover miembros a administrador',
    sendReminder: 'Enviar Recordatorio',
    removeUser: 'Eliminar Usuario',
    joined: 'Unido',
    noMembers: 'Sin Miembros Aún',
    noMembersDesc: 'Comienza a construir tu grupo de compartición invitando al primer miembro'
  }
};

export function Members({ onNavigate, language, onLanguageChange }: MembersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [membersData, setMembersData] = useState<MemberData[]>(members);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  // Usuario actual es siempre el owner (Alex Martinez - id: '1')
  const currentUser = membersData.find(m => m.id === '1');
  const isCurrentUserOwner = currentUser?.role === 'owner';

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openMenuId]);

  const handleMakeAdmin = (memberId: string) => {
    if (isCurrentUserOwner) {
      setMembersData(membersData.map(m =>
        m.id === memberId ? { ...m, role: 'admin' as const } : m
      ));
      alert(language === 'es' ? 'Usuario promovido a administrador' : 'User promoted to administrator');
    }
    setOpenMenuId(null);
  };

  const handleRemoveUser = (memberId: string) => {
    if (memberId === '1') {
      alert(language === 'es' ? 'No puedes eliminar al propietario principal' : 'Cannot remove the main owner');
      setOpenMenuId(null);
      return;
    }
    
    if (confirm(language === 'es' ? '¿Estás seguro de que quieres eliminar este usuario?' : 'Are you sure you want to remove this user?')) {
      setMembersData(membersData.filter(m => m.id !== memberId));
      alert(language === 'es' ? 'Usuario eliminado correctamente' : 'User removed successfully');
    }
    setOpenMenuId(null);
  };

  const filteredMembers = membersData.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = membersData.filter(m => m.status === 'active').length;
  const pendingCount = membersData.filter(m => m.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={onNavigate} currentView="members" language={language} onLanguageChange={onLanguageChange} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <UserPlus className="w-4 h-4" />
            {t.inviteMember}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">{t.totalMembers}</span>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-2">{members.length}</div>
            <div className="text-sm text-gray-600">In your family group</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">{t.activeMembers}</span>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-2">{activeCount}</div>
            <div className="text-sm text-green-600">↗ All payments up to date</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">{t.pendingInvites}</span>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-2">{pendingCount}</div>
            <div className="text-sm text-gray-600">Awaiting confirmation</div>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.noMembers}</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">{t.noMembersDesc}</p>
              <button 
                onClick={() => setShowInviteModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                {t.inviteMember}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">{t.name}</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">{t.role}</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">{t.subscriptions}</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">{t.contribution}</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">{t.status}</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {member.role === 'owner' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                          <Shield className="w-3 h-3" />
                          {t.owner}
                        </span>
                      ) : member.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                          <Shield className="w-3 h-3" />
                          {t.admin}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                          {t.member}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{member.subscriptions} plans</div>
                      <div className="text-sm text-gray-500">{t.joined} {member.joinedDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">€{member.totalContribution.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{member.lastPayment}</div>
                    </td>
                    <td className="px-6 py-4">
                      {member.status === 'active' && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                          {t.active}
                        </span>
                      )}
                      {member.status === 'pending' && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                          {t.pending}
                        </span>
                      )}
                      {member.status === 'inactive' && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                          {t.inactive}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 relative">
                        {member.status === 'pending' && (
                          <button className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium">
                            <Mail className="w-4 h-4" />
                            {t.sendReminder}
                          </button>
                        )}
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          {openMenuId === member.id && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50" ref={menuRef}>
                              <div className="py-1">
                                {/* Hacer administrador solo si el usuario actual es owner y el miembro no es owner */}
                                {isCurrentUserOwner && member.role !== 'owner' && (
                                  <button 
                                    onClick={() => handleMakeAdmin(member.id)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <Shield className="w-4 h-4 text-blue-600" />
                                    {t.makeAdmin}
                                  </button>
                                )}
                                {/* Eliminar usuario - no permitido en el propietario principal */}
                                {member.id !== '1' && (
                                  <button 
                                    onClick={() => handleRemoveUser(member.id)}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    {t.removeUser}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}