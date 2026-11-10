"use client";

import {
  boardService,
  clientService,
  intentService,
} from "@/composition";

import React, {
  useCallback,
  useState,
} from "react";
import styles from "../dashboard.module.css";
import { CloseOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  IntentErrorDetails,
  IntentStatusBadge,
  IntentSourceBadge,
  type Intent,
  type IntentListQuery,
} from "@/features/intents";
import type {
  Board,
} from "@/features/boards";
import type {
  Client,
} from "@/features/clients";
import { usePagedQuery, useQuery } from "@/shared/hooks/useQuery";
import { formatGuayaquilDateTime } from "@/shared/format/date";
import {
  Button,
  Card,
  ErrorState,
  FormField,
  Input,
  Modal,
  PageHeader,
  Pagination,
  Select,
  Table,
  TableEmpty,
  TablePanel,
  TableSkeleton,
} from "@/shared/components";

const PAGE_SIZE = 20;
const GUAYAQUIL_OFFSET = "-05:00";

export const getGuayaquilDayBounds = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const nextDay = new Date(
    Date.UTC(year, month - 1, day + 1)
  );
  const nextDate = [
    nextDay.getUTCFullYear(),
    String(nextDay.getUTCMonth() + 1).padStart(2, "0"),
    String(nextDay.getUTCDate()).padStart(2, "0"),
  ].join("-");

  return {
    executedAtAfter: `${date}T00:00:00${GUAYAQUIL_OFFSET}`,
    executedAtBefore: `${nextDate}T00:00:00${GUAYAQUIL_OFFSET}`,
  };
};

