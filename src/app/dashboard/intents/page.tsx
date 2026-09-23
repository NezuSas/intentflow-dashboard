"use client";

import {
  boardService,
  clientService,
  intentService,
} from "@/composition";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "../dashboard.module.css";
import type {
  Intent,
  IntentListQuery,
} from "@/features/intents";
import type {
  Board,
} from "@/features/boards";
import type {
  Client,
} from "@/features/clients";
import { getErrorMessage } from "@/utils/errors";
import type { PageMeta } from "@/core/Pagination";
import {
  Button,
  Card,
  ErrorState,
  FormField,
  Input,
  LoadingState,
  Modal,
  PageHeader,
  Pagination,
  Select,
  StatusBadge,
  Table,
  TableEmpty,
  TablePanel,
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
  const [intents, setIntents] = useState<Intent[]>([]);
  const [boards, setBoards] = useState<Board[]>([]); // For filter dropdown
  const [clients, setClients] = useState<Client[]>([]); // For client filter
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const requestSequence = useRef(0);

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIntents = useCallback(async () => {
    const requestId = ++requestSequence.current;
    const query: IntentListQuery = {
      page: currentPage,
      pageSize: PAGE_SIZE,
    };

    if (selectedClientId) {
      query.client = Number(selectedClientId);
    }

    if (selectedBoardId) {
      query.board = Number(selectedBoardId);
    }

    if (filterDate) {
      Object.assign(query, getGuayaquilDayBounds(filterDate));
    }

    try {
      setLoading(true);
      setError(null);

      const response = await intentService.list(query);

      if (requestId !== requestSequence.current) {
        return;
      }

      setIntents(response.data);
      setMeta(response.meta);
    } catch (err: unknown) {
      if (requestId !== requestSequence.current) {
        return;
      }

      setError(getErrorMessage(err));
    } finally {
      if (requestId === requestSequence.current) {
        setLoading(false);
      }
    }
  }, [
    currentPage,
    filterDate,
    selectedBoardId,
    selectedClientId,
  ]);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const clientsData = await clientService.getClientCatalog();
        setClients(clientsData as Client[]);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      }
    };

    void fetchCatalogs();
  }, []);

  useEffect(() => {
    if (!selectedClientId) {
      setBoards([]);
      return;
    }

    void boardService.getBoardCatalog(Number(selectedClientId))
      .then((data) => setBoards(data as Board[]))
      .catch((err: unknown) => setError(getErrorMessage(err)));
  }, [selectedClientId]);

  useEffect(() => {
    void loadIntents();

    return () => {
      requestSequence.current += 1;
    };
  }, [loadIntents]);

  // Get boards filtered by selected client
  const availableBoards = boards;

  const totalPages = meta
    ? Math.max(1, Math.ceil(meta.count / meta.pageSize))
    : 1;

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

  const getStatusVariant = (status: string): "success" | "warning" | "error" | "neutral" => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'success': return 'success';
      case 'error':
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <div>
      <PageHeader title="Intents" actions={<Button variant="primary" onClick={() => window.location.reload()}>
          🔄 Refresh
        </Button>} />

      {/* FILTERS TOOLBAR */}
      <Card className={styles.filtersToolbar}>

        {/* Client Filter */}
        <FormField label="Filter by Client">
            <Select
                value={selectedClientId}
                onChange={(e) => handleClientFilterChange(e.target.value)}
                className={styles.filterControl}
            >
                <option value="">All Clients</option>
                {clients.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </Select>
        </FormField>

        {/* Board Filter (filtered by selected client) */}
        <FormField className={`${styles.filterGroupWide}`} label={`Filter by Board ${selectedClientId ? `(${clients.find(c => c.id === parseInt(selectedClientId))?.name || "Client"})` : ""}`}>
            <Select
                value={selectedBoardId}
                onChange={(e) => handleBoardFilterChange(e.target.value)}
                disabled={!selectedClientId && availableBoards.length === 0}
                className={styles.filterControl}
            >
                <option value="">
                    {selectedClientId ? 'All Boards' : 'Select a client first'}
                </option>
                {availableBoards.map(b => (
                    <option key={b.id} value={b.id}>
                        {b.name} ({b.adb_identifier})
                    </option>
                ))}
            </Select>
        </FormField>

        {/* Date Filter */}
        <FormField label="Filter by Date">
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
                variant="danger"
                className={styles.clearFiltersButton}
            >
                ✕ Clear Filters
            </Button>
        )}
      </Card>

      <TablePanel title="Intents" pagination={meta && <Pagination page={meta.page} totalPages={totalPages} totalCount={meta.count} hasPrevious={Boolean(meta.previous)} hasNext={Boolean(meta.next)} onPrevious={() => setCurrentPage((page) => page - 1)} onNext={() => setCurrentPage((page) => page + 1)} />}>
        {loading ? (
          <LoadingState label="Loading intents..." />
        ) : error ? (
          <ErrorState message={`Error: ${error}`} />
        ) : (
          <Table label="Intents">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Command</th>
                  <th>Board</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Executed at</th>
                </tr>
              </thead>
              <tbody>
                {intents.length === 0 ? (
                  <tr>
                    <TableEmpty colSpan={6} label="No intents found matching criteria." />
                  </tr>
                ) : (
                  intents.map((intent) => (
                    <tr key={intent.id}>
                      <td>#{intent.id}</td>
                      <td>{intent.command_key}</td>

                      {/* Board column with name and ADB identifier */}
                      <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 500 }}>{intent.board?.name || "Unknown"}</span>
                              <small>{intent.board?.adb_identifier}</small>
                          </div>
                      </td>

                      {/* Client column - showing which client owns the board */}
                      <td>
                          <strong>
                              {intent.board?.client_detail?.name || "Unknown"}
                          </strong>
                      </td>

                      <td
                        style={{
                          cursor: intent.status?.toString().toUpperCase().trim() === 'ERROR' ? "pointer" : "default",
                          userSelect: "none"
                        }}
                        onMouseDown={(e) => {
                          const status = intent.status?.toString().toUpperCase().trim();
                          if (status === 'ERROR') {
                            e.preventDefault();
                            handleShowError(intent);
                          }
                        }}
                      >
                        <StatusBadge variant={getStatusVariant(intent.status)}>
                          {intent.status} {intent.status === 'ERROR' && '🔍'}
                        </StatusBadge>
                      </td>

                      <td>
                        {new Date(intent.executed_at).toLocaleString()}
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
        <Modal open title="Error Details" description={`Intent #${selectedIntent.id} - ${selectedIntent.command_key}`} onClose={handleCloseErrorModal} footer={<Button variant="primary" onClick={handleCloseErrorModal}>Close</Button>}>

            {/* Modal Body */}
            <div>
              <div>
                <h3>
                  Board
                </h3>
                <p>
                  {selectedIntent.board?.name} ({selectedIntent.board?.adb_identifier})
                </p>
              </div>

              <div>
                <h3>
                  Command
                </h3>
                <code>
                  {selectedIntent.resolved_command}
                </code>
              </div>

              <div>
                <h3>
                  Error Output
                </h3>
                <pre>
                  {selectedIntent.output || "No error output available"}
                </pre>
              </div>

              <div>
                <h3>
                  Executed At
                </h3>
                <p>
                  {new Date(selectedIntent.executed_at).toLocaleString()}
                </p>
              </div>
            </div>

        </Modal>
      )}

    </div>
  );
}
