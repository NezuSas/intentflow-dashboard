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
      setError(getErrorMessage(err, "Credenciales incorrectas. Inténtalo de nuevo."));
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
            <span className={styles.brandSub}>Gestor de intenciones · NEZU</span>
          </div>
        </div>
        <div>
          <h1 className={styles.headline}>Toda la flota de pantallas, a una intención de distancia.</h1>
          <p className={styles.lead}>
            Sigue cada intención hasta la placa Android que la recibe, administra clientes, comandos y suscripciones, y
            mira qué falló y por qué.
          </p>
        </div>
        <div className={styles.asideFooter}>NEZU S.A.S. · Cuenca, Ecuador</div>
      </aside>

      <div className={styles.formColumn}>
        <div className={styles.loginCard}>
          <h2 className={styles.formTitle}>Iniciar sesión</h2>
          <p className={styles.formHint}>Entra con tu cuenta de operador.</p>

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
            <FormField label="Correo">
              <Input type="email" id="email" placeholder="tu@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </FormField>
            <FormField label="Contraseña">
              <Input type="password" id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </FormField>
            <Button type="submit" variant="primary" className={styles.submitButton} loading={loading} loadingLabel="Entrando...">
              Entrar
            </Button>
          </form>

          <p className={styles.footer}>© {new Date().getFullYear()} NEZU S.A.S.</p>
        </div>
      </div>
    </div>
  );
}
