"use client";

import {
  userService,
} from "@/composition";

import React, { useCallback, useState } from "react";
import type {
  User,
} from "@/features/users";
import { getErrorMessage } from "@/utils/errors";
import { usePagedQuery } from "@/shared/hooks/useQuery";
import { useActionFeedback } from "@/shared/hooks/useActionFeedback";
import { ActionGroup, Button, ErrorState, FormField, Input, Modal, Page, PageHeader, Pagination, RowActions, Select, StatusBadge, Table, TableEmpty, TablePageSkeleton, TablePanel } from "@/shared/components";
import { pageAfterDeletion } from "@/core/Pagination";

const PAGE_SIZE = 20;

export default function UsersPage() {
  const feedback = useActionFeedback();
  const [page, setPage] = useState(1);
  const usersQuery = usePagedQuery(useCallback(() => userService.listUsers({ page, pageSize: PAGE_SIZE }), [page]));
  const { items: users, meta, loading, error } = usersQuery;
  const [submitting, setSubmitting] = useState(false);
  
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
      else usersQuery.reload();
    } catch (err: unknown) {
      feedback.error(`No se pudo guardar el usuario: ${getErrorMessage(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      await userService.deleteUser(userId);
      const nextPage = meta ? pageAfterDeletion(meta) : page;
      if (nextPage !== page) setPage(nextPage);
      else usersQuery.reload();
    } catch (err: unknown) {
      feedback.error(`No se pudo eliminar el usuario: ${getErrorMessage(err)}`);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await userService.toggleActive(user.id);
      usersQuery.patchItems((current) => current.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
    } catch (err: unknown) {
      feedback.error(`No se pudo cambiar el estado: ${getErrorMessage(err)}`);
    }
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    try {
      await userService.changeRole(userId, newRole);
      usersQuery.patchItems((current) => current.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: unknown) {
      feedback.error(`No se pudo cambiar el rol: ${getErrorMessage(err)}`);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";
    return date.toLocaleDateString();
  };

  if (loading && users.length === 0) {
    return <TablePageSkeleton title="Usuarios" tableTitle="Usuarios" columns={7} />;
  }

  return (
    <Page>
      <PageHeader title="Usuarios" description="Quién entra al panel y con qué permisos." actions={<Button variant="primary" onClick={() => handleOpenModal(null)}>+ Nuevo usuario</Button>} />

      {error && <ErrorState message={error} />}

      <TablePanel title="Usuarios" refreshing={loading && users.length > 0} pagination={meta && <Pagination page={meta.page} pageSize={meta.pageSize} totalCount={meta.count} onPageChange={setPage} />}>
      <Table label="Usuarios">
          <thead>
            <tr>
              <th>ID</th>
              <th>Correo</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Alta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <TableEmpty colSpan={7} label="No hay usuarios." />
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
                      <option value="USER">Usuario</option>
                      <option value="ADMIN">Administrador</option>
                      <option value="SUPERADMIN">Superadministrador</option>
                    </Select>
                  </td>
                  <td>
                    <button type="button" aria-label={`${user.is_active ? "Desactivar" : "Activar"} al usuario ${user.email}`} onClick={() => handleToggleActive(user)} style={{ background: "none", border: 0, cursor: "pointer" }}><StatusBadge variant={user.is_active ? "success" : "neutral"}>{user.is_active ? "Activo" : "Inactivo"}</StatusBadge></button>
                  </td>
                  <td>{formatDate(user.date_joined)}</td>
                  <td>
                    <RowActions itemName={`el usuario ${user.email}`} onEdit={() => handleOpenModal(user)} onDelete={() => handleDelete(user.id)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
      </Table>
      </TablePanel>

      <Modal open={isModalOpen} title={editingUser ? "Editar usuario" : "Nuevo usuario"} description={editingUser ? "Actualiza los datos y los permisos de este usuario." : "Los usuarios nuevos empiezan con el rol Usuario; puedes cambiarlo después."} onClose={() => { setPassword(""); setIsModalOpen(false); }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <FormField label="Nombre" required>
                  <Input
                    value={formData.first_name}
                    placeholder="p. ej. Ana"
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                  />
                </FormField>
                <FormField label="Apellido" required>
                  <Input
                    value={formData.last_name}
                    placeholder="p. ej. Pérez"
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    required
                  />
                </FormField>
              </div>
              
              <FormField label="Correo" required>
                <Input
                  type="email"
                  value={formData.email}
                  placeholder="nombre@empresa.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </FormField>
              {editingUser ? <FormField label="Rol">
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="USER">Usuario estándar</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="SUPERADMIN">Superadministrador</option>
                </Select>
              </FormField> : <FormField label="Contraseña" required>
                <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </FormField>}
              <ActionGroup>
                <Button type="button" onClick={() => { setPassword(""); setIsModalOpen(false); }}>Cancelar</Button>
                <Button type="submit" variant="primary" loading={submitting}>Guardar usuario</Button>
              </ActionGroup>
            </form>
      </Modal>
    </Page>
  );
}
