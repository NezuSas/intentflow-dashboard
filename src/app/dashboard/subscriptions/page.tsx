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
import { useLazyCatalog } from "@/shared/hooks/useLazyCatalog";
import { getErrorMessage } from "@/utils/errors";
import { useActionFeedback } from "@/shared/hooks/useActionFeedback";
import { formatCalendarDate } from "@/shared/format/date";
import type { PageMeta } from "@/core/Pagination";
import { pageAfterDeletion } from "@/core/Pagination";
import { ActionGroup, Button, ErrorState, FormField, FormSkeleton, Input, Modal, Page, PageHeader, Pagination, RowActions, Select, StatusBadge, Table, TableEmpty, TablePanel, TableSkeleton, Textarea } from "@/shared/components";

const PAGE_SIZE = 20;

const loadSubscriptionCatalogs = async () => {
  const [clients, plans] = await Promise.all([
    clientService.getClientCatalog(),
    subscriptionService.getPlanCatalog(),
  ]);
  return { clients: clients as Client[], plans: plans as SubscriptionPlan[] };
};

export default function SubscriptionsPage() {
  const feedback = useActionFeedback();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [clientSubs, setClientSubs] = useState<ClientSubscription[]>([]);
  const catalog = useLazyCatalog(loadSubscriptionCatalogs);
  const clients = catalog.data?.clients ?? [];
  const planCatalog = catalog.data?.plans ?? [];
  const [plansLoading, setPlansLoading] = useState(true);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
  const [plansPage, setPlansPage] = useState(1);
  const [subscriptionsPage, setSubscriptionsPage] = useState(1);
  const [plansMeta, setPlansMeta] = useState<PageMeta | null>(null);
  const [subscriptionsMeta, setSubscriptionsMeta] = useState<PageMeta | null>(null);
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const [isSubmittingSubscription, setIsSubmittingSubscription] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [subscriptionsError, setSubscriptionsError] = useState<string | null>(null);

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
    let cancelled = false;
    setPlansLoading(true);
    void subscriptionService.listPlans({ page: plansPage, pageSize: PAGE_SIZE })
      .then((response) => {
        if (cancelled) return;
        setPlans(response.data);
        setPlansMeta(response.meta);
        setPlansError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setPlansError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setPlansLoading(false);
      });
    return () => { cancelled = true; };
  }, [plansPage]);

  useEffect(() => {
    let cancelled = false;
    setSubscriptionsLoading(true);
    void subscriptionService.listClientSubscriptions({ page: subscriptionsPage, pageSize: PAGE_SIZE })
      .then((response) => {
        if (cancelled) return;
        setClientSubs(response.data);
        setSubscriptionsMeta(response.meta);
        setSubscriptionsError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setSubscriptionsError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setSubscriptionsLoading(false);
      });
    return () => { cancelled = true; };
  }, [subscriptionsPage]);

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
    void catalog.load().catch(() => {});
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
      catalog.invalidate();
      await refreshPlans();
    } catch (err: unknown) {
      feedback.error(
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
      feedback.error(
        `Error saving subscription: ${getErrorMessage(err)}`
      );
    } finally {
      setIsSubmittingSubscription(false);
    }
  };

  const handleDeletePlan = async (id: number) => {
    try {
      await subscriptionService.deletePlan(id);
      catalog.invalidate();
      const nextPage = plansMeta ? pageAfterDeletion(plansMeta) : plansPage;
      if (nextPage !== plansPage) setPlansPage(nextPage);
      else await refreshPlans();
    } catch (err: unknown) {
      feedback.error(getErrorMessage(err));
    }
  };

  const handleDeleteSub = async (id: number) => {
    try {
      await subscriptionService.deleteClientSubscription(id);
      const nextPage = subscriptionsMeta ? pageAfterDeletion(subscriptionsMeta) : subscriptionsPage;
      if (nextPage !== subscriptionsPage) setSubscriptionsPage(nextPage);
      else await refreshClientSubscriptions();
    } catch (err: unknown) {
      feedback.error(getErrorMessage(err));
    }
  };

  return (
    <Page>
      <PageHeader title="Subscription Management" actions={<div style={{ display: "flex", gap: "1rem" }}>
          <Button onClick={() => handleOpenPlanModal()}>+ New Plan</Button>
          <Button variant="primary" onClick={() => handleOpenSubModal()}>+ New Subscription</Button>
        </div>
      } />

      {plansError && <ErrorState message={plansError} />}
      {subscriptionsError && <ErrorState message={subscriptionsError} />}

      <section style={{ marginBottom: '3rem' }}>
        <TablePanel title="Available Plans" refreshing={plansLoading && plans.length > 0} pagination={plansMeta && <Pagination page={plansMeta.page} pageSize={plansMeta.pageSize} totalCount={plansMeta.count} onPageChange={setPlansPage} />}>
        {plansLoading && plans.length === 0 ? <TableSkeleton columns={6} label="Loading plans..." /> : (
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
                      <RowActions itemName={`plan ${plan.name}`} onEdit={() => handleOpenPlanModal(plan)} onDelete={() => handleDeletePlan(plan.id)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
        </Table>
        )}
        </TablePanel>
      </section>

      <section>
        <TablePanel title="Client Subscriptions" refreshing={subscriptionsLoading && clientSubs.length > 0} pagination={subscriptionsMeta && <Pagination page={subscriptionsMeta.page} pageSize={subscriptionsMeta.pageSize} totalCount={subscriptionsMeta.count} onPageChange={setSubscriptionsPage} />}>
        {subscriptionsLoading && clientSubs.length === 0 ? <TableSkeleton columns={6} label="Loading client subscriptions..." /> : (
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
                    <td>{formatCalendarDate(sub.start_date)}</td>
                    <td>{sub.end_date ? formatCalendarDate(sub.end_date) : "Permanent"}</td>
                    <td>
                      <StatusBadge variant={sub.is_active ? "success" : "neutral"}>
                        {sub.is_active ? "ACTIVE" : "INACTIVE"}
                      </StatusBadge>
                    </td>
                    <td>
                      <RowActions itemName={`subscription for ${sub.client_detail?.name || "client"}`} onEdit={() => handleOpenSubModal(sub)} onDelete={() => handleDeleteSub(sub.id)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
        </Table>
        )}
        </TablePanel>
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
          {!catalog.data ? (
            catalog.error ? <><ErrorState message={catalog.error} /><Button type="button" onClick={() => void catalog.load().catch(() => {})}>Retry</Button></> : <FormSkeleton fields={4} />
          ) : (
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
              <FormField label="End Date">
                <Input type="date" value={subForm.end_date} onChange={e => setSubForm({...subForm, end_date: e.target.value})} />
              </FormField>
              <ActionGroup>
                <Button type="button" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button type="submit" variant="primary" loading={isSubmittingSubscription} loadingLabel="Saving...">Save Subscription</Button>
              </ActionGroup>
            </form>
          )}
        </Modal>
      )}
    </Page>
  );
}
