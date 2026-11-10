"use client";

import {
  clientService,
  subscriptionService,
} from "@/composition";

import React, { useCallback, useState } from "react";
import type {
  SubscriptionPlan,
  ClientSubscription,
} from "@/features/subscriptions";
import type {
  Client,
} from "@/features/clients";
import { useLazyCatalog } from "@/shared/hooks/useLazyCatalog";
import { usePagedQuery } from "@/shared/hooks/useQuery";

import { getErrorMessage } from "@/utils/errors";
import { useActionFeedback } from "@/shared/hooks/useActionFeedback";
import { formatCalendarDate } from "@/shared/format/date";
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
  const catalog = useLazyCatalog(loadSubscriptionCatalogs);
  const clients = catalog.data?.clients ?? [];
  const planCatalog = catalog.data?.plans ?? [];
  const [plansPage, setPlansPage] = useState(1);
  const [subscriptionsPage, setSubscriptionsPage] = useState(1);
  const plansQuery = usePagedQuery(useCallback(() => subscriptionService.listPlans({ page: plansPage, pageSize: PAGE_SIZE }), [plansPage]));
  const subscriptionsQuery = usePagedQuery(
    useCallback(() => subscriptionService.listClientSubscriptions({ page: subscriptionsPage, pageSize: PAGE_SIZE }), [subscriptionsPage])
  );
  const { items: plans, meta: plansMeta, loading: plansLoading, error: plansError } = plansQuery;
  const { items: clientSubs, meta: subscriptionsMeta, loading: subscriptionsLoading, error: subscriptionsError } = subscriptionsQuery;
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const [isSubmittingSubscription, setIsSubmittingSubscription] = useState(false);

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
      plansQuery.reload();
    } catch (err: unknown) {
      feedback.error(
        `No se pudo guardar el plan: ${getErrorMessage(err)}`
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
      subscriptionsQuery.reload();
    } catch (err: unknown) {
      feedback.error(
        `No se pudo guardar la suscripción: ${getErrorMessage(err)}`
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
      else plansQuery.reload();
    } catch (err: unknown) {
      feedback.error(getErrorMessage(err));
    }
  };

  const handleDeleteSub = async (id: number) => {
    try {
      await subscriptionService.deleteClientSubscription(id);
      const nextPage = subscriptionsMeta ? pageAfterDeletion(subscriptionsMeta) : subscriptionsPage;
      if (nextPage !== subscriptionsPage) setSubscriptionsPage(nextPage);
      else subscriptionsQuery.reload();
    } catch (err: unknown) {
      feedback.error(getErrorMessage(err));
    }
  };

  return (
    <Page>
      <PageHeader title="Suscripciones" description="Planes de servicio y qué plan tiene cada cliente." actions={<div style={{ display: "flex", gap: "1rem" }}>
          <Button onClick={() => handleOpenPlanModal()}>+ Nuevo plan</Button>
          <Button variant="primary" onClick={() => handleOpenSubModal()}>+ Nueva suscripción</Button>
        </div>
      } />

      {plansError && <ErrorState message={plansError} />}
      {subscriptionsError && <ErrorState message={subscriptionsError} />}

      <section style={{ marginBottom: '3rem' }}>
        <TablePanel title="Planes" refreshing={plansLoading && plans.length > 0} pagination={plansMeta && <Pagination page={plansMeta.page} pageSize={plansMeta.pageSize} totalCount={plansMeta.count} onPageChange={setPlansPage} />}>
        {plansLoading && plans.length === 0 ? <TableSkeleton columns={6} label="Cargando planes..." /> : (
        <Table label="Planes">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Máx. placas</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 ? (
                <TableEmpty colSpan={6} label="No hay planes definidos." />
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id}>
                    <td style={{ fontWeight: 600 }}>{plan.name}</td>
                    <td>{plan.plan_type}</td>
                    <td>${plan.price}</td>
                    <td>{plan.max_boards}</td>
                    <td>
                      <StatusBadge variant={plan.is_active ? "success" : "neutral"}>
                        {plan.is_active ? "Activa" : "Inactiva"}
                      </StatusBadge>
                    </td>
                    <td>
                      <RowActions itemName={`el plan ${plan.name}`} onEdit={() => handleOpenPlanModal(plan)} onDelete={() => handleDeletePlan(plan.id)} />
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
        <TablePanel title="Suscripciones de clientes" refreshing={subscriptionsLoading && clientSubs.length > 0} pagination={subscriptionsMeta && <Pagination page={subscriptionsMeta.page} pageSize={subscriptionsMeta.pageSize} totalCount={subscriptionsMeta.count} onPageChange={setSubscriptionsPage} />}>
        {subscriptionsLoading && clientSubs.length === 0 ? <TableSkeleton columns={6} label="Cargando suscripciones..." /> : (
        <Table label="Suscripciones de clientes">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Plan</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientSubs.length === 0 ? (
                <TableEmpty colSpan={6} label="Ningún cliente tiene suscripción." />
              ) : (
                clientSubs.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: 500 }}>{sub.client_detail?.name || "Desconocido"}</td>
                    <td>{sub.subscription_plan_detail?.name || "Desconocido"}</td>
                    <td>{formatCalendarDate(sub.start_date)}</td>
                    <td>{sub.end_date ? formatCalendarDate(sub.end_date) : "Permanente"}</td>
                    <td>
                      <StatusBadge variant={sub.is_active ? "success" : "neutral"}>
                        {sub.is_active ? "ACTIVE" : "INACTIVE"}
                      </StatusBadge>
                    </td>
                    <td>
                      <RowActions itemName={`la suscripción de ${sub.client_detail?.name || "este cliente"}`} onEdit={() => handleOpenSubModal(sub)} onDelete={() => handleDeleteSub(sub.id)} />
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
        <Modal open title={editingItem ? "Editar plan" : "Nuevo plan"} description={editingItem ? "Cambia el precio, el límite de placas y el nivel de acceso." : "Define un nivel de servicio nuevo para tus clientes."} onClose={() => setActiveModal(null)}>
            <form onSubmit={handlePlanSubmit}>
              <FormField label="Nombre del plan"><Input value={planForm.name} placeholder="p. ej. Negocio mensual" onChange={e => setPlanForm({...planForm, name: e.target.value})} required /></FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <FormField label="Nivel">
                  <Select value={planForm.plan_type} onChange={e => setPlanForm({...planForm, plan_type: e.target.value})}>
                    <option value="FREE">Gratuito</option>
                    <option value="BASIC">Básico</option>
                    <option value="PREMIUM">Premium</option>
                  </Select>
                </FormField>
                <FormField label="Precio (USD)"><Input type="number" step="0.01" value={planForm.price} onChange={e => setPlanForm({...planForm, price: parseFloat(e.target.value)})} required /></FormField>
              </div>
              <FormField label="Máximo de placas"><Input type="number" value={planForm.max_boards} onChange={e => setPlanForm({...planForm, max_boards: parseInt(e.target.value)})} required /></FormField>
              <FormField label="Descripción"><Textarea style={{ minHeight: '100px' }} value={planForm.description} placeholder="Qué incluye este plan..." onChange={e => setPlanForm({...planForm, description: e.target.value})} /></FormField>
              <ActionGroup>
                <Button type="button" onClick={() => setActiveModal(null)}>Cancelar</Button>
                <Button type="submit" variant="primary" loading={isSubmittingPlan} loadingLabel="Guardando...">Guardar plan</Button>
              </ActionGroup>
            </form>
        </Modal>
      )}

      {/* SUBSCRIPTION MODAL */}
      {activeModal === 'SUBSCRIPTION' && (
        <Modal open title={editingItem ? "Editar suscripción" : "Asignar un plan"} description={editingItem ? "Cambia el plan o el estado de pago de este cliente." : "Da a un cliente acceso a un plan de suscripción."} onClose={() => setActiveModal(null)}>
          {!catalog.data ? (
            catalog.error ? <><ErrorState message={catalog.error} /><Button type="button" onClick={() => void catalog.load().catch(() => {})}>Reintentar</Button></> : <FormSkeleton fields={4} />
          ) : (
            <form onSubmit={handleSubSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <FormField label="Cliente">
                  <Select value={subForm.client} onChange={e => setSubForm({...subForm, client: e.target.value})} required>
                    <option value="">Elegir...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </FormField>
                <FormField label="Plan">
                  <Select value={subForm.subscription_plan} onChange={e => setSubForm({...subForm, subscription_plan: e.target.value})} required>
                    <option value="">Elegir...</option>
                    {planCatalog.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                  </Select>
                </FormField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <FormField label="Estado">
                  <Select value={subForm.is_active ? "true" : "false"} onChange={e => setSubForm({...subForm, is_active: e.target.value === "true"})}>
                    <option value="true">Activa</option>
                    <option value="false">Inactiva o vencida</option>
                  </Select>
                </FormField>
                <FormField label="Pago">
                  <Select value={subForm.payment_status} onChange={e => setSubForm({...subForm, payment_status: e.target.value})}>
                    <option value="PAID">Pagado</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="FREE">Gratuito</option>
                  </Select>
                </FormField>
              </div>
              <FormField label="Fecha de fin">
                <Input type="date" value={subForm.end_date} onChange={e => setSubForm({...subForm, end_date: e.target.value})} />
              </FormField>
              <ActionGroup>
                <Button type="button" onClick={() => setActiveModal(null)}>Cancelar</Button>
                <Button type="submit" variant="primary" loading={isSubmittingSubscription} loadingLabel="Guardando...">Guardar suscripción</Button>
              </ActionGroup>
            </form>
          )}
        </Modal>
      )}
    </Page>
  );
}
