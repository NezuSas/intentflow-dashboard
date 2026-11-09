"use client";

import {
  authService,
} from "@/composition";

import React, { useState } from "react";
import styles from "./login.module.css";
import { useRouter } from "next/navigation";

import { getErrorMessage } from "@/utils/errors";
import { Button, Card, ErrorState, FormField, Input } from "@/shared/components";
import { DEMO_ACCOUNT, isDemoMode } from "@/demo/demoMode";

export default function LoginPage() {
  // In the public demo the form comes filled in and any credentials are accepted.
  const demo = isDemoMode();
  const [email, setEmail] = useState(demo ? DEMO_ACCOUNT.email : "");
  const [password, setPassword] = useState(demo ? DEMO_ACCOUNT.password : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signIn = async (userEmail: string, userPassword: string) => {
    setLoading(true);
    setError(null);

    try {
      await authService.login(userEmail, userPassword);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          "Invalid credentials. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <div className={styles.container}>
      <Card className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.logo}>IntentFlow</h1>
          <p className={styles.subtitle}>Admin Dashboard Access</p>
        </div>

        {demo && (
          <div role="note">
            <p className={styles.subtitle}>
              Demo pública con datos de ejemplo. Nada se guarda ni sale de tu navegador.
            </p>
            <Button
              type="button"
              variant="primary"
              className={styles.submitButton}
              loading={loading}
              loadingLabel="Entrando..."
              onClick={() => void signIn(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password)}
            >
              Entrar a la demo
            </Button>
          </div>
        )}

        {error && (
          <ErrorState message={error} />
        )}

        <form className={styles.form} onSubmit={handleLogin}>
          <FormField label="Email Address">
            <Input
              type="email"
              id="email"
              placeholder="admin@intentflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Password">
            <Input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            className={styles.submitButton}
            loading={loading}
            loadingLabel="Authenticating..."
          >
            Sign In
          </Button>
        </form>

        <div className={styles.footer}>
          <p>© 2025 Nezu. All rights reserved.</p>
        </div>
      </Card>
    </div>
  );
}
