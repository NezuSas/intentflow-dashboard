"use client";

import {
  commandService,
  subscriptionService,
  versionService,
} from "@/composition";

import React, { useCallback, useState } from "react";
import type {
  ADBCommand,
} from "@/features/commands";
import type {
  SubscriptionPlan,
} from "@/features/subscriptions";
import type {
  ADBVersion,
} from "@/features/versions";
import { useLazyCatalog } from "@/shared/hooks/useLazyCatalog";
import { usePagedQuery } from "@/shared/hooks/useQuery";

import { getErrorMessage } from "@/utils/errors";
import { useActionFeedback } from "@/shared/hooks/useActionFeedback";
import { ActionGroup, Button, CheckboxGroup, ErrorState, FormField, FormSkeleton, Input, Modal, Page, PageHeader, Pagination, RowActions, StatusBadge, Table, TableEmpty, TablePageSkeleton, TablePanel, Textarea } from "@/shared/components";
import { pageAfterDeletion } from "@/core/Pagination";

const PAGE_SIZE = 20;

const loadCommandCatalogs = async () => {
  const [versions, plans] = await Promise.all([
    versionService.getVersions(),
    subscriptionService.getPlanCatalog(),
  ]);
  return { versions, plans: plans as SubscriptionPlan[] };
};

export default function CommandsPage() {
  const feedback = useActionFeedback();
  const catalog = useLazyCatalog(loadCommandCatalogs);
  const versions: ADBVersion[] = catalog.data?.versions ?? [];
  const plans = catalog.data?.plans ?? [];
  const [page, setPage] = useState(1);
  const commandsQuery = usePagedQuery(useCallback(() => commandService.listCommands({ page, pageSize: PAGE_SIZE }), [page]));
  const { items: commands, meta, loading, error } = commandsQuery;
  const [submitting, setSubmitting] = useState(false);

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
    void catalog.load().catch(() => {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (formData.versions.length === 0) {
      feedback.error(
        "Elige al menos una versión de ADB."
      );
      return;
    }

    if (
      formData.subscription_plans.length === 0
    ) {
      feedback.error(
        "Elige al menos un plan de suscripción."
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
      commandsQuery.reload();
    } catch (err: unknown) {
      feedback.error(
        `No se pudo guardar el comando: ${getErrorMessage(err)}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commandId: number) => {
    try {
      await commandService.deleteCommand(commandId);
      const nextPage = meta ? pageAfterDeletion(meta) : page;
      if (nextPage !== page) setPage(nextPage);
      else commandsQuery.reload();
    } catch (err: unknown) {
      feedback.error(
        `No se pudo eliminar el comando: ${getErrorMessage(err)}`
      );
    }
  };

  if (loading && commands.length === 0) {
    return <TablePageSkeleton title="Comandos" tableTitle="Comandos ADB" columns={7} />;
  }

  return (
    <Page>
      <PageHeader title="Comandos" description="Lo que una intención puede ordenar a una placa, y qué planes lo incluyen." actions={<Button variant="primary" onClick={() => handleOpenModal(null)}>+ Nuevo comando</Button>} />

      {error && <ErrorState message={error} />}

      <TablePanel title="Comandos ADB" refreshing={loading && commands.length > 0} pagination={meta && <Pagination page={meta.page} pageSize={meta.pageSize} totalCount={meta.count} onPageChange={setPage} />}>
      <Table label="Comandos ADB">
          <thead>
            <tr>
              <th>ID</th>
              <th>Clave</th>
              <th>Nombre visible</th>
              <th>Descripción</th>
              <th>Planes</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {commands.length === 0 ? (
              <TableEmpty colSpan={7} label="No hay comandos definidos." />
            ) : (
              commands.map((command) => (
                <tr key={command.id}>
                  <td>{command.id}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{command.key}</td>
                  <td>{command.display_name || '---'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {command.description || '---'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {command.subscription_plans_detail && command.subscription_plans_detail.length > 0 ? (
                        command.subscription_plans_detail.map((plan) => (
                          <StatusBadge key={plan.id} variant="neutral">
                            {plan.name}
                          </StatusBadge>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Todos los planes</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <StatusBadge variant={command.is_active ? "success" : "neutral"}>
                      {command.is_active ? "Activo" : "Inactivo"}
                    </StatusBadge>
                  </td>
                  <td>
                    <RowActions itemName={`el comando ${command.key}`} onEdit={() => handleOpenModal(command)} onDelete={() => handleDelete(command.id)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
      </Table>
      </TablePanel>

      <Modal open={isModalOpen} title={editingCommand ? "Editar comando" : "Nuevo comando ADB"} description={editingCommand ? "Cambia la cadena que se ejecuta y quién puede usarla." : "Define un comando nuevo para ejecutar en las placas."} onClose={() => setIsModalOpen(false)}>
          {!catalog.data ? (
            catalog.error ? <><ErrorState message={catalog.error} /><Button type="button" onClick={() => void catalog.load().catch(() => {})}>Reintentar</Button></> : <FormSkeleton fields={5} />
          ) : (
            <form onSubmit={handleSubmit}>
              <FormField label="Clave (identificador)" required>
                <Input
                  value={formData.key}
                  placeholder="p. ej. SCREEN_OFF"
                  onChange={(e) => setFormData({...formData, key: e.target.value})}
                  required
                />
              </FormField>
              <FormField label="Comando ADB" required>
                <Textarea
                  value={formData.command}
                  placeholder="p. ej. input keyevent 26"
                  onChange={(e) => setFormData({...formData, command: e.target.value})}
                  required
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '14px' }}
                />
              </FormField>
              <FormField label="Descripción">
                <Textarea
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </FormField>
              <FormField label="Versiones disponibles"><CheckboxGroup options={versions.map((version) => ({ id: version.id, label: version.code }))} value={formData.versions} onChange={(versions) => setFormData((current) => ({ ...current, versions }))} /></FormField>
              <FormField label="Planes de suscripción"><CheckboxGroup options={plans.map((plan) => ({ id: plan.id, label: plan.name }))} value={formData.subscription_plans} onChange={(subscription_plans) => setFormData((current) => ({ ...current, subscription_plans }))} /></FormField>
              <ActionGroup>
                <Button type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="primary" loading={submitting}>Guardar comando</Button>
              </ActionGroup>
            </form>
          )}
      </Modal>
    </Page>
  );
}
