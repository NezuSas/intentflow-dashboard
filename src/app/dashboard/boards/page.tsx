"use client";

import React, { useEffect, useState } from "react";
import styles from "../users/users.module.css";
import { boardService } from "@/services/boardService";

import { clientService } from "@/services/clientService";
import { versionService } from "@/services/versionService";

export default function BoardsPage() {
  const [boards, setBoards] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    adb_identifier: "",
    client: "",
    version: "",
    is_online: true
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [boardData, clientData, versionData] = await Promise.all([
        boardService.getBoards(),
        clientService.getClients(),
        versionService.getVersions()
      ]);
      setBoards(boardData);
      setClients(clientData);
      setVersions(versionData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoards = async () => {
    try {
      const data = await boardService.getBoards();
      setBoards(data);
    } catch (err: any) {
      console.error("Error refreshing boards:", err);
    }
  };

  const handleOpenModal = (board: any = null) => {
    if (board) {
      setEditingBoard(board);
      setFormData({
        name: board.name,
        adb_identifier: board.adb_identifier,
        client: board.client || "",
        version: board.version || "",
        is_online: board.is_online
      });
    } else {
      setEditingBoard(null);
      setFormData({
        name: "",
        adb_identifier: "",
        client: clients.length > 0 ? clients[0].id : "",
        version: versions.length > 0 ? versions[0].id : "",
        is_online: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        client_id: formData.client,
        version_id: formData.version
      };
      
      if (editingBoard) {
        await boardService.updateBoard(editingBoard.id, payload);
      } else {
        await boardService.createBoard(payload);
      }
      setIsModalOpen(false);
      fetchBoards();
    } catch (err: any) {
      alert(`Error saving board: ${err.message}`);
    }
  };

  const handleDelete = async (boardId: number) => {
    if (!confirm("Are you sure you want to delete this board?")) return;
    try {
      await boardService.deleteBoard(boardId);
      setBoards(boards.filter(b => b.id !== boardId));
    } catch (err: any) {
      alert(`Error deleting board: ${err.message}`);
    }
  };

  if (loading && boards.length === 0) {
    return <div className={styles.container}>Loading boards...</div>;
  }

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className={styles.title} style={{ marginBottom: 0 }}>Board Management</h1>
        <button className={styles.primaryButton} onClick={() => handleOpenModal(null)}>+ Register Board</button>
      </div>

      {error && <div className="error-card" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>ADB Identifier</th>
              <th>Client</th>
              <th>Version</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {boards.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>No boards found.</td></tr>
            ) : (
              boards.map((board) => (
                <tr key={board.id}>
                  <td>{board.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{board.name}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', opacity: 0.8 }}>{board.adb_identifier}</td>
                  <td>{board.client_detail?.name || "---"}</td>
                  <td>{board.version_detail?.code || "---"}</td>
                  <td>
                    <span className={`${styles.badge} ${board.computed_status === 'online' ? styles.badgeActive : styles.badgeInactive}`}>
                      {board.computed_status === 'online' ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className={styles.actionButton} onClick={() => handleOpenModal(board)}>✎</button>
                      <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDelete(board.id)}>🗑</button>
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
              <h2 className={styles.modalTitle} style={{ marginBottom: '0.5rem' }}>{editingBoard ? "Edit Board" : "Register New Board"}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {editingBoard ? "Update hardware identifier, client assignment and version." : "Register a new hardware board to represent a device."}
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className={styles.formGroup}>
                  <label>Display Name</label>
                  <input 
                    className={styles.input} 
                    value={formData.name}
                    placeholder="e.g. Master Board 01"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>ADB Identifier (IP:Port)</label>
                  <input 
                    className={styles.input} 
                    value={formData.adb_identifier}
                    placeholder="e.g. 192.168.1.100:5555"
                    onChange={(e) => setFormData({...formData, adb_identifier: e.target.value})}
                    required
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className={styles.formGroup}>
                  <label>Assign to Client</label>
                  <select 
                    className={styles.input}
                    value={formData.client}
                    onChange={(e) => setFormData({...formData, client: e.target.value})}
                    required
                  >
                    <option value="">Select a client...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Firmware / ADB Version</label>
                  <select 
                    className={styles.input}
                    value={formData.version}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                    required
                  >
                    <option value="">Select a version...</option>
                    {versions.map(v => (
                      <option key={v.id} value={v.id}>{v.version_string}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Manual Status Override</label>
                <select 
                  className={styles.input}
                  value={formData.is_online ? "true" : "false"}
                  onChange={(e) => setFormData({...formData, is_online: e.target.value === "true"})}
                >
                  <option value="true">Force Online</option>
                  <option value="false">Force Offline</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryButton}>Save Board</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
