"use client";

import React, { useEffect, useState } from "react";
import styles from "../users/users.module.css";
import { commandService } from "@/services/commandService";

export default function CommandsPage() {
  const [commands, setCommands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<any>(null);
  const [formData, setFormData] = useState({
    key: "",
    command: "",
    description: "",
    is_active: true
  });

  useEffect(() => {
    fetchCommands();
  }, []);

  const fetchCommands = async () => {
    try {
      setLoading(true);
      const data = await commandService.getCommands();
      setCommands(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (command: any = null) => {
    if (command) {
      setEditingCommand(command);
      setFormData({
        key: command.key,
        command: command.command,
        description: command.description || "",
        is_active: command.is_active
      });
    } else {
      setEditingCommand(null);
      setFormData({
        key: "",
        command: "",
        description: "",
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCommand) {
        await commandService.updateCommand(editingCommand.id, formData);
      } else {
        await commandService.createCommand(formData);
      }
      setIsModalOpen(false);
      fetchCommands();
    } catch (err: any) {
      alert(`Error saving command: ${err.message}`);
    }
  };

  const handleDelete = async (commandId: number) => {
    if (!confirm("Are you sure you want to delete this command?")) return;
    try {
      await commandService.deleteCommand(commandId);
      setCommands(commands.filter(c => c.id !== commandId));
    } catch (err: any) {
      alert(`Error deleting command: ${err.message}`);
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
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>{command.key}</td>
                  <td>{command.display_name || '---'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {command.description || '---'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {command.subscription_plans_detail && command.subscription_plans_detail.length > 0 ? (
                        command.subscription_plans_detail.map((plan: any) => (
                          <span 
                            key={plan.id}
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '1rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: `linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.2))`,
                              border: '1px solid hsl(var(--primary) / 0.3)',
                              color: 'hsl(var(--primary))',
                              whiteSpace: 'nowrap'
                            }}
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
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryButton}>Save Command</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
