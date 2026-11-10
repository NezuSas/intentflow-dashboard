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
  { label: "Intenciones", value: stats.total_intents_30d, caption: "Últimos 30 días" },
  { label: "Clientes", value: stats.total_clients, caption: "Activos" },
  { label: "Placas", value: stats.active_boards, caption: "Conectadas", live: true },
  { label: "Usuarios", value: stats.total_users, caption: "Con acceso" },
];

export default function DashboardHomePage() {
  const statsQuery = useQuery(useCallback((): Promise<DashboardStats> => dashboardService.getStats(), []));
  const { data: stats, loading, error } = statsQuery;
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);

  return (
    <div>
      <PageHeader
        title="Resumen"
        description="Lo que hizo la flota en los últimos 30 días y las intenciones más recientes."
        actions={<Button onClick={() => statsQuery.reload()} loading={loading && stats !== null}>Actualizar</Button>}
      />

      {loading && !stats ? (
        <>
          <CardGridSkeleton count={4} />
          <TablePanel title="Actividad reciente">
            <TableSkeleton columns={6} label="Cargando actividad reciente..." />
          </TablePanel>
        </>
      ) : error && !stats ? (
        <ErrorState message={`Error: ${error}`} />
      ) : stats ? (
        <>
          <section className={styles.statsStrip} aria-label="Resumen de la flota">
            {statsOf(stats).map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statValue}>{stat.value.toLocaleString()}</span>
                <span className={`${styles.statCaption} ${stat.live ? styles.statCaptionLive : ""}`}>{stat.caption}</span>
              </div>
            ))}
          </section>

          <TablePanel title="Actividad reciente" refreshing={loading}>
            {stats.recent_intents.length > 0 ? (
              <Table label="Actividad reciente">
                <thead>
                  <tr>
                    <th>Comando</th>
                    <th>Placa</th>
                    <th>Cliente</th>
                    <th>Origen</th>
                    <th>Estado</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_intents.map((intent) => (
                    <tr key={intent.id}>
                      <td>{intent.command_key}</td>
                      <td>
                        <div className={styles.board}>
                          <span>{intent.board?.name || "Desconocido"}</span>
                          <span className={styles.boardAddress}>{intent.board?.adb_identifier}</span>
                        </div>
                      </td>
                      <td>{intent.board?.client_detail?.name || "Desconocido"}</td>
                      <td><IntentSourceBadge source={intent.source} /></td>
                      <td><IntentStatusBadge intent={intent} onShowError={setSelectedIntent} /></td>
                      <td className={styles.timeCell}>{formatGuayaquilDateTime(intent.executed_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>Todavía no hay actividad reciente.</div>
            )}
          </TablePanel>
        </>
      ) : null}

      {selectedIntent && (
        <Modal
          open
          title="Detalle del error"
          description={`Intención ${selectedIntent.id} · ${selectedIntent.command_key}`}
          onClose={() => setSelectedIntent(null)}
          footer={<Button variant="primary" onClick={() => setSelectedIntent(null)}>Cerrar</Button>}
        >
          <IntentErrorDetails intent={selectedIntent} />
        </Modal>
      )}
    </div>
  );
}
