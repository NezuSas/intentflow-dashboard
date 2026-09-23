"use client";

import {
  boardService,
  clientService,
  versionService,
} from "@/composition";

import React, { useEffect, useState } from "react";
import styles from "@/shared/components/page.module.css";

import type {
  Board,
} from "@/features/boards";
import type {
  Client,
} from "@/features/clients";
import type {
  ADBVersion,
} from "@/features/versions";
import { getErrorMessage } from "@/utils/errors";
import { Button, Pagination, Table } from "@/shared/components";
import type { PageMeta } from "@/core/Pagination";

const PAGE_SIZE = 20;

interface BoardFormData {
  name: string;
  adb_identifier: string;
  client: number | "";
  version: number | "";
  status: "ONLINE" | "OFFLINE";
}

const emptyForm: BoardFormData = {
  name: "",
  adb_identifier: "",
  client: "",
  version: "",
  status: "ONLINE",
};

function parseAdbIdentifier(identifier: string) {
  const [ipAddress, portValue] = identifier
    .trim()
    .split(":");

  const port = Number(portValue || "5555");

  if (
    !ipAddress ||
    !Number.isInteger(port) ||
    port <= 0 ||
    port > 65535
  ) {
    throw new Error(
      "ADB Identifier must use the format IP:PORT."
    );
  }

  return {
    ip_address: ipAddress,
    port,
  };
}

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [versions, setVersions] =
    useState<ADBVersion[]>([]);

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingBoard, setEditingBoard] =
    useState<Board | null>(null);

  const [formData, setFormData] =
    useState<BoardFormData>(emptyForm);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const [
          boardData,
          clientData,
          versionData,
        ] = await Promise.all([
          boardService.listBoards({ page, pageSize: PAGE_SIZE }),
          clientService.getClientCatalog(),
          versionService.getVersions(),
        ]);

        setBoards(boardData.data);
        setMeta(boardData.meta);
        setClients(clientData as Client[]);
        setVersions(versionData);
        setError(null);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void fetchInitialData();
  }, [page]);

  const fetchBoards = async () => {
    try {
      const response = await boardService.listBoards({ page, pageSize: PAGE_SIZE });
      setBoards(response.data);
      setMeta(response.meta);
    } catch (err: unknown) {
      console.error(
        "Error refreshing boards:",
        getErrorMessage(err)
      );
    }
  };

  const handleOpenModal = (
    board: Board | null = null
  ) => {
    if (board) {
      setEditingBoard(board);

      setFormData({
        name: board.name,
        adb_identifier: board.adb_identifier,
        client: board.client,
        version: board.version,
        status:
          board.status === "ONLINE"
            ? "ONLINE"
            : "OFFLINE",
      });
    } else {
      setEditingBoard(null);

      setFormData({
        name: "",
        adb_identifier: "",
        client:
          clients.length > 0
            ? clients[0].id
            : "",
        version:
          versions.length > 0
            ? versions[0].id
            : "",
        status: "ONLINE",
      });
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
      if (
        formData.client === "" ||
        formData.version === ""
      ) {
        throw new Error(
          "Client and version are required."
        );
      }

      const connection =
        parseAdbIdentifier(
          formData.adb_identifier
        );

      const payload = {
        name: formData.name,
        adb_identifier:
          formData.adb_identifier,
        client: formData.client,
        version: formData.version,
        status: formData.status,
        type: "ADB",
        is_active: true,
        ...connection,
      };

      if (editingBoard) {
        await boardService.updateBoard(
          editingBoard.id,
          payload
        );
      } else {
        await boardService.createBoard(
          payload
        );
      }

      setIsModalOpen(false);
      await fetchBoards();
    } catch (err: unknown) {
      alert(
        `Error saving board: ${getErrorMessage(
          err
        )}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (
    boardId: number
  ) => {
    if (
      !confirm(
        "Are you sure you want to delete this board?"
      )
    ) {
      return;
    }

    try {
      await boardService.deleteBoard(boardId);

      setBoards((current) =>
        current.filter(
          (board) => board.id !== boardId
        )
      );
    } catch (err: unknown) {
      alert(
        `Error deleting board: ${getErrorMessage(
          err
        )}`
      );
    }
  };

  if (loading && boards.length === 0) {
    return (
      <div className={styles.container}>
        Loading boards...
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
          Board Management
        </h1>

        <Button
          variant="primary"
          onClick={() =>
            handleOpenModal(null)
          }
        >
          + Register Board
        </Button>
      </div>

      {error && (
        <div
          className="error-card"
          style={{ marginBottom: "1rem" }}
        >
          {error}
        </div>
      )}

      <Table label="Board management">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>ADB Identifier</th>
              <th>Client</th>
              <th>Version</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {boards.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                  }}
                >
                  No boards found.
                </td>
              </tr>
            ) : (
              boards.map((board) => (
                <tr key={board.id}>
                  <td>{board.id}</td>

                  <td
                    style={{
                      fontWeight: 600,
                      color: "hsl(var(--primary))",
                    }}
                  >
                    {board.name}
                  </td>

                  <td
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      opacity: 0.8,
                    }}
                  >
                    {board.adb_identifier}
                  </td>

                  <td>
                    {board.client_detail
                      ?.name || "---"}
                  </td>

                  <td>
                    {board.version_detail
                      ?.code || "---"}
                  </td>

                  <td>
                    <span
                      className={`${styles.badge} ${
                        board.computed_status ===
                        "online"
                          ? styles.badgeActive
                          : styles.badgeInactive
                      }`}
                    >
                      {board.computed_status ===
                      "online"
                        ? "Online"
                        : "Offline"}
                    </span>
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
                          handleOpenModal(board)
                        }
                      >
                        ✎
                      </button>

                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() =>
                          handleDelete(board.id)
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
      </Table>

      {meta && <Pagination page={meta.page} totalPages={Math.ceil(meta.count / meta.pageSize)} totalCount={meta.count} hasPrevious={Boolean(meta.previous)} hasNext={Boolean(meta.next)} onPrevious={() => setPage((current) => Math.max(1, current - 1))} onNext={() => setPage((current) => current + 1)} />}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div
              style={{ marginBottom: "1rem" }}
            >
              <h2
                className={styles.modalTitle}
              >
                {editingBoard
                  ? "Edit Board"
                  : "Register New Board"}
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Display Name</label>

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
                <label>
                  ADB Identifier (IP:Port)
                </label>

                <input
                  className={styles.input}
                  value={
                    formData.adb_identifier
                  }
                  placeholder="192.168.1.100:5555"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      adb_identifier:
                        e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Assign to Client</label>

                <select
                  className={styles.input}
                  value={formData.client}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      client: Number(
                        e.target.value
                      ),
                    })
                  }
                  required
                >
                  <option value="">
                    Select a client...
                  </option>

                  {clients.map((client) => (
                    <option
                      key={client.id}
                      value={client.id}
                    >
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>
                  Firmware / ADB Version
                </label>

                <select
                  className={styles.input}
                  value={formData.version}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      version: Number(
                        e.target.value
                      ),
                    })
                  }
                  required
                >
                  <option value="">
                    Select a version...
                  </option>

                  {versions.map((version) => (
                    <option
                      key={version.id}
                      value={version.id}
                    >
                      {version.code}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Stored Status</label>

                <select
                  className={styles.input}
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status:
                        e.target.value ===
                        "ONLINE"
                          ? "ONLINE"
                          : "OFFLINE",
                    })
                  }
                >
                  <option value="ONLINE">
                    Online
                  </option>

                  <option value="OFFLINE">
                    Offline
                  </option>
                </select>
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
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Board"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
