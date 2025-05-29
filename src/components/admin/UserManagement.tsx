"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { User, Ban, Edit, Trash, CheckCircle, XCircle, Search, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { getUsers, updateUserStatus, deleteUser, UserData } from '@/lib/admin-api';
import { supabase } from '@/lib/supabase';

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isBanningUser, setIsBanningUser] = useState(false);
  const [banReason, setBanReason] = useState('');

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const userData = await getUsers();

      // Map the API data to the component's expected format
      const formattedUsers = userData.map(user => ({
        id: user.id,
        name: user.name || 'Unknown User',
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        isBanned: user.is_banned,
        banReason: '',
        createdAt: user.created_at,
        lastLogin: user.updated_at,
      }));

      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Toggle user status (active/inactive)
  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      // Update in Supabase
      const success = await updateUserStatus(userId, { is_active: isActive });

      if (success) {
        // Update local state
        setUsers(
          users.map(user =>
            user.id === userId ? { ...user, isActive } : user
          )
        );
        toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(`Failed to ${isActive ? 'activate' : 'deactivate'} user`);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('An error occurred while updating user status');
    }
  };

  // Ban a user with reason
  const banUser = async (userId: string, reason: string) => {
    try {
      // Get current admin user ID
      const currentUser = typeof localStorage !== 'undefined'
        ? JSON.parse(localStorage.getItem('currentUser') || '{}')
        : {};

      const adminId = currentUser.id || 'admin-id';

      // Call the ban_user RPC function
      const { data: result, error } = await supabase.rpc('ban_user', {
        p_user_id: userId,
        p_reason: reason || 'No reason provided',
        p_admin_id: adminId
      });

      if (error) {
        console.error('Error banning user:', error);
        throw error;
      }

      console.log('Ban result:', result);

      // Update local state
      setUsers(
        users.map(user =>
          user.id === userId ? { ...user, isBanned: true, isActive: false, banReason: reason } : user
        )
      );

      setIsBanningUser(false);
      setBanReason('');
      toast.success('User banned successfully');
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Failed to ban user');
    }
  };

  // Unban a user
  const unbanUser = async (userId: string) => {
    try {
      // Call the simplified unban_user RPC function
      const { data: result, error } = await supabase.rpc('unban_user', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error unbanning user:', error);
        throw error;
      }

      console.log('Unban result:', result);

      // Update local state
      setUsers(
        users.map(user =>
          user.id === userId ? { ...user, isBanned: false, isActive: true, banReason: '' } : user
        )
      );

      setIsBanningUser(false);
      toast.success('User unbanned successfully');
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.error('Failed to unban user');

      // Fall back to using updateUserStatus if the RPC fails
      try {
        console.log('Falling back to updateUserStatus for unbanning');
        const success = await updateUserStatus(userId, {
          is_banned: false,
          is_active: true
        });

        if (success) {
          // Update local state
          setUsers(
            users.map(user =>
              user.id === userId ? { ...user, isBanned: false, isActive: true } : user
            )
          );
          setIsBanningUser(false);
          toast.success('User unbanned successfully via fallback method');
        }
      } catch (fallbackError) {
        console.error('Fallback unban method also failed:', fallbackError);
      }
    }
  };

  // Toggle user ban status
  const toggleUserBan = async (userId: string, isBanned: boolean) => {
    if (isBanned) {
      // Ban user with reason
      if (banReason.trim() === '') {
        toast.error('Please provide a reason for banning the user');
        return;
      }
      await banUser(userId, banReason);
    } else {
      // Unban user
      await unbanUser(userId);
    }
  };

  // Delete a user
  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete from Supabase
      const success = await deleteUser(userId);

      if (success) {
        // Update local state
        setUsers(users.filter(user => user.id !== userId));
        toast.success('User deleted successfully');
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('An error occurred while deleting user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions.
          </p>
        </div>
        <div className="flex items-center w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => loadUsers()} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">Loading users...</div>
            </CardContent>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">No users found</div>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-xl">{user.name}</CardTitle>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>
                        {user.role}
                      </Badge>
                      {user.isBanned && (
                        <Badge variant="destructive">Banned</Badge>
                      )}
                      {!user.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground pb-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium">Created: </span>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    {user.lastLogin && (
                      <div>
                        <span className="font-medium">Last active: </span>
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-1">
                  <div className="flex flex-wrap gap-2 w-full justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleUserStatus(user.id, !user.isActive)}
                    >
                      {user.isActive ? (
                        <>
                          <XCircle className="h-4 w-4 mr-1" /> Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" /> Activate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsBanningUser(true);
                        if (!user.isBanned) {
                          setBanReason('');
                        }
                      }}
                    >
                      {user.isBanned ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" /> Unban
                        </>
                      ) : (
                        <>
                          <Ban className="h-4 w-4 mr-1" /> Ban
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
                          handleDeleteUser(user.id);
                        }
                      }}
                    >
                      <Trash className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Ban User Dialog */}
      <Dialog open={isBanningUser} onOpenChange={setIsBanningUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.isBanned ? 'Unban User' : 'Ban User'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.isBanned
                ? 'This will allow the user to log in again.'
                : 'This will prevent the user from logging in and they will be notified of the reason when attempting to access their account.'}
            </DialogDescription>
          </DialogHeader>
          {!selectedUser?.isBanned && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="ban-reason">
                  Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="ban-reason"
                  placeholder="Enter reason for banning this user"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className={banReason.trim() === '' ? 'border-red-500' : ''}
                />
                {banReason.trim() === '' && (
                  <p className="text-red-500 text-sm">A ban reason is required.</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  This reason will be shown to the user when they attempt to log in.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsBanningUser(false);
                setBanReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant={selectedUser?.isBanned ? 'default' : 'destructive'}
              onClick={() => {
                if (selectedUser) {
                  if (!selectedUser.isBanned && banReason.trim() === '') {
                    toast.error('Please provide a reason for banning the user');
                    return;
                  }
                  toggleUserBan(selectedUser.id, !selectedUser.isBanned);
                }
              }}
            >
              {selectedUser?.isBanned ? 'Unban User' : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
