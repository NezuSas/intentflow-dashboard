"use client";

import { dashboardService } from "@/composition";
import React, { useCallback, useState } from "react";
import styles from "./dashboard.module.css";
import { IntentErrorDetails, IntentStatusBadge, IntentSourceBadge, type Intent } from "@/features/intents";
import type { DashboardStats } from "@/features/dashboard";
import { formatGuayaquilDateTime } from "@/shared/format/date";
import { useQuery } from "@/shared/hooks/useQuery";
import { Button, CardGridSkeleton, ErrorState, Modal, PageHeader, Table, TablePanel, TableSkeleton } from "@/shared/components";

const statsOf = (stats: DashboardStats) => [
  { label: "Intents", value: stats.total_intents_30d, caption: "Last 30 days" },
  { label: "Clients", value: stats.total_clients, caption: "Active" },
  { label: "Boards", value: stats.active_boards, caption: "Connected", live: true },
  { label: "Users", value: stats.total_users, caption: "With access" },
];

export default function DashboardHomePage() {
  const statsQuery = useQuery(useCallback((): Promise<DashboardStats> => dashboardService.getStats(), []));
  const { data: stats, loading, error } = statsQuery;
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);

  return (
    <div>
      <PageHeader
        title="Overview"
        description="What the fleet did in the last 30 days and the latest intents."
        actions={<Button onClick={() => statsQuery.reload()} loading={loading && stats !== null}>Refresh</Button>}
      />

      {loading && !stats ? (
        <>
          <CardGridSkeleton count={4} />
          <TablePanel title="Recent activity">
            <TableSkeleton columns={6} label="Loading recent activity..." />
          </TablePanel>
        </>
      ) : error && !stats ? (
        <ErrorState message={`Error: ${error}`} />
      ) : stats ? (
        <>
          <section className={styles.statsStrip} aria-label="Fleet summary">
            {statsOf(stats).map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statValue}>{stat.value.toLocaleString()}</span>
                <span className={`${styles.statCaption} ${stat.live ? styles.statCaptionLive : ""}`}>{stat.caption}</span>
              </div>
            ))}
          </section>

          <TablePanel title="Recent Activity" refreshing={loading}>
            {stats.recent_intents.length > 0 ? (
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
                        <div className={styles.board}>
                          <span>{intent.board?.name || "Unknown"}</span>
                          <span className={styles.boardAddress}>{intent.board?.adb_identifier}</span>
                        </div>
                      </td>
                      <td>{intent.board?.client_detail?.name || "Unknown"}</td>
                      <td><IntentSourceBadge source={intent.source} /></td>
                      <td><IntentStatusBadge intent={intent} onShowError={setSelectedIntent} /></td>
                      <td className={styles.timeCell}>{formatGuayaquilDateTime(intent.executed_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>No recent activity to display.</div>
            )}
          </TablePanel>
        </>
      ) : null}

      {selectedIntent && (
        <Modal
          open
          title="Error details"
          description={`Intent #${selectedIntent.id} · ${selectedIntent.command_key}`}
          onClose={() => setSelectedIntent(null)}
          footer={<Button variant="primary" onClick={() => setSelectedIntent(null)}>Close</Button>}
        >
          <IntentErrorDetails intent={selectedIntent} />
        </Modal>
      )}
    </div>
  );
}
