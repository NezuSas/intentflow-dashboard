"use client";

import {
  userService,
} from "@/composition";

import React, { useEffect, useState } from "react";
import type {
  User,
} from "@/features/users";
import { getErrorMessage } from "@/utils/errors";
import { ActionGroup, Button, ErrorState, FormField, Input, LoadingState, Modal, Page, PageHeader, Pagination, Select, StatusBadge, Table, TableEmpty, TablePanel } from "@/shared/components";
import type { PageMeta } from "@/core/Pagination";

const PAGE_SIZE = 20;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "USER"
  });

  // The request intentionally follows only the selected page.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void fetchUsers(); }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.listUsers({ page, pageSize: PAGE_SIZE });
      setUsers(response.data);
      setMeta(response.meta);
      setError(null);
    } catch (err: unknown) {
      console.error(
        "Fetch users error:",
        getErrorMessage(err)
      );
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        role: "USER"
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!editingUser) {
      alert("User creation is not available through this screen.");
      return;
    }
    setSubmitting(true);
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, formData);
      }
      setIsModalOpen(false);
      await fetchUsers();
    } catch (err: unknown) {
      alert(`Error saving user: ${getErrorMessage(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await userService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: unknown) {
      alert(`Error deleting user: ${getErrorMessage(err)}`);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await userService.toggleActive(user.id);
      setUsers(users.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
    } catch (err: unknown) {
      alert(`Error toggling status: ${getErrorMessage(err)}`);
    }
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    try {
      await userService.changeRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: unknown) {
      alert(`Error changing role: ${getErrorMessage(err)}`);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString();
  };

  if (loading && users.length === 0) {
    return <Page><LoadingState label="Loading users..." /></Page>;
  }

  return (
    <Page>
      <PageHeader title="User Management" actions={<Button variant="primary" onClick={() => handleOpenModal(null)}>+ New User</Button>} />

      {error && <ErrorState message={error} />}

      <TablePanel title="Users" pagination={meta && <Pagination page={meta.page} totalPages={Math.ceil(meta.count / meta.pageSize)} totalCount={meta.count} hasPrevious={Boolean(meta.previous)} hasNext={Boolean(meta.next)} onPrevious={() => setPage((current) => Math.max(1, current - 1))} onNext={() => setPage((current) => current + 1)} />}>
      <Table label="User management">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <TableEmpty colSpan={7} label="No users found." />
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{`${user.first_name || ""} ${user.last_name || ""}`}</td>
                  <td>
                    <Select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPERADMIN">Super Admin</option>
                    </Select>
                  </td>
                  <td>
                    <button type="button" onClick={() => handleToggleActive(user)} style={{ background: "none", border: 0, cursor: "pointer" }}><StatusBadge variant={user.is_active ? "success" : "neutral"}>{user.is_active ? "Active" : "Inactive"}</StatusBadge></button>
                  </td>
                  <td>{formatDate(user.date_joined)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button type="button" variant="ghost" onClick={() => handleOpenModal(user)}>✎</Button>
                      <Button type="button" variant="danger" onClick={() => handleDelete(user.id)}>🗑</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
      </Table>
      </TablePanel>

      <Modal open={isModalOpen} title={editingUser ? "Edit User Profile" : "Create New User"} description={editingUser ? "Update profile information and system permissions for this user." : "User creation is not available through this screen."} onClose={() => setIsModalOpen(false)}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <FormField label="First Name" required>
                  <Input
                    value={formData.first_name}
                    placeholder="e.g. John"
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                  />
                </FormField>
                <FormField label="Last Name" required>
                  <Input
                    value={formData.last_name}
                    placeholder="e.g. Doe"
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    required
                  />
                </FormField>
              </div>
              
              <FormField label="Email Address" required>
                <Input
                  type="email"
                  value={formData.email}
                  placeholder="name@example.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </FormField>
              <FormField label="System Role">
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="USER">Standard User</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="SUPERADMIN">Super Admin</option>
                </Select>
              </FormField>
              <ActionGroup>
                <Button type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" loading={submitting} disabled={!editingUser}>Save User</Button>
              </ActionGroup>
            </form>
      </Modal>
    </Page>
  );
}
