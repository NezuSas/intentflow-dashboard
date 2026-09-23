"use client";

import {
  authService,
} from "@/composition";

import React from "react";
import { Button, Card, FormField, Input, PageHeader } from "@/shared/components";


export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" />

      <div style={{ display: "grid", gap: "2rem" }}>
        <Card>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>Profile Settings</h2>
          <div style={{ display: "grid", gap: "1rem", maxWidth: "400px" }}>
            <FormField label="Display Name"><Input type="text" defaultValue="Oscar Cuen" /></FormField>
            <FormField label="Email Address"><Input type="email" defaultValue="oscar@nezuecuador.com" disabled /></FormField>
          </div>
          <Button variant="primary" style={{ marginTop: "1rem" }}>Update Profile</Button>
        </Card>

        <Card>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>Account Actions</h2>
          <Button
            variant="danger"
            onClick={() => authService.logout()}
          >
            Sign Out
          </Button>
        </Card>
      </div>
    </div>
  );
}
