"use client";

import {
  boardService,
  clientService,
  versionService,
} from "@/composition";

import React, { useEffect, useState } from "react";

import type {
  Board,
} from "@/features/boards";
import type {
  Client,
} from "@/features/clients";
import type {
  ADBVersion,
} from "@/features/versions";
import { useLazyCatalog } from "@/shared/hooks/useLazyCatalog";
import { getErrorMessage } from "@/utils/errors";
import { ActionGroup, Button, ErrorState, FormField, FormSkeleton, Input, Modal, Page, PageHeader, Pagination, Select, StatusBadge, Table, TableEmpty, TablePageSkeleton, TablePanel } from "@/shared/components";
import type { PageMeta } from "@/core/Pagination";

const PAGE_SIZE = 20;

const loadBoardCatalogs = async () => {
  const [clients, versions] = await Promise.all([
    clientService.getClientCatalog(),
    versionService.getVersions(),
  ]);
  return { clients: clients as Client[], versions };
};

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
  const catalog = useLazyCatalog(loadBoardCatalogs);
  const clients = catalog.data?.clients ?? [];
  const versions: ADBVersion[] = catalog.data?.versions ?? [];

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
    const fetchBoardPage = async () => {
      try {
        setLoading(true);
        const boardData = await boardService.listBoards({ page, pageSize: PAGE_SIZE });
        setBoards(boardData.data);
        setMeta(boardData.meta);
        setError(null);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void fetchBoardPage();
  }, [page]);

  useEffect(() => {
    const catalogData = catalog.data;
    if (!isModalOpen || editingBoard || !catalogData) return;
    setFormData((current) => ({
      ...current,
      client: current.client === "" ? catalogData.clients[0]?.id ?? "" : current.client,
      version: current.version === "" ? catalogData.versions[0]?.id ?? "" : current.version,
    }));
  }, [isModalOpen, editingBoard, catalog.data]);

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
    void catalog.load().catch(() => {});
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
    return <TablePageSkeleton title="Board Management" tableTitle="Boards" columns={7} />;
  }

  return (
    <Page>
      <PageHeader title="Board Management" actions={<Button
          variant="primary"
          onClick={() =>
            handleOpenModal(null)
          }
        >
          + Register Board
        </Button>} />

      {error && (
        <ErrorState message={error} />
      )}

      <TablePanel title="Boards" refreshing={loading && boards.length > 0} pagination={meta && <Pagination page={meta.page} totalPages={Math.ceil(meta.count / meta.pageSize)} totalCount={meta.count} hasPrevious={Boolean(meta.previous)} hasNext={Boolean(meta.next)} onPrevious={() => setPage((current) => Math.max(1, current - 1))} onNext={() => setPage((current) => current + 1)} />}>
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
                <TableEmpty colSpan={7} label="No boards found." />
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
                    <StatusBadge variant={board.computed_status === "online" ? "success" : "neutral"}>
                      {board.computed_status ===
                      "online"
                        ? "Online"
                        : "Offline"}
                    </StatusBadge>
                  </td>

                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                      }}
                    >
                      <Button
                        onClick={() =>
                          handleOpenModal(board)
                        }
                      >
                        ✎
                      </Button>

                      <Button
                        variant="danger"
                        onClick={() =>
                          handleDelete(board.id)
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

      <Modal open={isModalOpen} title={editingBoard ? "Edit Board" : "Register New Board"} onClose={() => setIsModalOpen(false)}>
          {!catalog.data ? (
            catalog.error ? <><ErrorState message={catalog.error} /><Button type="button" onClick={() => void catalog.load().catch(() => {})}>Retry</Button></> : <FormSkeleton fields={5} />
          ) : (
            <form onSubmit={handleSubmit}>
              <FormField label="Display Name" required>
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

              <FormField label="ADB Identifier (IP:Port)" required>
                <Input
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
              </FormField>

              <FormField label="Assign to Client" required>
                <Select
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
                </Select>
              </FormField>

              <FormField label="Firmware / ADB Version" required>
                <Select
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
                </Select>
              </FormField>

              <FormField label="Stored Status">
                <Select
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
                </Select>
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
                  disabled={submitting}
                >Save Board</Button>
              </ActionGroup>
            </form>
          )}
      </Modal>
    </Page>
  );
}
