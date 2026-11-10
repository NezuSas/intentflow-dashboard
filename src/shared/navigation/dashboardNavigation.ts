export type NavigationIcon = "dashboard" | "intents" | "users" | "clients" | "boards" | "commands" | "subscriptions" | "settings";

export interface NavigationItem {
  key: string;
  label: string;
  icon: NavigationIcon;
}

export interface NavigationGroup {
  /** Qué agrupa: la operación diaria, la flota instalada o la cuenta. */
  label: string;
  items: readonly NavigationItem[];
}

/** La navegación del panel, agrupada por lo que el operador hace. */
export const dashboardNavigationGroups: readonly NavigationGroup[] = [
  {
    label: "Operación",
    items: [
      { key: "/dashboard", label: "Resumen", icon: "dashboard" },
      { key: "/dashboard/intents", label: "Intenciones", icon: "intents" },
      { key: "/dashboard/commands", label: "Comandos", icon: "commands" },
    ],
  },
  {
    label: "Flota",
    items: [
      { key: "/dashboard/boards", label: "Placas", icon: "boards" },
      { key: "/dashboard/clients", label: "Clientes", icon: "clients" },
      { key: "/dashboard/subscriptions", label: "Suscripciones", icon: "subscriptions" },
    ],
  },
  {
    label: "Cuenta",
    items: [
      { key: "/dashboard/users", label: "Usuarios", icon: "users" },
      { key: "/dashboard/settings", label: "Configuración", icon: "settings" },
    ],
  },
] as const;

/** Lista plana, en el orden del menú; la usan las pruebas de rutas. */
export const dashboardNavigation: readonly NavigationItem[] = dashboardNavigationGroups.flatMap((group) => group.items);
