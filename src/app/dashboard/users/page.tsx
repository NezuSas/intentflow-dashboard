"use client";

import {
  userService,
} from "@/composition";

import React, { useEffect, useState } from "react";
import type {
  User,
} from "@/features/users";
import { getErrorMessage } from "@/utils/errors";
import { useActionFeedback } from "@/shared/hooks/useActionFeedback";
import { ActionGroup, Button, ErrorState, FormField, Input, Modal, Page, PageHeader, Pagination, RowActions, Select, StatusBadge, Table, TableEmpty, TablePageSkeleton, TablePanel } from "@/shared/components";
import type { PageMeta } from "@/core/Pagination";
import { pageAfterDeletion } from "@/core/Pagination";

const PAGE_SIZE = 20;

export default function UsersPage() {
  const feedback = useActionFeedback();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [password, setPassword] = useState("");
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
    setPassword("");
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
    setSubmitting(true);
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, formData);
      } else {
        await userService.createUser({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password,
        });
      }
      setPassword("");
      setIsModalOpen(false);
      if (!editingUser && page !== 1) setPage(1);
      else await fetchUsers();
    } catch (err: unknown) {
      feedback.error(`Error saving user: ${getErrorMessage(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      await userService.deleteUser(userId);
      const nextPage = meta ? pageAfterDeletion(meta) : page;
      if (nextPage !== page) setPage(nextPage);
      else await fetchUsers();
    } catch (err: unknown) {
      feedback.error(`Error deleting user: ${getErrorMessage(err)}`);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await userService.toggleActive(user.id);
      setUsers(users.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
    } catch (err: unknown) {
      feedback.error(`Error toggling status: ${getErrorMessage(err)}`);
    }
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    try {
      await userService.changeRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: unknown) {
      feedback.error(`Error changing role: ${getErrorMessage(err)}`);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString();
  };

  if (loading && users.length === 0) {
    return <TablePageSkeleton title="User Management" tableTitle="Users" columns={7} />;
  }

  return (
    <Page>
      <PageHeader title="User Management" actions={<Button variant="primary" onClick={() => handleOpenModal(null)}>+ New User</Button>} />

      {error && <ErrorState message={error} />}

      <TablePanel title="Users" refreshing={loading && users.length > 0} pagination={meta && <Pagination page={meta.page} pageSize={meta.pageSize} totalCount={meta.count} onPageChange={setPage} />}>
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
                    <button type="button" aria-label={`${user.is_active ? "Deactivate" : "Activate"} user ${user.email}`} onClick={() => handleToggleActive(user)} style={{ background: "none", border: 0, cursor: "pointer" }}><StatusBadge variant={user.is_active ? "success" : "neutral"}>{user.is_active ? "Active" : "Inactive"}</StatusBadge></button>
                  </td>
                  <td>{formatDate(user.date_joined)}</td>
                  <td>
                    <RowActions itemName={`user ${user.email}`} onEdit={() => handleOpenModal(user)} onDelete={() => handleDelete(user.id)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
      </Table>
      </TablePanel>

      <Modal open={isModalOpen} title={editingUser ? "Edit User Profile" : "Create New User"} description={editingUser ? "Update profile information and system permissions for this user." : "New users start with the User role. You can change it after creation."} onClose={() => { setPassword(""); setIsModalOpen(false); }}>
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
              {editingUser ? <FormField label="System Role">
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="USER">Standard User</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="SUPERADMIN">Super Admin</option>
                </Select>
              </FormField> : <FormField label="Password" required>
                <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </FormField>}
              <ActionGroup>
                <Button type="button" onClick={() => { setPassword(""); setIsModalOpen(false); }}>Cancel</Button>
                <Button type="submit" variant="primary" loading={submitting}>Save User</Button>
              </ActionGroup>
            </form>
      </Modal>
    </Page>
  );
}
