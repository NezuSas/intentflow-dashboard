"use client";

import React, { useEffect, useState } from "react";
import styles from "../users/users.module.css";
import { clientService } from "@/services/clientService";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    client_type: "NEZU",
    subscription_level: "FREE",
    id_number: "",
    email: "",
    contact_number: ""
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getClients();
      setClients(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (client: any = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        client_type: client.client_type,
        subscription_level: client.subscription_level,
        id_number: client.id_number || "",
        email: client.email || "",
        contact_number: client.contact_number || ""
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: "",
        client_type: "NEZU",
        subscription_level: "FREE",
        id_number: "",
        email: "",
        contact_number: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await clientService.updateClient(editingClient.id, formData);
      } else {
        await clientService.createClient(formData);
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (err: any) {
      alert(`Error saving client: ${err.message}`);
    }
  };

  const handleDelete = async (clientId: number) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await clientService.deleteClient(clientId);
      setClients(clients.filter(c => c.id !== clientId));
    } catch (err: any) {
      alert(`Error deleting client: ${err.message}`);
    }
  };

  if (loading && clients.length === 0) {
    return <div className={styles.container}>Loading clients...</div>;
  }

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className={styles.title} style={{ marginBottom: 0 }}>Client Management</h1>
        <button className={styles.primaryButton} onClick={() => handleOpenModal(null)}>+ New Client</button>
      </div>

      {error && <div className="error-card" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Subscription</th>
              <th>ID Number</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>No clients found.</td></tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{client.name}</td>
                  <td>{client.type || '---'}</td>
                  <td>
                    <span className={`${styles.badge} ${client.subscription_level === 'FREE' ? styles.badgeInactive : styles.badgeActive}`}>
                      {client.subscription_level}
                    </span>
                  </td>
                  <td>{client.identification_number || "---"}</td>
                  <td>{client.email || "---"}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className={styles.actionButton} onClick={() => handleOpenModal(client)}>✎</button>
                      <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDelete(client.id)}>🗑</button>
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
              <h2 className={styles.modalTitle} style={{ marginBottom: '0.5rem' }}>{editingClient ? "Edit Client" : "Create New Client"}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {editingClient ? "Update client profile details and subscription levels." : "Register a new client entity in the system."}
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Client Name</label>
                <input 
                  className={styles.input} 
                  value={formData.name}
                  placeholder="e.g. Nezu Corp"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className={styles.formGroup}>
                  <label>Business Type</label>
                  <select 
                    className={styles.input}
                    value={formData.client_type}
                    onChange={(e) => setFormData({...formData, client_type: e.target.value})}
                  >
                    <option value="NEZU">NEZU</option>
                    <option value="CIAL">CIAL</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Subscription</label>
                  <select 
                    className={styles.input}
                    value={formData.subscription_level}
                    onChange={(e) => setFormData({...formData, subscription_level: e.target.value})}
                  >
                    <option value="FREE">FREE</option>
                    <option value="BASIC">BASIC</option>
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="ENTERPRISE">ENTERPRISE</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className={styles.formGroup}>
                  <label>ID / TAX Number</label>
                  <input 
                    className={styles.input} 
                    value={formData.id_number}
                    placeholder="e.g. 1234567-8"
                    onChange={(e) => setFormData({...formData, id_number: e.target.value})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Contact Email</label>
                  <input 
                    className={styles.input} 
                    type="email"
                    value={formData.email}
                    placeholder="billing@client.com"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryButton}>Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
