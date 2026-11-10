"use client";

import { authService } from "@/composition";
import React, { useState } from "react";
import styles from "./login.module.css";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/utils/errors";
import { Button, ErrorState, FormField, Input } from "@/shared/components";
import { BrandMark } from "@/shared/components/layout/BrandMark";
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
      setError(getErrorMessage(err, "Invalid credentials. Please try again."));
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
      <aside className={styles.aside}>
        <div className={styles.brand}>
          <BrandMark size={40} />
          <div>
            <span className={styles.brandName}>IntentFlow</span>
            <span className={styles.brandSub}>Intent Manager · NEZU</span>
          </div>
        </div>
        <div>
          <h1 className={styles.headline}>Every screen in the fleet, one intent away.</h1>
          <p className={styles.lead}>
            Follow intents as they reach each Android board, manage clients, commands and subscriptions, and see what
            failed and why.
          </p>
        </div>
        <div className={styles.asideFooter}>NEZU S.A.S. · Cuenca, Ecuador</div>
      </aside>

      <div className={styles.formColumn}>
        <div className={styles.loginCard}>
          <h2 className={styles.formTitle}>Sign in</h2>
          <p className={styles.formHint}>Use your operator account.</p>

          {demo && (
            <div role="note" className={styles.demoNote}>
              <p>Demo pública con datos de ejemplo. Nada se guarda ni sale de tu navegador.</p>
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

          {error && <ErrorState message={error} />}

          <form className={styles.form} onSubmit={handleLogin}>
            <FormField label="Email">
              <Input type="email" id="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </FormField>
            <FormField label="Password">
              <Input type="password" id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </FormField>
            <Button type="submit" variant="primary" className={styles.submitButton} loading={loading} loadingLabel="Authenticating...">
              Sign In
            </Button>
          </form>

          <p className={styles.footer}>© {new Date().getFullYear()} NEZU S.A.S.</p>
        </div>
      </div>
    </div>
  );
}
