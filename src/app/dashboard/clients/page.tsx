"use client";

import React, { useEffect, useState } from "react";
import styles from "../users/users.module.css";

import {
  Client,
  clientService,
} from "@/services/clientService";
import { getErrorMessage } from "@/utils/errors";

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

      const data =
        await clientService.getClients();

      setClients(data);
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchClients();
  }, []);

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
      <div className={styles.container}>
        Loading clients...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1
          className={styles.title}
          style={{ marginBottom: 0 }}
        >
          Client Management
        </h1>

        <button
          className={styles.primaryButton}
          onClick={() =>
            handleOpenModal(null)
          }
        >
          + New Client
        </button>
      </div>

      {error && (
        <div
          className="error-card"
          style={{ marginBottom: "1rem" }}
        >
          {error}
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
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
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                  }}
                >
                  No clients found.
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.id}</td>

                  <td
                    style={{
                      fontWeight: 600,
                      color: "var(--primary)",
                    }}
                  >
                    {client.name}
                  </td>

                  <td>
                    {client.type || "---"}
                  </td>

                  <td>
                    <span
                      className={`${styles.badge} ${
                        client.subscription_level ===
                        "FREE"
                          ? styles.badgeInactive
                          : styles.badgeActive
                      }`}
                    >
                      {
                        client.subscription_level
                      }
                    </span>
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
                      <button
                        className={
                          styles.actionButton
                        }
                        onClick={() =>
                          handleOpenModal(client)
                        }
                      >
                        ✎
                      </button>

                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() =>
                          handleDelete(client.id)
                        }
                      >
                        🗑
                      </button>
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
            <h2
              className={styles.modalTitle}
            >
              {editingClient
                ? "Edit Client"
                : "Create New Client"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Client Name</label>

                <input
                  className={styles.input}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Business Type</label>

                <select
                  className={styles.input}
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
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Subscription</label>

                <select
                  className={styles.input}
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
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>ID / TAX Number</label>

                <input
                  className={styles.input}
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
              </div>

              <div className={styles.formGroup}>
                <label>Contact Email</label>

                <input
                  className={styles.input}
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div
                className={styles.modalActions}
              >
                <button
                  type="button"
                  className={
                    styles.secondaryButton
                  }
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={
                    styles.primaryButton
                  }
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
