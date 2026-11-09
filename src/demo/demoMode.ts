/**
 * Demo mode: the whole dashboard runs on sample data, without the private Intent Manager API.
 * It is switched on at build time with NEXT_PUBLIC_DEMO=1, so a static export can be published
 * as a public demo; a regular build never includes the sample data in its code paths.
 */
export const isDemoMode = (): boolean =>
  process.env.NEXT_PUBLIC_DEMO === "1";

/** Any email and password sign in; this is the account the demo shows as the current user. */
export const DEMO_ACCOUNT = {
  email: "demo@nezuecuador.com",
  password: "demo",
} as const;
