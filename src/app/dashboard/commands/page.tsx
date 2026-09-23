"use client";

import {
  commandService,
  subscriptionService,
  versionService,
} from "@/composition";

import React, { useEffect, useState } from "react";
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
import { getErrorMessage } from "@/utils/errors";
import { ActionGroup, Button, CheckboxGroup, ErrorState, FormField, FormSkeleton, Input, Modal, Page, PageHeader, Pagination, StatusBadge, Table, TableEmpty, TablePageSkeleton, TablePanel, Textarea } from "@/shared/components";
import type { PageMeta } from "@/core/Pagination";

const PAGE_SIZE = 20;

const loadCommandCatalogs = async () => {
  const [versions, plans] = await Promise.all([
    versionService.getVersions(),
    subscriptionService.getPlanCatalog(),
  ]);
  return { versions, plans: plans as SubscriptionPlan[] };
};

export default function CommandsPage() {
  const [commands, setCommands] = useState<ADBCommand[]>([]);
  const catalog = useLazyCatalog(loadCommandCatalogs);
  const versions: ADBVersion[] = catalog.data?.versions ?? [];
  const plans = catalog.data?.plans ?? [];
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
      const commandsData = await commandService.listCommands({ page, pageSize: PAGE_SIZE });
      setCommands(commandsData.data);
      setMeta(commandsData.meta);
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
    void catalog.load().catch(() => {});
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
    return <TablePageSkeleton title="ADB Command Management" tableTitle="ADB Commands" columns={7} />;
  }

  return (
    <Page>
      <PageHeader title="ADB Command Management" actions={<Button variant="primary" onClick={() => handleOpenModal(null)}>+ New Command</Button>} />

      {error && <ErrorState message={error} />}

      <TablePanel title="ADB Commands" refreshing={loading && commands.length > 0} pagination={meta && <Pagination page={meta.page} totalPages={Math.ceil(meta.count / meta.pageSize)} totalCount={meta.count} hasPrevious={Boolean(meta.previous)} hasNext={Boolean(meta.next)} onPrevious={() => setPage((current) => Math.max(1, current - 1))} onNext={() => setPage((current) => current + 1)} />}>
      <Table label="ADB command management">
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
              <TableEmpty colSpan={7} label="No commands found." />
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
                          <StatusBadge key={plan.id} variant="neutral">
                            {plan.name}
                          </StatusBadge>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>All Plans</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <StatusBadge variant={command.is_active ? "success" : "neutral"}>
                      {command.is_active ? "Active" : "Inactive"}
                    </StatusBadge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button onClick={() => handleOpenModal(command)}>✎</Button>
                      <Button variant="danger" onClick={() => handleDelete(command.id)}>🗑</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
      </Table>
      </TablePanel>

      <Modal open={isModalOpen} title={editingCommand ? "Edit Command" : "New ADB Command"} description={editingCommand ? "Modify this command's execution string and accessibility." : "Define a new command to be executed on the boards."} onClose={() => setIsModalOpen(false)}>
          {!catalog.data ? (
            catalog.error ? <><ErrorState message={catalog.error} /><Button type="button" onClick={() => void catalog.load().catch(() => {})}>Retry</Button></> : <FormSkeleton fields={5} />
          ) : (
            <form onSubmit={handleSubmit}>
              <FormField label="Command Key (Identifier)" required>
                <Input
                  value={formData.key}
                  placeholder="e.g. SCREEN_OFF"
                  onChange={(e) => setFormData({...formData, key: e.target.value})}
                  required
                />
              </FormField>
              <FormField label="ADB Command String" required>
                <Textarea
                  value={formData.command}
                  placeholder="e.g. input keyevent 26"
                  onChange={(e) => setFormData({...formData, command: e.target.value})}
                  required
                  style={{ fontFamily: 'monospace', fontSize: '1rem' }}
                />
              </FormField>
              <FormField label="Description">
                <Textarea
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </FormField>
              <FormField label="Available Versions"><CheckboxGroup options={versions.map((version) => ({ id: version.id, label: version.code }))} value={formData.versions} onChange={(versions) => setFormData((current) => ({ ...current, versions }))} /></FormField>
              <FormField label="Subscription Plans"><CheckboxGroup options={plans.map((plan) => ({ id: plan.id, label: plan.name }))} value={formData.subscription_plans} onChange={(subscription_plans) => setFormData((current) => ({ ...current, subscription_plans }))} /></FormField>
              <ActionGroup>
                <Button type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" loading={submitting}>Save Command</Button>
              </ActionGroup>
            </form>
          )}
      </Modal>
    </Page>
  );
}
