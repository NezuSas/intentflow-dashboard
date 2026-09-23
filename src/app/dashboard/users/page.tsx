"use client";

import {
  userService,
} from "@/composition";

import React, { useEffect, useState } from "react";
import styles from "./users.module.css";
import type {
  User,
} from "@/features/users";
import { getErrorMessage } from "@/utils/errors";
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
    return <div className={styles.container}>Loading users...</div>;
  }

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className={styles.title} style={{ marginBottom: 0 }}>User Management</h1>
        <button className={styles.primaryButton} onClick={() => handleOpenModal(null)}>+ New User</button>
      </div>

      {meta && (
        <div className="table-pagination">
          <span>{meta.count} total · Page {meta.page} of {Math.max(1, Math.ceil(meta.count / meta.pageSize))}</span>
          <div>
            <button className={styles.secondaryButton} disabled={!meta.previous} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
            <button className={styles.secondaryButton} disabled={!meta.next} onClick={() => setPage((current) => current + 1)}>Next</button>
          </div>
        </div>
      )}

      {error && <div className="error-card" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
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
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>No users found.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{`${user.first_name || ""} ${user.last_name || ""}`}</td>
                  <td>
                    <select 
                      className={styles.roleSelect}
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPERADMIN">Super Admin</option>
                    </select>
                  </td>
                  <td>
                    <span 
                      className={`${styles.badge} ${user.is_active ? styles.badgeActive : styles.badgeInactive}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleToggleActive(user)}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{formatDate(user.date_joined)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className={styles.actionButton} onClick={() => handleOpenModal(user)}>✎</button>
                      <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDelete(user.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div style={{ marginBottom: '1rem' }}>
              <h2 className={styles.modalTitle} style={{ marginBottom: '0.5rem' }}>{editingUser ? "Edit User Profile" : "Create New User"}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {editingUser ? "Update profile information and system permissions for this user." : "Invite a new user to the platform by providing their details."}
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className={styles.formGroup}>
                  <label>First Name</label>
                  <input 
                    className={styles.input} 
                    value={formData.first_name}
                    placeholder="e.g. John"
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Last Name</label>
                  <input 
                    className={styles.input} 
                    value={formData.last_name}
                    placeholder="e.g. Doe"
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input 
                  className={styles.input} 
                  type="email"
                  value={formData.email}
                  placeholder="name@example.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>System Role</label>
                <select 
                  className={styles.input}
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="USER">Standard User</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="SUPERADMIN">Super Admin</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryButton} disabled={submitting || !editingUser}>{submitting ? "Saving..." : "Save User"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
