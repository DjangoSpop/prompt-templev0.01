'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users,
  Plus,
  Mail,
  Shield,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Crown,
  User,
  Settings
} from 'lucide-react';
import useSWR from 'swr';
import { apiClient, type TeamMember } from '@/lib/api';

const fetcher = async () => {
  const response = await apiClient.getTeamMembers();
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data;
};

interface TeamMemberCardProps {
  member: TeamMember;
  onEditRole: (member: TeamMember) => void;
  onRemove: (memberId: string) => void;
  currentUserRole: string;
}

function TeamMemberCard({ member, onEditRole, onRemove, currentUserRole }: TeamMemberCardProps) {
  const canEditRole = currentUserRole === 'owner' || (currentUserRole === 'admin' && member.role !== 'owner');
  const canRemove = currentUserRole === 'owner' || (currentUserRole === 'admin' && member.role === 'member');

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-brand" />;
      default:
        return <User className="h-4 w-4 text-text-muted" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow text-black';
      case 'admin':
        return 'bg-brand text-white';
      default:
        return 'bg-bg-floating text-text-secondary';
    }
  };

  return (
    <Card className="bg-bg-secondary border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {member.user.first_name?.charAt(0) || member.user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-text-primary font-semibold">
                  {member.user.first_name && member.user.last_name 
                    ? `${member.user.first_name} ${member.user.last_name}`
                    : member.user.username
                  }
                </h3>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                  {getRoleIcon(member.role)}
                  <span className="ml-1 capitalize">{member.role}</span>
                </div>
              </div>
              <p className="text-text-secondary text-sm">{member.user.email}</p>
              <div className="flex items-center text-xs text-text-muted mt-1">
                <span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {(canEditRole || canRemove) && (
            <div className="flex items-center space-x-2">
              {canEditRole && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditRole(member)}
                  className="text-interactive-normal hover:text-interactive-hover"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Role
                </Button>
              )}
              {canRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(member.id)}
                  className="text-interactive-normal hover:text-red"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Permissions */}
        {member.permissions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs text-text-muted mb-2">Permissions:</div>
            <div className="flex flex-wrap gap-1">
              {member.permissions.slice(0, 3).map((permission) => (
                <span
                  key={permission}
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-bg-floating text-text-secondary"
                >
                  {permission}
                </span>
              ))}
              {member.permissions.length > 3 && (
                <span className="text-xs text-text-muted">
                  +{member.permissions.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: string) => void;
}

function InviteMemberModal({ isOpen, onClose, onInvite }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await onInvite(email.trim(), role);
      setEmail('');
      setRole('member');
      onClose();
    } catch (error) {
      console.error('Invite error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="bg-bg-secondary border-border w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-text-primary">Invite Team Member</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-bg-floating border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-bg-floating border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand hover:bg-brand-hover text-white"
              >
                {isSubmitting ? 'Inviting...' : 'Send Invite'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TeamsPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { data: members, error, isLoading, mutate } = useSWR('/teams/members', fetcher);

  // For demo purposes, assume current user is owner
  const currentUserRole = 'owner';

  const handleInvite = async (email: string, role: string) => {
    try {
      await apiClient.inviteTeamMember(email, role);
      mutate(); // Refresh data
    } catch (error) {
      console.error('Invite error:', error);
      throw error;
    }
  };

  const handleEditRole = (member: TeamMember) => {
    // TODO: Open role edit modal
    console.log('Edit role for:', member);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      await apiClient.removeTeamMember(memberId);
      mutate(); // Refresh data
    } catch (error) {
      console.error('Remove error:', error);
    }
  };

  const getRoleStats = () => {
    if (!members) return { owners: 0, admins: 0, members: 0 };
    
    return members.reduce(
      (acc, member) => {
        acc[`${member.role}s` as keyof typeof acc]++;
        return acc;
      },
      { owners: 0, admins: 0, members: 0 }
    );
  };

  const roleStats = getRoleStats();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-bg-secondary rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-bg-secondary rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="text-red text-lg mb-2">Failed to load team members</div>
          <div className="text-text-secondary">{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Team Management</h1>
          <p className="text-text-secondary mt-2">
            Manage your team members and their permissions
          </p>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          className="bg-brand hover:bg-brand-hover text-white"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-bg-secondary border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Members</CardTitle>
            <Users className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{members?.length || 0}</div>
            <p className="text-xs text-text-muted">Active team members</p>
          </CardContent>
        </Card>

        <Card className="bg-bg-secondary border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Admins</CardTitle>
            <Shield className="h-4 w-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{roleStats.admins + roleStats.owners}</div>
            <p className="text-xs text-text-muted">Admin-level access</p>
          </CardContent>
        </Card>

        <Card className="bg-bg-secondary border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Members</CardTitle>
            <User className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{roleStats.members}</div>
            <p className="text-xs text-text-muted">Standard access</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">Team Members</h2>
        
        {members && members.length > 0 ? (
          <div className="space-y-4">
            {members.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                onEditRole={handleEditRole}
                onRemove={handleRemoveMember}
                currentUserRole={currentUserRole}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <div className="text-text-secondary text-lg mb-2">No team members yet</div>
            <div className="text-text-muted">Invite your first team member to get started</div>
            <Button
              onClick={() => setShowInviteModal(true)}
              className="mt-4 bg-brand hover:bg-brand-hover text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
      />
    </div>
  );
}