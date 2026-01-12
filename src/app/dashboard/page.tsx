"use client";

import React, { useEffect, useState, useRef } from "react";
import styles from "./dashboard.module.css";
import { authService } from "@/services/authService";
import { API_URL } from "@/config/api";

interface DashboardStats {
  total_intents_30d: number;
  total_users: number;
  total_clients: number;
  active_boards: number;
  recent_intents: any[];
}

export default function DashboardHomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // Error modal state
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

  useEffect(() => {
    // Prevent multiple calls in React Strict Mode (development)
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await authService.fetchWithAuth(`${API_URL}/intents/stats/`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stats (${response.status})`);
        }
        
        const json = await response.json();
        setStats(json.data || json);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []); // Empty dependency array - only fetch on page load

  const statCards = stats ? [
    { 
      label: "Intents (30d)", 
      value: stats.total_intents_30d.toLocaleString(), 
      change: "Last 30 days", 
      icon: "⚡",
      color: "rgb(59, 130, 246)"
    },
    { 
      label: "Active Clients", 
      value: stats.total_clients.toLocaleString(), 
      change: "Total active", 
      icon: "🏢",
      color: "rgb(34, 197, 94)"
    },
    { 
      label: "Active Boards", 
      value: stats.active_boards.toLocaleString(), 
      change: "Connected", 
      icon: "📱",
      color: "rgb(168, 85, 247)"
    },
    { 
      label: "Total Users", 
      value: stats.total_users.toLocaleString(), 
      change: "Active users", 
      icon: "👥",
      color: "rgb(251, 146, 60)"
    },
  ] : [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'success': return 'rgb(34, 197, 94)';
      case 'error':
      case 'failed': return 'rgb(239, 68, 68)';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 700 }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Monitor your system's performance and activity.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "4rem", textAlign: "center", color: "hsl(var(--muted-foreground))" }}>
          Loading dashboard...
        </div>
      ) : error ? (
        <div style={{ padding: "4rem", textAlign: "center", color: "#f87171" }}>
          Error: {error}
        </div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            {statCards.map((stat) => (
              <div key={stat.label} className={`${styles.statCard} glass-card`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <span style={{ fontSize: "1.5rem" }}>{stat.icon}</span>
                  <span style={{ 
                    color: stat.color, 
                    fontSize: "0.75rem", 
                    fontWeight: 600,
                    background: `${stat.color}20`,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px'
                  }}>
                    {stat.change}
                  </span>
                </div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ padding: "2rem", minHeight: "300px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>
              Recent Activity
            </h2>
            
            {stats && stats.recent_intents.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--glass-border)" }}>
                      <th style={{ padding: "0.75rem", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", textTransform: "uppercase" }}>Command</th>
                      <th style={{ padding: "0.75rem", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", textTransform: "uppercase" }}>Board</th>
                      <th style={{ padding: "0.75rem", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", textTransform: "uppercase" }}>Client</th>
                      <th style={{ padding: "0.75rem", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", textTransform: "uppercase" }}>Status</th>
                      <th style={{ padding: "0.75rem", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", textTransform: "uppercase" }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_intents.map((intent) => (
                      <tr key={intent.id} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                        <td style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 500 }}>{intent.command_key}</td>
                        <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{intent.board?.name || "Unknown"}</span>
                            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{intent.board?.adb_identifier}</span>
                          </div>
                        </td>
                        <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
                          <span style={{ color: 'rgb(59, 130, 246)', fontWeight: 500 }}>
                            {intent.board?.client_detail?.name || "Unknown"}
                          </span>
                        </td>
                        <td 
                        style={{ 
                          padding: "0.75rem",
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
                          border: intent.status?.toString().toUpperCase().trim() === 'ERROR' ? `1px solid ${getStatusColor(intent.status)}40` : 'none'
                        }}>
                          {intent.status} {intent.status?.toString().toUpperCase().trim() === 'ERROR' && '🔍'}
                        </span>
                      </td>
                        <td style={{ padding: "0.75rem", fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>
                          {new Date(intent.executed_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ color: "hsl(var(--muted-foreground))", textAlign: "center", marginTop: "4rem" }}>
                No recent activity to display.
              </div>
            )}
          </div>
        </>
      )}
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
            zIndex: 9999,
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
