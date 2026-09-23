"use client";

import {
  clientService,
  subscriptionService,
} from "@/composition";

import React, { useEffect, useState } from "react";
import type {
  SubscriptionPlan,
  ClientSubscription,
} from "@/features/subscriptions";
import type {
  Client,
} from "@/features/clients";
import { getErrorMessage } from "@/utils/errors";
import type { PageMeta } from "@/core/Pagination";
import { ActionGroup, Button, ErrorState, FormField, Input, LoadingState, Modal, Page, PageHeader, Pagination, Select, StatusBadge, Table, TableEmpty, Textarea } from "@/shared/components";

const PAGE_SIZE = 20;

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [planCatalog, setPlanCatalog] = useState<SubscriptionPlan[]>([]);
  const [clientSubs, setClientSubs] = useState<ClientSubscription[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [plansPage, setPlansPage] = useState(1);
  const [subscriptionsPage, setSubscriptionsPage] = useState(1);
  const [plansMeta, setPlansMeta] = useState<PageMeta | null>(null);
  const [subscriptionsMeta, setSubscriptionsMeta] = useState<PageMeta | null>(null);
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const [isSubmittingSubscription, setIsSubmittingSubscription] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [activeModal, setActiveModal] = useState<'PLAN' | 'SUBSCRIPTION' | null>(null);
  const [editingItem, setEditingItem] = useState<SubscriptionPlan | ClientSubscription | null>(null);
  
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
    void fetchData();
  }, [plansPage, subscriptionsPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansData, subsData, clientsData, planCatalogData] = await Promise.all([
        subscriptionService.listPlans({ page: plansPage, pageSize: PAGE_SIZE }),
        subscriptionService.listClientSubscriptions({ page: subscriptionsPage, pageSize: PAGE_SIZE }),
        clientService.getClientCatalog(),
        subscriptionService.getPlanCatalog(),
      ]);
      setPlans(plansData.data);
      setPlansMeta(plansData.meta);
      setClientSubs(subsData.data);
      setSubscriptionsMeta(subsData.meta);
      setClients(clientsData as Client[]);
      setPlanCatalog(planCatalogData as SubscriptionPlan[]);
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const refreshPlans = async () => {
    const plansData = await subscriptionService.listPlans({ page: plansPage, pageSize: PAGE_SIZE });
    setPlans(plansData.data);
    setPlansMeta(plansData.meta);
  };

  const refreshClientSubscriptions = async () => {
    const subscriptionsData = await subscriptionService.listClientSubscriptions({ page: subscriptionsPage, pageSize: PAGE_SIZE });
    setClientSubs(subscriptionsData.data);
    setSubscriptionsMeta(subscriptionsData.meta);
  };

  const handleOpenPlanModal = (plan: SubscriptionPlan | null = null) => {
    if (plan) {
      setEditingItem(plan);
      setPlanForm({
        name: plan.name,
        description: plan.description,
        price: Number(plan.price),
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
        client: String(sub.client_detail.id),
        subscription_plan: String(
          sub.subscription_plan_detail.id
        ),
        is_active: sub.is_active,
        payment_status:
          sub.payment_status || "PAID",
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
    if (isSubmittingPlan) return;
    setIsSubmittingPlan(true);
    try {
      if (editingItem) {
        await subscriptionService.updatePlan(editingItem.id, planForm);
      } else {
        await subscriptionService.createPlan(planForm);
      }
      setActiveModal(null);
      await refreshPlans();
    } catch (err: unknown) {
      alert(
        `Error saving plan: ${getErrorMessage(err)}`
      );
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  const handleSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingSubscription) return;
    setIsSubmittingSubscription(true);
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
      await refreshClientSubscriptions();
    } catch (err: unknown) {
      alert(
        `Error saving subscription: ${getErrorMessage(err)}`
      );
    } finally {
      setIsSubmittingSubscription(false);
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm("Delete this plan?")) return;
    try {
      await subscriptionService.deletePlan(id);
      await refreshPlans();
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  const handleDeleteSub = async (id: number) => {
    if (!confirm("Cancel/Delete this subscription?")) return;
    try {
      await subscriptionService.deleteClientSubscription(id);
      await refreshClientSubscriptions();
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  if (loading && plans.length === 0) {
    return <LoadingState label="Loading subscriptions..." />;
  }

  return (
    <Page>
      <PageHeader title="Subscription Management" actions={<div style={{ display: "flex", gap: "1rem" }}>
          <Button onClick={() => handleOpenPlanModal()}>+ New Plan</Button>
          <Button variant="primary" onClick={() => handleOpenSubModal()}>+ New Subscription</Button>
        </div>
      } />

      {error && <ErrorState message={error} />}

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>Available Plans</h2>
        <Table label="Available plans">
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
                <TableEmpty colSpan={6} label="No plans found." />
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id}>
                    <td style={{ fontWeight: 600 }}>{plan.name}</td>
                    <td>{plan.plan_type}</td>
                    <td>${plan.price}</td>
                    <td>{plan.max_boards}</td>
                    <td>
                      <StatusBadge variant={plan.is_active ? "success" : "neutral"}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </StatusBadge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button onClick={() => handleOpenPlanModal(plan)}>✎</Button>
                        <Button variant="danger" onClick={() => handleDeletePlan(plan.id)}>🗑</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
        </Table>
        {plansMeta && <Pagination page={plansMeta.page} totalPages={Math.max(1, Math.ceil(plansMeta.count / plansMeta.pageSize))} totalCount={plansMeta.count} hasPrevious={Boolean(plansMeta.previous)} hasNext={Boolean(plansMeta.next)} onPrevious={() => setPlansPage((page) => Math.max(1, page - 1))} onNext={() => setPlansPage((page) => page + 1)} />}
      </section>

      <section>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>Client Subscriptions</h2>
        <Table label="Client subscriptions">
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
                <TableEmpty colSpan={6} label="No client subscriptions found." />
              ) : (
                clientSubs.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: 600, color: 'hsl(var(--primary))' }}>{sub.client_detail?.name || "Unknown"}</td>
                    <td>{sub.subscription_plan_detail?.name || "Unknown"}</td>
                    <td>{new Date(sub.start_date).toLocaleDateString()}</td>
                    <td>{sub.end_date ? new Date(sub.end_date).toLocaleDateString() : "Permanent"}</td>
                    <td>
                      <StatusBadge variant={sub.is_active ? "success" : "neutral"}>
                        {sub.is_active ? "ACTIVE" : "INACTIVE"}
                      </StatusBadge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button onClick={() => handleOpenSubModal(sub)}>✎</Button>
                        <Button variant="danger" onClick={() => handleDeleteSub(sub.id)}>🗑</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
        </Table>
        {subscriptionsMeta && <Pagination page={subscriptionsMeta.page} totalPages={Math.max(1, Math.ceil(subscriptionsMeta.count / subscriptionsMeta.pageSize))} totalCount={subscriptionsMeta.count} hasPrevious={Boolean(subscriptionsMeta.previous)} hasNext={Boolean(subscriptionsMeta.next)} onPrevious={() => setSubscriptionsPage((page) => Math.max(1, page - 1))} onNext={() => setSubscriptionsPage((page) => page + 1)} />}
      </section>

      {/* PLAN MODAL */}
      {activeModal === 'PLAN' && (
        <Modal open title={editingItem ? "Edit Subscription Plan" : "Create New Plan"} description={editingItem ? "Update pricing, board limits, and access tier details." : "Define a new service tier for your customers."} onClose={() => setActiveModal(null)}>
            <form onSubmit={handlePlanSubmit}>
              <FormField label="Plan Name"><Input value={planForm.name} placeholder="e.g. Pro Monthly" onChange={e => setPlanForm({...planForm, name: e.target.value})} required /></FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <FormField label="Service Tier">
                  <Select value={planForm.plan_type} onChange={e => setPlanForm({...planForm, plan_type: e.target.value})}>
                    <option value="FREE">FREE</option>
                    <option value="BASIC">BASIC</option>
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="CIAL">CIAL</option>
                  </Select>
                </FormField>
                <FormField label="Price (USD)"><Input type="number" step="0.01" value={planForm.price} onChange={e => setPlanForm({...planForm, price: parseFloat(e.target.value)})} required /></FormField>
              </div>
              <FormField label="Max Hardware Boards"><Input type="number" value={planForm.max_boards} onChange={e => setPlanForm({...planForm, max_boards: parseInt(e.target.value)})} required /></FormField>
              <FormField label="Public Description"><Textarea style={{ minHeight: '100px' }} value={planForm.description} placeholder="Features included in this plan..." onChange={e => setPlanForm({...planForm, description: e.target.value})} /></FormField>
              <ActionGroup>
                <Button type="button" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button type="submit" variant="primary" loading={isSubmittingPlan} loadingLabel="Saving...">Save Plan</Button>
              </ActionGroup>
            </form>
        </Modal>
      )}

      {/* SUBSCRIPTION MODAL */}
      {activeModal === 'SUBSCRIPTION' && (
        <Modal open title={editingItem ? "Update Subscription" : "Assign Plan to Client"} description={editingItem ? "Modify an existing client's access level and payment status." : "Grant a specific client access to a subscription plan."} onClose={() => setActiveModal(null)}>
            <form onSubmit={handleSubSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <FormField label="Select Client">
                  <Select value={subForm.client} onChange={e => setSubForm({...subForm, client: e.target.value})} required>
                    <option value="">Choose...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </FormField>
                <FormField label="Target Plan">
                  <Select value={subForm.subscription_plan} onChange={e => setSubForm({...subForm, subscription_plan: e.target.value})} required>
                    <option value="">Choose...</option>
                    {planCatalog.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                  </Select>
                </FormField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <FormField label="System Status">
                  <Select value={subForm.is_active ? "true" : "false"} onChange={e => setSubForm({...subForm, is_active: e.target.value === "true"})}>
                    <option value="true">ACTIVE</option>
                    <option value="false">INACTIVE / EXPIRED</option>
                  </Select>
                </FormField>
                <FormField label="Payment Status">
                  <Select value={subForm.payment_status} onChange={e => setSubForm({...subForm, payment_status: e.target.value})}>
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FREE">FREE / GIFTED</option>
                  </Select>
                </FormField>
              </div>
              <ActionGroup>
                <Button type="button" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button type="submit" variant="primary" loading={isSubmittingSubscription} loadingLabel="Saving...">Save Subscription</Button>
              </ActionGroup>
            </form>
        </Modal>
      )}
    </Page>
  );
}
