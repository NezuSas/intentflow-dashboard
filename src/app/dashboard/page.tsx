"use client";

import {
  dashboardService,
} from "@/composition";

import React, { useEffect, useState, useRef } from "react";
import styles from "./dashboard.module.css";
import type {
  Intent,
} from "@/features/intents";

import type {
  DashboardStats,
} from "@/features/dashboard";
import { getErrorMessage } from "@/utils/errors";

export default function DashboardHomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // Error modal state
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

  useEffect(() => {
    // Prevent multiple calls in React Strict Mode (development)
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const data =
          await dashboardService.getStats();

        setStats(data);
      } catch (err: unknown) {
        setError(
          getErrorMessage(
            err,
            "Failed to load dashboard statistics"
          )
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, []); // Empty dependency array - only fetch on page load

  const statCards = stats ? [
    { 
      label: "Intents (30d)", 
      value: stats.total_intents_30d.toLocaleString(), 
      change: "Last 30 days", 
      icon: "⚡",
      tone: "primary"
    },
    { 
      label: "Active Clients", 
      value: stats.total_clients.toLocaleString(), 
      change: "Total active", 
      icon: "🏢",
      tone: "success"
    },
    { 
      label: "Active Boards", 
      value: stats.active_boards.toLocaleString(), 
      change: "Connected", 
      icon: "📱",
      tone: "accent"
    },
    { 
      label: "Total Users", 
      value: stats.total_users.toLocaleString(), 
      change: "Active users", 
      icon: "👥",
      tone: "info"
    },
  ] : [];

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'success': return 'status-chip--success';
      case 'error':
      case 'failed': return 'status-chip--error';
      default: return 'status-chip--neutral';
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 700 }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Monitor your system’s performance and activity.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "4rem", textAlign: "center", color: "hsl(var(--muted-foreground))" }}>
          Loading dashboard...
        </div>
      ) : error ? (
        <div style={{ padding: "4rem", textAlign: "center", color: "hsl(var(--error))" }}>
          Error: {error}
        </div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            {statCards.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <div className={styles.statCardHeader}>
                  <span className={styles.statIcon}>{stat.icon}</span>
                  <span className={`${styles.statMeta} ${styles[`statMeta${stat.tone}`]}`}>
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
              <div className="nezu-table-container">
                <table className="nezu-table">
                  <thead className="nezu-table__header">
                    <tr>
                      <th>Command</th>
                      <th>Board</th>
                      <th>Client</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_intents.map((intent) => (
                      <tr key={intent.id} className="nezu-table__row">
                        <td className="nezu-table__cell nezu-table__emphasis">{intent.command_key}</td>
                        <td className="nezu-table__cell">
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{intent.board?.name || "Unknown"}</span>
                            <span className="nezu-table__meta">{intent.board?.adb_identifier}</span>
                          </div>
                        </td>
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
                          {intent.status} {intent.status?.toString().toUpperCase().trim() === 'ERROR' && '🔍'}
                        </span>
                      </td>
                        <td className="nezu-table__cell nezu-table__cell--muted">
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

              <div className="nezu-modal__section">
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

      <style jsx>{`
        .hover-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </div>
  );
}
