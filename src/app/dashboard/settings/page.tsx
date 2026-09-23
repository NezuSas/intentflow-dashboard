"use client";

import { authService, userService } from "@/composition";
import type { User } from "@/features/users";
import { Button, Card, ErrorState, FormSkeleton, PageHeader } from "@/shared/components";
import { getErrorMessage } from "@/utils/errors";
import { Descriptions, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUser(await userService.getCurrentUser());
    } catch (cause: unknown) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  return (
    <div>
      <PageHeader title="Settings" />
      <div style={{ display: "grid", gap: "2rem" }}>
        <Card>
          <Typography.Title level={2}>Profile</Typography.Title>
          {loading ? <FormSkeleton fields={3} /> : error ? (
            <><ErrorState message={error} /><Button onClick={() => void loadProfile()}>Retry</Button></>
          ) : user && (
            <Descriptions column={1} items={[
              { key: "name", label: "Name", children: `${user.first_name} ${user.last_name}`.trim() || "—" },
              { key: "email", label: "Email", children: user.email },
              { key: "role", label: "Role", children: user.role },
            ]} />
          )}
        </Card>

        <Card>
          <Typography.Title level={2}>Account Actions</Typography.Title>
          <Button variant="danger" onClick={() => void authService.logout()}>Sign Out</Button>
        </Card>
      </div>
    </div>
  );
}
