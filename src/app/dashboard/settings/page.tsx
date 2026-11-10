"use client";

import { authService, userService } from "@/composition";
import type { User } from "@/features/users";
import { Button, Card, ErrorState, FormSkeleton, PageHeader } from "@/shared/components";
import { useQuery } from "@/shared/hooks/useQuery";
import { Descriptions, Typography } from "antd";
import { useCallback } from "react";

export default function SettingsPage() {
  const profile = useQuery(useCallback((): Promise<User> => userService.getCurrentUser(), []));
  const { data: user, loading, error } = profile;

  return (
    <div>
      <PageHeader title="Configuración" description="Tu cuenta en el panel." />
      <div style={{ display: "grid", gap: "2rem" }}>
        <Card>
          <Typography.Title level={2}>Perfil</Typography.Title>
          {loading ? <FormSkeleton fields={3} /> : error ? (
            <><ErrorState message={error} /><Button onClick={() => profile.reload()}>Reintentar</Button></>
          ) : user && (
            <Descriptions column={1} items={[
              { key: "name", label: "Nombre", children: `${user.first_name} ${user.last_name}`.trim() || "—" },
              { key: "email", label: "Correo", children: user.email },
              { key: "role", label: "Rol", children: user.role },
            ]} />
          )}
        </Card>

        <Card>
          <Typography.Title level={2}>Sesión</Typography.Title>
          <Button variant="danger" onClick={() => void authService.logout()}>Cerrar sesión</Button>
        </Card>
      </div>
    </div>
  );
}
