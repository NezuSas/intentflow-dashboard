"use client";

import {
  boardService,
  clientService,
  versionService,
} from "@/composition";

import React, { useCallback, useState } from "react";

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
import { usePagedQuery } from "@/shared/hooks/useQuery";

import { getErrorMessage } from "@/utils/errors";
import { useActionFeedback } from "@/shared/hooks/useActionFeedback";
import { ActionGroup, Button, ErrorState, FormField, FormSkeleton, Input, Modal, Page, PageHeader, Pagination, RowActions, Select, StatusBadge, Table, TableEmpty, TablePageSkeleton, TablePanel } from "@/shared/components";
import { pageAfterDeletion } from "@/core/Pagination";

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
      "El identificador ADB debe tener el formato IP:PUERTO."
    );
  }

  return {
    ip_address: ipAddress,
    port,
  };
}

export default function BoardsPage() {
  const feedback = useActionFeedback();
  const catalog = useLazyCatalog(loadBoardCatalogs);
  const clients = catalog.data?.clients ?? [];
  const versions: ADBVersion[] = catalog.data?.versions ?? [];

  const [page, setPage] = useState(1);
  const boardsQuery = usePagedQuery(useCallback(() => boardService.listBoards({ page, pageSize: PAGE_SIZE }), [page]));
  const { items: boards, meta, loading, error } = boardsQuery;
  const [submitting, setSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingBoard, setEditingBoard] =
    useState<Board | null>(null);

  const [formData, setFormData] =
    useState<BoardFormData>(emptyForm);

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
    // When the catalog arrives after the modal opened, fill the empty selects with the first option.
    void catalog
      .load()
      .then((data) => {
        if (board) return;
        setFormData((current) => ({
          ...current,
          client: current.client === "" ? data.clients[0]?.id ?? "" : current.client,
          version: current.version === "" ? data.versions[0]?.id ?? "" : current.version,
        }));
      })
      .catch(() => {});
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
          "El cliente y la versión son obligatorios."
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
      boardsQuery.reload();
    } catch (err: unknown) {
      feedback.error(
        `No se pudo guardar la placa: ${getErrorMessage(
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
    try {
      await boardService.deleteBoard(boardId);
      const nextPage = meta ? pageAfterDeletion(meta) : page;
      if (nextPage !== page) setPage(nextPage);
      else boardsQuery.reload();
    } catch (err: unknown) {
      feedback.error(
        `No se pudo eliminar la placa: ${getErrorMessage(
          err
        )}`
      );
    }
  };

  if (loading && boards.length === 0) {
    return <TablePageSkeleton title="Placas" tableTitle="Placas" columns={7} />;
  }

  return (
    <Page>
      <PageHeader title="Placas" description="Las pantallas Android de cada cliente y su estado de conexión." actions={<Button
          variant="primary"
          onClick={() =>
            handleOpenModal(null)
          }
        >
          + Registrar placa
        </Button>} />

      {error && (
        <ErrorState message={error} />
      )}

      <TablePanel title="Placas" refreshing={loading && boards.length > 0} pagination={meta && <Pagination page={meta.page} pageSize={meta.pageSize} totalCount={meta.count} onPageChange={setPage} />}>
      <Table label="Placas">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Identificador ADB</th>
              <th>Cliente</th>
              <th>Versión</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {boards.length === 0 ? (
              <tr>
                <TableEmpty colSpan={7} label="No hay placas registradas." />
              </tr>
            ) : (
              boards.map((board) => (
                <tr key={board.id}>
                  <td>{board.id}</td>

                  <td
                    style={{ fontWeight: 500 }}
                  >
                    {board.name}
                  </td>

                  <td
                    style={{ fontFamily: "var(--font-mono)", fontSize: "12.5px", color: "var(--text-muted)" }}
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
                        ? "En línea"
                        : "Sin conexión"}
                    </StatusBadge>
                  </td>

                  <td>
                    <RowActions itemName={`la placa ${board.name}`} onEdit={() => handleOpenModal(board)} onDelete={() => handleDelete(board.id)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
      </Table>
      </TablePanel>

      <Modal open={isModalOpen} title={editingBoard ? "Editar placa" : "Registrar placa"} onClose={() => setIsModalOpen(false)}>
          {!catalog.data ? (
            catalog.error ? <><ErrorState message={catalog.error} /><Button type="button" onClick={() => void catalog.load().catch(() => {})}>Reintentar</Button></> : <FormSkeleton fields={5} />
          ) : (
            <form onSubmit={handleSubmit}>
              <FormField label="Nombre visible" required>
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

              <FormField label="Identificador ADB (IP:puerto)" required>
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

              <FormField label="Cliente" required>
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
                    Elige un cliente...
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

              <FormField label="Versión de firmware / ADB" required>
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
                    Elige una versión...
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

              <FormField label="Estado registrado">
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
                    En línea
                  </option>

                  <option value="OFFLINE">
                    Sin conexión
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
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  disabled={submitting}
                >Guardar placa</Button>
              </ActionGroup>
            </form>
          )}
      </Modal>
    </Page>
  );
}
