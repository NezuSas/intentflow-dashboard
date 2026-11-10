"use client";

import {
  clientService,
} from "@/composition";

import React, { useCallback, useState } from "react";

import type {
  Client,
} from "@/features/clients";
import { getErrorMessage } from "@/utils/errors";
import { usePagedQuery } from "@/shared/hooks/useQuery";
import { useActionFeedback } from "@/shared/hooks/useActionFeedback";
import { ActionGroup, Button, ErrorState, FormField, Input, Modal, Page, PageHeader, Pagination, RowActions, Select, StatusBadge, Table, TableEmpty, TablePageSkeleton, TablePanel } from "@/shared/components";
import { pageAfterDeletion } from "@/core/Pagination";

const PAGE_SIZE = 20;

interface ClientFormData {
  name: string;
  type: string;
  subscription_level: string;
  identification_number: string;
  email: string;
}

const emptyForm: ClientFormData = {
  name: "",
  type: "PERSON",
  subscription_level: "FREE",
  identification_number: "",
  email: "",
};

export default function ClientsPage() {
  const feedback = useActionFeedback();
  const [page, setPage] = useState(1);
  const clientsQuery = usePagedQuery(useCallback(() => clientService.listClients({ page, pageSize: PAGE_SIZE }), [page]));
  const { items: clients, meta, loading, error } = clientsQuery;
  const [submitting, setSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [
    editingClient,
    setEditingClient,
  ] = useState<Client | null>(null);

  const [formData, setFormData] =
    useState<ClientFormData>(emptyForm);

  const handleOpenModal = (
    client: Client | null = null
  ) => {
    if (client) {
      setEditingClient(client);

      setFormData({
        name: client.name,
        type: client.type,
        subscription_level:
          client.subscription_level,
        identification_number:
          client.identification_number || "",
        email: client.email || "",
      });
    } else {
      setEditingClient(null);
      setFormData(emptyForm);
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      if (editingClient) {
        await clientService.updateClient(
          editingClient.id,
          formData
        );
      } else {
        await clientService.createClient(
          formData
        );
      }

      setIsModalOpen(false);
      clientsQuery.reload();
    } catch (err: unknown) {
      feedback.error(
        `No se pudo guardar el cliente: ${getErrorMessage(
          err
        )}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (
    clientId: number
  ) => {
    try {
      await clientService.deleteClient(
        clientId
      );
      const nextPage = meta ? pageAfterDeletion(meta) : page;
      if (nextPage !== page) setPage(nextPage);
      else clientsQuery.reload();
    } catch (err: unknown) {
      feedback.error(
        `No se pudo eliminar el cliente: ${getErrorMessage(
          err
        )}`
      );
    }
  };

  if (loading && clients.length === 0) {
    return <TablePageSkeleton title="Clientes" tableTitle="Clientes" columns={7} />;
  }

  return (
    <Page>
      <PageHeader title="Clientes" description="Empresas y personas con placas en operación." actions={<Button variant="primary" onClick={() => handleOpenModal(null)}>+ Nuevo cliente</Button>} />

      {error && <ErrorState message={error} />}

      <TablePanel title="Clientes" refreshing={loading && clients.length > 0} pagination={meta && <Pagination page={meta.page} pageSize={meta.pageSize} totalCount={meta.count} onPageChange={setPage} />}>
      <Table label="Clientes">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Suscripción</th>
              <th>Identificación</th>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {clients.length === 0 ? (
              <TableEmpty colSpan={7} label="No hay clientes registrados." />
            ) : (
              clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.id}</td>

                  <td
                    style={{
                      fontWeight: 500,
                    }}
                  >
                    {client.name}
                  </td>

                  <td>
                    {client.type || "---"}
                  </td>

                  <td>
                    <StatusBadge variant={client.subscription_level === "FREE" ? "neutral" : "success"}>{client.subscription_level}</StatusBadge>
                  </td>

                  <td>
                    {client.identification_number ||
                      "---"}
                  </td>

                  <td>
                    {client.email || "---"}
                  </td>

                  <td>
                    <RowActions itemName={`el cliente ${client.name}`} onEdit={() => handleOpenModal(client)} onDelete={() => handleDelete(client.id)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
      </Table>
      </TablePanel>

      <Modal open={isModalOpen} title={editingClient ? "Editar cliente" : "Nuevo cliente"} onClose={() => setIsModalOpen(false)}>
            <form onSubmit={handleSubmit}>
              <FormField label="Nombre" required>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </FormField>

              <FormField label="Tipo">
                <Select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="PERSON">
                    PERSON
                  </option>
                  <option value="COMPANY">
                    COMPANY
                  </option>
                </Select>
              </FormField>

              <FormField label="Nivel de suscripción">
                <Select
                  value={
                    formData.subscription_level
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      subscription_level:
                        e.target.value,
                    })
                  }
                >
                  <option value="FREE">
                    FREE
                  </option>
                  <option value="BASIC">
                    BASIC
                  </option>
                  <option value="PREMIUM">
                    PREMIUM
                  </option>
                </Select>
              </FormField>

              <FormField label="Cédula o RUC">
                <Input
                  value={
                    formData.identification_number
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      identification_number:
                        e.target.value,
                    })
                  }
                />
              </FormField>

              <FormField label="Correo de contacto">
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />
              </FormField>

              <ActionGroup>
                <Button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                >Guardar cliente</Button>
              </ActionGroup>
            </form>
      </Modal>
    </Page>
  );
}
