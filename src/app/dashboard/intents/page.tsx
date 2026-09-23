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

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'success': return 'status-chip--success';
      case 'error':
      case 'failed': return 'status-chip--error';
      case 'pending': return 'status-chip--warning';
      default: return 'status-chip--neutral';
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 700 }}>Intents</h1>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          🔄 Refresh
        </button>
      </div>

      {/* FILTERS TOOLBAR */}
      <div className={`glass-panel ${styles.filtersToolbar}`}>

        {/* Client Filter */}
        <div className={`input-group ${styles.filterGroup}`}>
            <label className={`input-label ${styles.filterLabel}`}>Filter by Client</label>
            <select
                value={selectedClientId}
                onChange={(e) => handleClientFilterChange(e.target.value)}
                className={`input-field ${styles.filterControl}`}
            >
                <option value="">All Clients</option>
                {clients.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </select>
        </div>

        {/* Board Filter (filtered by selected client) */}
        <div className={`input-group ${styles.filterGroup} ${styles.filterGroupWide}`}>
            <label className={`input-label ${styles.filterLabel}`}>
                Filter by Board {selectedClientId && `(${clients.find(c => c.id === parseInt(selectedClientId))?.name || 'Client'})`}
            </label>
            <select
                value={selectedBoardId}
                onChange={(e) => handleBoardFilterChange(e.target.value)}
                disabled={!selectedClientId && availableBoards.length === 0}
                className={`input-field ${styles.filterControl}`}
            >
                <option value="">
                    {selectedClientId ? 'All Boards' : 'Select a client first'}
                </option>
                {availableBoards.map(b => (
                    <option key={b.id} value={b.id}>
                        {b.name} ({b.adb_identifier})
                    </option>
                ))}
            </select>
        </div>

        {/* Date Filter */}
        <div className={`input-group ${styles.filterGroup}`}>
            <label className={`input-label ${styles.filterLabel}`}>Filter by Date</label>
            <input
                type="date"
                value={filterDate}
                onChange={(e) => handleDateFilterChange(e.target.value)}
                className={`input-field ${styles.filterControl}`}
            />
        </div>

        {/* Clear Filters Button */}
        {(selectedClientId || selectedBoardId || filterDate) && (
            <button
                onClick={handleClearFilters}
                className={`btn btn-ghost ${styles.clearFiltersButton}`}
            >
                ✕ Clear Filters
            </button>
        )}
      </div>

      <div className="glass-panel" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "hsl(var(--muted-foreground))" }}>
            Loading intents...
          </div>
        ) : error ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "hsl(var(--error))" }}>
            Error: {error}
          </div>
        ) : (
          <div className="nezu-table-container">
            <table className="nezu-table">
              <thead className="nezu-table__header">
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
                    <td colSpan={6} style={{ padding: "4rem", textAlign: "center", color: "hsl(var(--muted-foreground))" }}>
                      No intents found matching criteria.
                    </td>
                  </tr>
                ) : (
                  intents.map((intent) => (
                    <tr key={intent.id} className="nezu-table__row">
                      <td className="nezu-table__cell">#{intent.id}</td>
                      <td className="nezu-table__cell nezu-table__emphasis">{intent.command_key}</td>

                      {/* Board column with name and ADB identifier */}
                      <td className="nezu-table__cell">
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 500 }}>{intent.board?.name || "Unknown"}</span>
                              <span className="nezu-table__meta">{intent.board?.adb_identifier}</span>
                          </div>
                      </td>

                      {/* Client column - showing which client owns the board */}
                      <td className="nezu-table__cell">
                          <span className="nezu-table__emphasis">
                              {intent.board?.client_detail?.name || "Unknown"}
                          </span>
                      </td>

                      <td
                        className="nezu-table__cell"
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
                        <span className={`status-chip ${getStatusClass(intent.status)}`}>
                          {intent.status} {intent.status === 'ERROR' && '🔍'}
                        </span>
                      </td>

                      <td className="nezu-table__cell nezu-table__cell--muted">
                        {new Date(intent.executed_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta && (
        <div className={styles.pagination}>
          <span className={styles.paginationTotal}>
            {meta.count} total records
          </span>
          <div className={styles.paginationControls}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              Previous
            </button>
            <span className={styles.paginationIndicator}>
              Page {meta.page} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={!meta.next}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Error Details Modal */}
      {errorModalOpen && selectedIntent && (
        <div
          className="nezu-modal-overlay"
          onClick={handleCloseErrorModal}
        >
          <div
            className="nezu-modal nezu-modal--error"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="nezu-modal__header">
              <div>
                <h2 className="nezu-modal__title">
                  Error Details
                </h2>
                <p className="nezu-modal__description">
                  Intent #{selectedIntent.id} - {selectedIntent.command_key}
                </p>
              </div>
              <button
                onClick={handleCloseErrorModal}
                className="nezu-modal__close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="nezu-modal__body">
              <div className="nezu-modal__section">
                <h3 className="nezu-modal__label">
                  Board
                </h3>
                <p className="nezu-modal__value">
                  {selectedIntent.board?.name} ({selectedIntent.board?.adb_identifier})
                </p>
              </div>

              <div className="nezu-modal__section">
                <h3 className="nezu-modal__label">
                  Command
                </h3>
                <code className="nezu-modal__code">
                  {selectedIntent.resolved_command}
                </code>
              </div>

              <div className="nezu-modal__section">
                <h3 className="nezu-modal__label">
                  Error Output
                </h3>
                <pre className="nezu-modal__error-output">
                  {selectedIntent.output || "No error output available"}
                </pre>
              </div>

              <div>
                <h3 className="nezu-modal__label">
                  Executed At
                </h3>
                <p className="nezu-modal__value">
                  {new Date(selectedIntent.executed_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="nezu-modal__footer">
              <button
                onClick={handleCloseErrorModal}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
