"use client";

import {
  commandService,
  subscriptionService,
  versionService,
} from "@/composition";

import React, { useEffect, useState } from "react";
import styles from "../users/users.module.css";
import type {
  ADBCommand,
} from "@/features/commands";
import type {
  SubscriptionPlan,
} from "@/features/subscriptions";
import type {
  ADBVersion,
} from "@/features/versions";
import { getErrorMessage } from "@/utils/errors";
import type { PageMeta } from "@/core/Pagination";

const PAGE_SIZE = 20;

export default function CommandsPage() {
  const [commands, setCommands] = useState<ADBCommand[]>([]);
  const [versions, setVersions] = useState<ADBVersion[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<ADBCommand | null>(null);
  const [formData, setFormData] = useState({
    key: "",
    command: "",
    description: "",
    versions: [] as number[],
    subscription_plans: [] as number[],
    is_active: true
  });

  useEffect(() => {
    void fetchData();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      setLoading(true);
      const [commandsData, versionsData, plansData] =
        await Promise.all([
          commandService.listCommands({ page, pageSize: PAGE_SIZE }),
          versionService.getVersions(),
          subscriptionService.getPlanCatalog(),
        ]);
      setCommands(commandsData.data);
      setMeta(commandsData.meta);
      setVersions(versionsData);
      setPlans(plansData as SubscriptionPlan[]);
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchCommands = async () => {
    try {
      setLoading(true);
      const response = await commandService.listCommands({ page, pageSize: PAGE_SIZE });
      setCommands(response.data);
      setMeta(response.meta);
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (command: ADBCommand | null = null) => {
    if (command) {
      setEditingCommand(command);
      setFormData({
        key: command.key,
        command: command.command,
        description: command.description || "",
        versions: command.versions ?? [],
        subscription_plans: command.subscription_plans ?? [],
        is_active: command.is_active
      });
    } else {
      setEditingCommand(null);
      setFormData({
        key: "",
        command: "",
        description: "",
        versions: [],
        subscription_plans: [],
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (formData.versions.length === 0) {
      alert(
        "Select at least one ADB version."
      );
      return;
    }

    if (
      formData.subscription_plans.length === 0
    ) {
      alert(
        "Select at least one subscription plan."
      );
      return;
    }

    setSubmitting(true);
    try {
      if (editingCommand) {
        await commandService.updateCommand(editingCommand.id, formData);
      } else {
        await commandService.createCommand(formData);
      }
      setIsModalOpen(false);
      await fetchCommands();
    } catch (err: unknown) {
      alert(
        `Error saving command: ${getErrorMessage(err)}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commandId: number) => {
    if (!confirm("Are you sure you want to delete this command?")) return;
    try {
      await commandService.deleteCommand(commandId);
      setCommands(commands.filter(c => c.id !== commandId));
    } catch (err: unknown) {
      alert(
        `Error deleting command: ${getErrorMessage(err)}`
      );
    }
  };

  if (loading && commands.length === 0) {
    return <div className={styles.container}>Loading commands...</div>;
  }

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className={styles.title} style={{ marginBottom: 0 }}>ADB Command Management</h1>
        <button className={styles.primaryButton} onClick={() => handleOpenModal(null)}>+ New Command</button>
      </div>

      {error && <div className="error-card" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Key</th>
              <th>Display Name</th>
              <th>Description</th>
              <th>Plans</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {commands.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>No commands found.</td></tr>
            ) : (
              commands.map((command) => (
                <tr key={command.id}>
                  <td>{command.id}</td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'hsl(var(--primary))' }}>{command.key}</td>
                  <td>{command.display_name || '---'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {command.description || '---'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {command.subscription_plans_detail && command.subscription_plans_detail.length > 0 ? (
                        command.subscription_plans_detail.map((plan) => (
                          <span
                            key={plan.id}
                            className="status-chip status-chip--neutral"
                          >
                            {plan.name}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>All Plans</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${command.is_active ? styles.badgeActive : styles.badgeInactive}`}>
                      {command.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className={styles.actionButton} onClick={() => handleOpenModal(command)}>✎</button>
                      <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDelete(command.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && <div className="table-pagination"><span>{meta.count} total · Page {meta.page} of {Math.max(1, Math.ceil(meta.count / meta.pageSize))}</span><div><button className={styles.secondaryButton} disabled={!meta.previous} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button><button className={styles.secondaryButton} disabled={!meta.next} onClick={() => setPage((current) => current + 1)}>Next</button></div></div>}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div style={{ marginBottom: '1rem' }}>
              <h2 className={styles.modalTitle} style={{ marginBottom: '0.5rem' }}>{editingCommand ? "Edit Command" : "New ADB Command"}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {editingCommand ? "Modify this command's execution string and accessibility." : "Define a new command to be executed on the boards."}
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Command Key (Identifier)</label>
                <input 
                  className={styles.input} 
                  value={formData.key}
                  placeholder="e.g. SCREEN_OFF"
                  onChange={(e) => setFormData({...formData, key: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>ADB Command String</label>
                <input 
                  className={styles.input} 
                  value={formData.command}
                  placeholder="e.g. input keyevent 26"
                  onChange={(e) => setFormData({...formData, command: e.target.value})}
                  required
                  style={{ fontFamily: 'monospace', fontSize: '1rem' }}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea 
                  className={styles.input} 
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Available Versions</label>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {versions.length === 0 ? (
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                      No versions available.
                    </span>
                  ) : (
                    versions.map((version) => (
                      <label
                        key={version.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          color: "var(--text)",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.versions.includes(version.id)}
                          onChange={(event) => {
                            const isChecked = event.target.checked;
                            setFormData((current) => ({
                              ...current,
                              versions: isChecked
                                ? [...current.versions, version.id]
                                : current.versions.filter((id) => id !== version.id),
                            }));
                          }}
                        />
                        {version.code}
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Subscription Plans</label>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {plans.length === 0 ? (
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                      No subscription plans available.
                    </span>
                  ) : (
                    plans.map((plan) => (
                      <label
                        key={plan.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          color: "var(--text)",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.subscription_plans.includes(plan.id)}
                          onChange={(event) => {
                            const isChecked = event.target.checked;
                            setFormData((current) => ({
                              ...current,
                              subscription_plans: isChecked
                                ? [...current.subscription_plans, plan.id]
                                : current.subscription_plans.filter((id) => id !== plan.id),
                            }));
                          }}
                        />
                        {plan.name}
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryButton} disabled={submitting}>{submitting ? "Saving..." : "Save Command"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
