"use client";

import React, { useEffect, useState } from "react";
import styles from "../users/users.module.css";
import { subscriptionService, SubscriptionPlan, ClientSubscription } from "@/services/subscriptionService";
import { clientService } from "@/services/clientService";

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [clientSubs, setClientSubs] = useState<ClientSubscription[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [activeModal, setActiveModal] = useState<'PLAN' | 'SUBSCRIPTION' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    price: 0,
    max_boards: 20,
    plan_type: "FREE",
    is_active: true
  });

  const [subForm, setSubForm] = useState({
    client: "",
    subscription_plan: "",
    is_active: true,
    payment_status: "PAID",
    end_date: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansData, subsData, clientsData] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getClientSubscriptions(),
        clientService.getClients()
      ]);
      setPlans(plansData);
      setClientSubs(subsData);
      setClients(clientsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPlanModal = (plan: SubscriptionPlan | null = null) => {
    if (plan) {
      setEditingItem(plan);
      setPlanForm({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        max_boards: plan.max_boards || 20,
        plan_type: plan.plan_type,
        is_active: plan.is_active
      });
    } else {
      setEditingItem(null);
      setPlanForm({
        name: "",
        description: "",
        price: 0,
        max_boards: 20,
        plan_type: "FREE",
        is_active: true
      });
    }
    setActiveModal('PLAN');
  };

  const handleOpenSubModal = (sub: ClientSubscription | null = null) => {
    if (sub) {
      setEditingItem(sub);
      // We use the nested detail objects for IDs if available, or fall back to raw ID if the serializer provides it (it usually provides both)
      // The serializer has client (ID) and client_detail (Object)
      // We need to cast carefully or just use the IDs if they are present in the top level (ClientSubscriptionSerializer has client=PrimaryKey)
      setSubForm({
        client: (sub as any).client || sub.client_detail?.id || "",
        subscription_plan: (sub as any).subscription_plan || sub.subscription_plan_detail?.id || "",
        is_active: sub.status === 'ACTIVE',
        payment_status: (sub as any).payment_status || "PAID",
        end_date: sub.end_date || ""
      });
    } else {
      setEditingItem(null);
      setSubForm({
        client: "",
        subscription_plan: "",
        is_active: true,
        payment_status: "PAID",
        end_date: ""
      });
    }
    setActiveModal('SUBSCRIPTION');
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await subscriptionService.updatePlan(editingItem.id, planForm);
      } else {
        await subscriptionService.createPlan(planForm);
      }
      setActiveModal(null);
      fetchData();
    } catch (err: any) {
      alert(`Error saving plan: ${err.message}`);
    }
  };

  const handleSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...subForm,
        client: parseInt(subForm.client),
        subscription_plan: parseInt(subForm.subscription_plan),
        end_date: subForm.end_date || null
      };
      if (editingItem) {
        await subscriptionService.updateClientSubscription(editingItem.id, payload);
      } else {
        await subscriptionService.createClientSubscription(payload);
      }
      setActiveModal(null);
      fetchData();
    } catch (err: any) {
      alert(`Error saving subscription: ${err.message}`);
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm("Delete this plan?")) return;
    try {
      await subscriptionService.deletePlan(id);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteSub = async (id: number) => {
    if (!confirm("Cancel/Delete this subscription?")) return;
    try {
      await subscriptionService.deleteClientSubscription(id);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading && plans.length === 0) {
    return <div className={styles.container}>Loading subscriptions...</div>;
  }

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className={styles.title} style={{ marginBottom: 0 }}>Subscription Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className={styles.secondaryButton} onClick={() => handleOpenPlanModal()}>+ New Plan</button>
          <button className={styles.primaryButton} onClick={() => handleOpenSubModal()}>+ New Subscription</button>
        </div>
      </div>

      {error && <div className="error-card" style={{ marginBottom: '1rem' }}>{error}</div>}

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>Available Plans</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Price</th>
                <th>Max Boards</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>No plans found.</td></tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id}>
                    <td style={{ fontWeight: 600 }}>{plan.name}</td>
                    <td>{plan.plan_type}</td>
                    <td>${plan.price}</td>
                    <td>{plan.max_boards}</td>
                    <td>
                      <span className={`${styles.badge} ${plan.is_active ? styles.badgeActive : styles.badgeInactive}`}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className={styles.actionButton} onClick={() => handleOpenPlanModal(plan)}>✎</button>
                        <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDeletePlan(plan.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>Client Subscriptions</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Plan</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clientSubs.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>No client subscriptions found.</td></tr>
              ) : (
                clientSubs.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{sub.client_detail?.name || "Unknown"}</td>
                    <td>{sub.subscription_plan_detail?.name || "Unknown"}</td>
                    <td>{new Date(sub.start_date).toLocaleDateString()}</td>
                    <td>{sub.end_date ? new Date(sub.end_date).toLocaleDateString() : "Permanent"}</td>
                    <td>
                      <span className={`${styles.badge} ${sub.status === 'ACTIVE' ? styles.badgeActive : styles.badgeInactive}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className={styles.actionButton} onClick={() => handleOpenSubModal(sub)}>✎</button>
                        <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDeleteSub(sub.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* PLAN MODAL */}
      {activeModal === 'PLAN' && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div style={{ marginBottom: '1rem' }}>
              <h2 className={styles.modalTitle} style={{ marginBottom: '0.5rem' }}>{editingItem ? "Edit Subscription Plan" : "Create New Plan"}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {editingItem ? "Update pricing, board limits, and access tier details." : "Define a new service tier for your customers."}
              </p>
            </div>
            
            <form onSubmit={handlePlanSubmit}>
              <div className={styles.formGroup}>
                <label>Plan Name</label>
                <input className={styles.input} value={planForm.name} placeholder="e.g. Pro Monthly" onChange={e => setPlanForm({...planForm, name: e.target.value})} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className={styles.formGroup}>
                  <label>Service Tier</label>
                  <select className={styles.input} value={planForm.plan_type} onChange={e => setPlanForm({...planForm, plan_type: e.target.value})}>
                    <option value="FREE">FREE</option>
                    <option value="BASIC">BASIC</option>
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="ENTERPRISE">ENTERPRISE</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Price (USD)</label>
                  <input className={styles.input} type="number" step="0.01" value={planForm.price} onChange={e => setPlanForm({...planForm, price: parseFloat(e.target.value)})} required />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Max Hardware Boards</label>
                <input className={styles.input} type="number" value={planForm.max_boards} onChange={e => setPlanForm({...planForm, max_boards: parseInt(e.target.value)})} required />
              </div>
              <div className={styles.formGroup}>
                <label>Public Description</label>
                <textarea className={styles.input} style={{ minHeight: '100px' }} value={planForm.description} placeholder="Features included in this plan..." onChange={e => setPlanForm({...planForm, description: e.target.value})} />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryButton} onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className={styles.primaryButton}>Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBSCRIPTION MODAL */}
      {activeModal === 'SUBSCRIPTION' && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div style={{ marginBottom: '1rem' }}>
              <h2 className={styles.modalTitle} style={{ marginBottom: '0.5rem' }}>{editingItem ? "Update Subscription" : "Assign Plan to Client"}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {editingItem ? "Modify an existing client's access level and payment status." : "Grant a specific client access to a subscription plan."}
              </p>
            </div>
            
            <form onSubmit={handleSubSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className={styles.formGroup}>
                  <label>Select Client</label>
                  <select className={styles.input} value={subForm.client} onChange={e => setSubForm({...subForm, client: e.target.value})} required>
                    <option value="">Choose...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Target Plan</label>
                  <select className={styles.input} value={subForm.subscription_plan} onChange={e => setSubForm({...subForm, subscription_plan: e.target.value})} required>
                    <option value="">Choose...</option>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className={styles.formGroup}>
                  <label>System Status</label>
                  <select className={styles.input} value={subForm.is_active ? "true" : "false"} onChange={e => setSubForm({...subForm, is_active: e.target.value === "true"})}>
                    <option value="true">ACTIVE</option>
                    <option value="false">INACTIVE / EXPIRED</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Payment Status</label>
                  <select className={styles.input} value={subForm.payment_status} onChange={e => setSubForm({...subForm, payment_status: e.target.value})}>
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FREE">FREE / GIFTED</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryButton} onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className={styles.primaryButton}>Save Subscription</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
