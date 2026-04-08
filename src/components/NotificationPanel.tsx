import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, Clock, AlertCircle, ThumbsUp, ThumbsDown, Loader } from 'lucide-react';
import { getPendingInvitations, acceptInvitation, declineInvitation } from '../lib/invitationService';
import { getCurrentUserEmail } from '../lib/userService';

interface Invitation {
  id: string;
  subscription_id: string;
  inviter_id: string;
  invitee_email: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  subscription_name?: string;
  inviter_name?: string;
}

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [declining, setDeclining] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Cargar invitaciones al abrir el panel
  useEffect(() => {
    if (isOpen) {
      loadInvitations();
    }
  }, [isOpen]);

  const loadInvitations = async () => {
    setIsLoading(true);
    try {
      const userEmail = await getCurrentUserEmail();
      if (!userEmail) {
        console.error('No user email found');
        setIsLoading(false);
        return;
      }

      // Obtener invitaciones pendientes
      const invs = await getPendingInvitations(userEmail);
      setInvitations(invs || []);
    } catch (error) {
      console.error('Error cargando invitaciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string, userId?: string) => {
    setAccepting(invitationId);
    try {
      await acceptInvitation(invitationId, userId || '');
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
    } catch (error) {
      console.error('Error aceptando invitación:', error);
    } finally {
      setAccepting(null);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    setDeclining(invitationId);
    try {
      await declineInvitation(invitationId);
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
    } catch (error) {
      console.error('Error rechazando invitación:', error);
    } finally {
      setDeclining(null);
    }
  };

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {invitations.length > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {invitations.length > 9 ? '9+' : invitations.length}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div ref={panelRef} className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <p className="text-xs text-gray-500 mt-1">{invitations.length} {invitations.length === 1 ? 'new' : 'new'}</p>
          </div>

          {isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-900 font-medium">No notifications</p>
              <p className="text-gray-600 text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* Invitaciones Pendientes */}
              <div className="p-4 bg-blue-50">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">Pending Invitations</h4>
                <div className="space-y-2">
                  {invitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 bg-white rounded-lg border border-blue-200 flex items-start justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {inv.inviter_name} te invitó a
                        </p>
                        <p className="text-sm font-semibold text-blue-600 truncate">
                          {inv.subscription_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(inv.created_at).toLocaleDateString('en-US')}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-2 flex-shrink-0">
                        <button
                          onClick={() => handleAcceptInvitation(inv.id)}
                          disabled={accepting === inv.id}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                          title="Accept"
                        >
                          {accepting === inv.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <ThumbsUp className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeclineInvitation(inv.id)}
                          disabled={declining === inv.id}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Decline"
                        >
                          {declining === inv.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <ThumbsDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}