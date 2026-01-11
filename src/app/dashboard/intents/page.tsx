"use client";

import React, { useEffect, useState } from "react";
import styles from "../dashboard.module.css";
import { intentService, Intent } from "@/services/intentService";
import { boardService } from "@/services/boardService";
import { clientService } from "@/services/clientService";

export default function IntentsPage() {
  const [intents, setIntents] = useState<Intent[]>([]);
  const [filteredIntents, setFilteredIntents] = useState<Intent[]>([]);
  const [boards, setBoards] = useState<any[]>([]); // For filter dropdown
  const [clients, setClients] = useState<any[]>([]); // For client filter
  
  // Filters
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");

  // Error modal
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<any>(null);

  const handleShowError = (intent: any) => {
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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'success': return 'rgb(34, 197, 94)';
      case 'error':
      case 'failed': return 'rgb(239, 68, 68)';
      case 'pending': return 'rgb(234, 179, 8)';
      default: return 'hsl(var(--muted-foreground))';
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
                    border: '1px solid rgba(239, 68, 68, 0.5)', 
                    color: 'rgb(239, 68, 68)', 
                    padding: '0.75rem 1.5rem', 
                    borderRadius: '8px', 
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.borderColor = 'rgb(239, 68, 68)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
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
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--glass-border)" }}>
                  <th style={{ padding: "1rem", fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>ID</th>
                  <th style={{ padding: "1rem", fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>COMMAND</th>
                  <th style={{ padding: "1rem", fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>BOARD</th>
                  <th style={{ padding: "1rem", fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>CLIENT</th>
                  <th style={{ padding: "1rem", fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>STATUS</th>
                  <th style={{ padding: "1rem", fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>EXECUTED AT</th>
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
                    <tr 
                      key={intent.id} 
                      style={{ 
                        borderBottom: "1px solid var(--glass-border)", 
                        transition: "background 0.2s"
                      }} 
                      className="hover-row"
                    >
                      <td style={{ padding: "1rem", fontSize: "0.875rem" }}>#{intent.id}</td>
                      <td style={{ padding: "1rem", fontSize: "0.875rem", fontWeight: 500 }}>{intent.command_key}</td>
                      
                      {/* Board column with name and ADB identifier */}
                      <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 500 }}>{intent.board?.name || "Unknown"}</span>
                              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{intent.board?.adb_identifier}</span>
                          </div>
                      </td>
                      
                      {/* Client column - showing which client owns the board */}
                      <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                          <span style={{ fontWeight: 500, color: 'rgb(59, 130, 246)' }}>
                              {intent.board?.client_detail?.name || "Unknown"}
                          </span>
                      </td>

                      <td 
                        style={{ 
                          padding: "1rem",
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
                        <span style={{ 
                          fontSize: "0.75rem", 
                          fontWeight: 600, 
                          color: getStatusColor(intent.status),
                          background: `${getStatusColor(intent.status)}20`,
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          textTransform: "uppercase",
                          border: intent.status === 'ERROR' ? `1px solid ${getStatusColor(intent.status)}40` : 'none',
                          display: 'inline-block',
                          transition: 'all 0.2s'
                        }}>
                          {intent.status} {intent.status === 'ERROR' && '🔍'}
                        </span>
                      </td>

                      <td style={{ padding: "1rem", fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>
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

      <style jsx>{`
        .hover-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </div>
  );
}
