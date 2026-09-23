"use client";

import {
  dashboardService,
} from "@/composition";

import React, { useEffect, useState, useRef } from "react";
import styles from "./dashboard.module.css";
import {
  IntentErrorDetails,
  IntentStatusBadge,
  IntentSourceBadge,
  type Intent,
} from "@/features/intents";

import type {
  DashboardStats,
} from "@/features/dashboard";
import { getErrorMessage } from "@/utils/errors";
import { formatGuayaquilDateTime } from "@/shared/format/date";
import { Button, Card, CardGridSkeleton, ErrorState, Modal, PageHeader, Table, TablePanel, TableSkeleton } from "@/shared/components";
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

  return (
    <div>
      <PageHeader title="Dashboard Overview" description="Monitor your system’s performance and activity." />

      {loading ? (
        <>
          <CardGridSkeleton count={4} />
          <TablePanel title="Recent Activity">
            <TableSkeleton columns={6} label="Loading recent activity..." />
          </TablePanel>
        </>
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

          <TablePanel title="Recent Activity">
            {stats && stats.recent_intents.length > 0 ? (
              <Table label="Recent activity">
                  <thead>
                    <tr>
                      <th>Command</th>
                      <th>Board</th>
                      <th>Client</th>
                      <th>Source</th>
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
                        <td><IntentSourceBadge source={intent.source} /></td>
                        <td><IntentStatusBadge intent={intent} onShowError={handleShowError} /></td>
                        <td>
                          {formatGuayaquilDateTime(intent.executed_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </Table>
            ) : (
              <div style={{ textAlign: "center", marginTop: "4rem" }}>No recent activity to display.</div>
            )}
          </TablePanel>
        </>
      )}
      {errorModalOpen && selectedIntent && (
        <Modal open title="Error Details" description={`Intent #${selectedIntent.id} - ${selectedIntent.command_key}`} onClose={handleCloseErrorModal} footer={<Button variant="primary" onClick={handleCloseErrorModal}>Close</Button>}>
          <IntentErrorDetails intent={selectedIntent} />
        </Modal>
      )}
    </div>
  );
}
