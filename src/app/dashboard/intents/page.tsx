"use client";

import {
  boardService,
  clientService,
  intentService,
} from "@/composition";

import React, { useEffect, useState } from "react";
import styles from "../dashboard.module.css";
import type {
  Intent,
} from "@/features/intents";
import type {
  Board,
} from "@/features/boards";
import type {
  Client,
} from "@/features/clients";
import { getErrorMessage } from "@/utils/errors";

export default function IntentsPage() {
  const [intents, setIntents] = useState<Intent[]>([]);
  const [filteredIntents, setFilteredIntents] = useState<Intent[]>([]);
  const [boards, setBoards] = useState<Board[]>([]); // For filter dropdown
  const [clients, setClients] = useState<Client[]>([]); // For client filter

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [intentsData, boardsData, clientsData] = await Promise.all([
          intentService.getIntents(),
          boardService.getBoards(),
          clientService.getClients()
        ]);
        setIntents(intentsData);
        setFilteredIntents(intentsData);
        setBoards(boardsData);
        setClients(clientsData);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  // Filter effect
  useEffect(() => {
    let result = intents;

    // Filter by Client (affects which boards are shown)
    if (selectedClientId) {
      result = result.filter(i => i.board?.client === parseInt(selectedClientId));
    }

    // Filter by Board
    if (selectedBoardId) {
      result = result.filter(i => i.board?.id === parseInt(selectedBoardId));
    }

    // Filter by Date (YYYY-MM-DD matches start of executed_at ISO string)
    if (filterDate) {
      result = result.filter(i => i.executed_at.startsWith(filterDate));
    }

    setFilteredIntents(result);
  }, [selectedClientId, selectedBoardId, filterDate, intents]);

  // Reset board filter when client changes
  useEffect(() => {
    setSelectedBoardId("");
  }, [selectedClientId]);

  // Get boards filtered by selected client
  const availableBoards = selectedClientId
    ? boards.filter(b => b.client === parseInt(selectedClientId))
    : boards;

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
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>

        {/* Client Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1', minWidth: '200px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Filter by Client</label>
            <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            >
                <option value="" style={{ background: '#0f172a', color: 'white' }}>All Clients</option>
                {clients.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#0f172a', color: 'white', padding: '0.5rem' }}>
                        {c.name}
                    </option>
                ))}
            </select>
        </div>

        {/* Board Filter (filtered by selected client) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1', minWidth: '250px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                Filter by Board {selectedClientId && `(${clients.find(c => c.id === parseInt(selectedClientId))?.name || 'Client'})`}
            </label>
            <select
                value={selectedBoardId}
                onChange={(e) => setSelectedBoardId(e.target.value)}
                disabled={!selectedClientId && availableBoards.length === 0}
                style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '0.875rem',
                    cursor: selectedClientId || availableBoards.length > 0 ? 'pointer' : 'not-allowed',
                    outline: 'none',
                    transition: 'all 0.2s',
                    opacity: (!selectedClientId && availableBoards.length === 0) ? 0.5 : 1
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            >
                <option value="" style={{ background: '#0f172a', color: 'white' }}>
                    {selectedClientId ? 'All Boards' : 'Select a client first'}
                </option>
                {availableBoards.map(b => (
                    <option key={b.id} value={b.id} style={{ background: '#0f172a', color: 'white', padding: '0.5rem' }}>
                        {b.name} ({b.adb_identifier})
                    </option>
                ))}
            </select>
        </div>

        {/* Date Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1', minWidth: '200px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Filter by Date</label>
            <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '0.875rem',
                    colorScheme: 'dark',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
        </div>

        {/* Clear Filters Button */}
        {(selectedClientId || selectedBoardId || filterDate) && (
            <button
                onClick={() => { setSelectedClientId(""); setSelectedBoardId(""); setFilterDate(""); }}
                style={{
                    background: 'transparent',
                    border: '1px solid hsl(var(--error) / 0.5)',
                    color: 'hsl(var(--error))',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'hsl(var(--error) / 0.1)';
                    e.currentTarget.style.borderColor = 'hsl(var(--error))';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'hsl(var(--error) / 0.5)';
                }}
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
          <div style={{ padding: "4rem", textAlign: "center", color: "#f87171" }}>
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
                {filteredIntents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "4rem", textAlign: "center", color: "hsl(var(--muted-foreground))" }}>
                      No intents found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredIntents.map((intent) => (
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

      {/* Error Details Modal */}
      {errorModalOpen && selectedIntent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem"
          }}
          onClick={handleCloseErrorModal}
        >
          <div
            style={{
              background: "hsl(var(--background-elevated))",
              borderRadius: "12px",
              border: "1px solid var(--glass-border)",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: "1.5rem",
              borderBottom: "1px solid var(--glass-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "hsl(var(--foreground))" }}>
                  Error Details
                </h2>
                <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
                  Intent #{selectedIntent.id} - {selectedIntent.command_key}
                </p>
              </div>
              <button
                onClick={handleCloseErrorModal}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "hsl(var(--muted-foreground))",
                  padding: "0.5rem",
                  borderRadius: "6px",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.color = "hsl(var(--foreground))";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "hsl(var(--muted-foreground))";
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  Board
                </h3>
                <p style={{ margin: 0, fontSize: "1rem", color: "hsl(var(--foreground))" }}>
                  {selectedIntent.board?.name} ({selectedIntent.board?.adb_identifier})
                </p>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  Command
                </h3>
                <code style={{
                  display: "block",
                  padding: "0.75rem",
                  background: "rgba(0, 0, 0, 0.3)",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  color: "hsl(var(--primary))",
                  fontFamily: "monospace"
                }}>
                  {selectedIntent.resolved_command}
                </code>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  Error Output
                </h3>
                <pre style={{
                  margin: 0,
                  padding: "1rem",
                  background: "rgba(220, 38, 38, 0.1)",
                  border: "1px solid rgba(220, 38, 38, 0.3)",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  color: "#fca5a5",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: "300px",
                  overflow: "auto"
                }}>
                  {selectedIntent.output || "No error output available"}
                </pre>
              </div>

              <div>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  Executed At
                </h3>
                <p style={{ margin: 0, fontSize: "1rem", color: "hsl(var(--foreground))" }}>
                  {new Date(selectedIntent.executed_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid var(--glass-border)",
              display: "flex",
              justifyContent: "flex-end"
            }}>
              <button
                onClick={handleCloseErrorModal}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "hsl(var(--primary))",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
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
