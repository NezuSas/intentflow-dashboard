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
import { Button, Card, ErrorState, LoadingState, Modal, PageHeader, StatusBadge, Table } from "@/shared/components";
import { CloudServerOutlined, FileTextOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";

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
      icon: <FileTextOutlined />,
      tone: "primary"
    },
    { 
      label: "Active Clients", 
      value: stats.total_clients.toLocaleString(), 
      change: "Total active", 
      icon: <TeamOutlined />,
      tone: "success"
    },
    { 
      label: "Active Boards", 
      value: stats.active_boards.toLocaleString(), 
      change: "Connected", 
      icon: <CloudServerOutlined />,
      tone: "accent"
    },
    { 
      label: "Total Users", 
      value: stats.total_users.toLocaleString(), 
      change: "Active users", 
      icon: <UserOutlined />,
      tone: "info"
    },
  ] : [];

  const getStatusVariant = (status: string): "success" | "error" | "neutral" => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'success': return 'success';
      case 'error':
      case 'failed': return 'error';
      default: return 'neutral';
    }
  };

  return (
    <div>
      <PageHeader title="Dashboard Overview" description="Monitor your system’s performance and activity." />

      {loading ? (
        <LoadingState label="Loading dashboard..." />
      ) : error ? (
        <ErrorState message={`Error: ${error}`} />
      ) : (
        <>
          <div className={styles.statsGrid}>
            {statCards.map((stat) => (
              <Card key={stat.label} className={styles.statCard}>
                <div className={styles.statCardHeader}>
                  <span className={styles.statIcon}>{stat.icon}</span>
                  <span className={`${styles.statMeta} ${styles[`statMeta${stat.tone}`]}`}>
                    {stat.change}
                  </span>
                </div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </Card>
            ))}
          </div>

          <Card>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>
              Recent Activity
            </h2>
            
            {stats && stats.recent_intents.length > 0 ? (
              <Table label="Recent activity">
                  <thead>
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
                      <tr key={intent.id}>
                        <td>{intent.command_key}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{intent.board?.name || "Unknown"}</span>
                            <small>{intent.board?.adb_identifier}</small>
                          </div>
                        </td>
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
                          {intent.status} {intent.status?.toString().toUpperCase().trim() === 'ERROR' && '🔍'}
                        </StatusBadge>
                      </td>
                        <td>
                          {new Date(intent.executed_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </Table>
            ) : (
              <div style={{ textAlign: "center", marginTop: "4rem" }}>No recent activity to display.</div>
            )}
          </Card>
        </>
      )}
      {errorModalOpen && selectedIntent && (
        <Modal open title="Error Details" description={`Intent #${selectedIntent.id} - ${selectedIntent.command_key}`} onClose={handleCloseErrorModal} footer={<Button variant="primary" onClick={handleCloseErrorModal}>Close</Button>}>
          <div>
            <h3>Board</h3>
            <p>{selectedIntent.board?.name} ({selectedIntent.board?.adb_identifier})</p>
            <h3>Command</h3>
            <code>{selectedIntent.resolved_command}</code>
            <h3>Error Output</h3>
            <pre>{selectedIntent.output || "No error output available"}</pre>
            <h3>Executed At</h3>
            <p>{new Date(selectedIntent.executed_at).toLocaleString()}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