export default function IntentsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");

  // Error modal
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);

  const handleShowError = (intent: Intent) => {
    setSelectedIntent(intent);
    setErrorModalOpen(true);
  };

  const handleCloseErrorModal = () => {
    setErrorModalOpen(false);
    setSelectedIntent(null);
  };

  // The list follows the page and the filters; the catalogs feed the filter selects.
  const intentsQuery = usePagedQuery(
    useCallback(() => {
      const query: IntentListQuery = { page: currentPage, pageSize: PAGE_SIZE };
      if (selectedClientId) query.client = Number(selectedClientId);
      if (selectedBoardId) query.board = Number(selectedBoardId);
      if (filterDate) Object.assign(query, getGuayaquilDayBounds(filterDate));
      return intentService.list(query);
    }, [currentPage, filterDate, selectedBoardId, selectedClientId])
  );
  const { items: intents, meta, loading, error } = intentsQuery;

  const clientsQuery = useQuery(useCallback(() => clientService.getClientCatalog() as Promise<Client[]>, []));
  const boardsQuery = useQuery(
    useCallback(
      () => (selectedClientId ? (boardService.getBoardCatalog(Number(selectedClientId)) as Promise<Board[]>) : Promise.resolve([] as Board[])),
      [selectedClientId]
    )
  );
  const clients = clientsQuery.data ?? [];
  const boards = boardsQuery.data ?? [];
  const catalogError = clientsQuery.error ?? boardsQuery.error;

  // Get boards filtered by selected client
  const availableBoards = boards;

  const handleClientFilterChange = (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedBoardId("");
    setCurrentPage(1);
  };

  const handleBoardFilterChange = (boardId: string) => {
    setSelectedBoardId(boardId);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (date: string) => {
    setFilterDate(date);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedClientId("");
    setSelectedBoardId("");
    setFilterDate("");
    setCurrentPage(1);
  };

  return (
    <div>
      <PageHeader title="Intenciones" description="Cada orden que llegó a una placa, de la más reciente a la más antigua." actions={<Button variant="secondary" icon={<ReloadOutlined />} loading={loading && intents.length > 0} onClick={() => intentsQuery.reload()}>
          Actualizar
        </Button>} />

      {/* FILTERS TOOLBAR */}
      <Card className={styles.filtersToolbar}>

        {/* Client Filter */}
        <FormField label="Cliente">
            <Select
                value={selectedClientId}
                onChange={(e) => handleClientFilterChange(e.target.value)}
                className={styles.filterControl}
            >
                <option value="">Todos los clientes</option>
                {clients.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </Select>
        </FormField>

        {/* Board Filter (filtered by selected client) */}
        <FormField className={`${styles.filterGroupWide}`} label={`Placa ${selectedClientId ? `(${clients.find(c => c.id === parseInt(selectedClientId))?.name || "cliente"})` : ""}`}>
            <Select
                value={selectedBoardId}
                onChange={(e) => handleBoardFilterChange(e.target.value)}
                disabled={!selectedClientId && availableBoards.length === 0}
                className={styles.filterControl}
            >
                <option value="">
                    {selectedClientId ? 'Todas las placas' : 'Elige primero un cliente'}
                </option>
                {availableBoards.map(b => (
                    <option key={b.id} value={b.id}>
                        {b.name} ({b.adb_identifier})
                    </option>
                ))}
            </Select>
        </FormField>

        {/* Date Filter */}
        <FormField label="Fecha">
            <Input
                type="date"
                value={filterDate}
                onChange={(e) => handleDateFilterChange(e.target.value)}
                className={styles.filterControl}
            />
        </FormField>

        {/* Clear Filters Button */}
        {(selectedClientId || selectedBoardId || filterDate) && (
            <Button
                onClick={handleClearFilters}
                variant="text"
                icon={<CloseOutlined />}
                className={styles.clearFiltersButton}
            >
                Quitar filtros
            </Button>
        )}
      </Card>

      {catalogError && <ErrorState message={`Filtros: ${catalogError}`} />}

      <TablePanel title="Intenciones" refreshing={loading && intents.length > 0} pagination={meta && <Pagination page={meta.page} pageSize={meta.pageSize} totalCount={meta.count} onPageChange={setCurrentPage} />}>
        {loading && intents.length === 0 ? (
          <TableSkeleton columns={7} label="Cargando intenciones..." />
        ) : error ? (
          <ErrorState message={`Error: ${error}`} />
        ) : (
          <Table label="Intenciones">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Comando</th>
                  <th>Placa</th>
                  <th>Cliente</th>
                  <th>Origen</th>
                  <th>Estado</th>
                  <th>Ejecutada</th>
                </tr>
              </thead>
              <tbody>
                {intents.length === 0 ? (
                  <tr>
                    <TableEmpty colSpan={7} label="No hay intenciones con esos filtros." />
                  </tr>
                ) : (
                  intents.map((intent) => (
                    <tr key={intent.id}>
                      <td>#{intent.id}</td>
                      <td>{intent.command_key}</td>

                      {/* Board column with name and ADB identifier */}
                      <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 500 }}>{intent.board?.name || "Desconocido"}</span>
                              <small>{intent.board?.adb_identifier}</small>
                          </div>
                      </td>

                      {/* Client column - showing which client owns the board */}
                      <td>
                          <strong>
                              {intent.board?.client_detail?.name || "Desconocido"}
                          </strong>
                      </td>

                      <td><IntentSourceBadge source={intent.source} /></td>
                      <td><IntentStatusBadge intent={intent} onShowError={handleShowError} /></td>

                      <td>
                        {formatGuayaquilDateTime(intent.executed_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
          </Table>
        )}
      </TablePanel>

      {/* Error Details Modal */}
      {errorModalOpen && selectedIntent && (
        <Modal open title="Detalle del error" description={`Intención ${selectedIntent.id} · ${selectedIntent.command_key}`} onClose={handleCloseErrorModal} footer={<Button variant="primary" onClick={handleCloseErrorModal}>Cerrar</Button>}>
          <IntentErrorDetails intent={selectedIntent} />
        </Modal>
      )}

    </div>
  );
}
