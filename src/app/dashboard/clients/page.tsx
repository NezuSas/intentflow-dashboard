"use client";

import {
  clientService,
} from "@/composition";

import React, { useEffect, useState } from "react";

import type {
  Client,
} from "@/features/clients";
import { getErrorMessage } from "@/utils/errors";
import { ActionGroup, Button, ErrorState, FormField, Input, LoadingState, Modal, Page, PageHeader, Pagination, Select, StatusBadge, Table, TableEmpty, TablePanel } from "@/shared/components";
import type { PageMeta } from "@/core/Pagination";

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
  const [clients, setClients] =
    useState<Client[]>([]);

  const [loading, setLoading] =
    useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [
    editingClient,
    setEditingClient,
  ] = useState<Client | null>(null);

  const [formData, setFormData] =
    useState<ClientFormData>(emptyForm);

  const fetchClients = async () => {
    try {
      setLoading(true);

      const response = await clientService.listClients({ page, pageSize: PAGE_SIZE });
      setClients(response.data);
      setMeta(response.meta);
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchClients();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

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
      await fetchClients();
    } catch (err: unknown) {
      alert(
        `Error saving client: ${getErrorMessage(
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
    if (
      !confirm(
        "Are you sure you want to delete this client?"
      )
    ) {
      return;
    }

    try {
      await clientService.deleteClient(
        clientId
      );

      setClients((current) =>
        current.filter(
          (client) =>
            client.id !== clientId
        )
      );
    } catch (err: unknown) {
      alert(
        `Error deleting client: ${getErrorMessage(
          err
        )}`
      );
    }
  };

  if (loading && clients.length === 0) {
    return (
      <Page>
        <LoadingState label="Loading clients..." />
      </Page>

    );
  }

  return (
    <Page>
      <PageHeader title="Client Management" actions={<Button variant="primary" onClick={() => handleOpenModal(null)}>+ New Client</Button>} />

      {error && <ErrorState message={error} />}

      <TablePanel title="Clients" pagination={meta && <Pagination page={meta.page} totalPages={Math.ceil(meta.count / meta.pageSize)} totalCount={meta.count} hasPrevious={Boolean(meta.previous)} hasNext={Boolean(meta.next)} onPrevious={() => setPage((current) => Math.max(1, current - 1))} onNext={() => setPage((current) => current + 1)} />}>
      <Table label="Client management">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Subscription</th>
              <th>ID Number</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {clients.length === 0 ? (
              <TableEmpty colSpan={7} label="No clients found." />
            ) : (
              clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.id}</td>

                  <td
                    style={{
                      fontWeight: 600,
                      color: "hsl(var(--primary))",
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
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                      }}
                    >
                      <Button type="button" variant="ghost"
                        onClick={() =>
                          handleOpenModal(client)
                        }
                      >
                        ✎
                      </Button>

                      <Button type="button" variant="danger"
                        onClick={() =>
                          handleDelete(client.id)
                        }
                      >
                        🗑
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
      </Table>
      </TablePanel>

      <Modal open={isModalOpen} title={editingClient ? "Edit Client" : "Create New Client"} onClose={() => setIsModalOpen(false)}>
            <form onSubmit={handleSubmit}>
              <FormField label="Client Name" required>
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

              <FormField label="Business Type">
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

              <FormField label="Subscription">
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
                  <option value="CIAL">
                    CIAL
                  </option>
                </Select>
              </FormField>

              <FormField label="ID / TAX Number">
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

              <FormField label="Contact Email">
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
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                >Save Client</Button>
              </ActionGroup>
            </form>
      </Modal>
    </Page>
  );
}
