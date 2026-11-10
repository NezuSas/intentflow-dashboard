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
    label: "Operation",
    items: [
      { key: "/dashboard", label: "Overview", icon: "dashboard" },
      { key: "/dashboard/intents", label: "Intents", icon: "intents" },
      { key: "/dashboard/commands", label: "Commands", icon: "commands" },
    ],
  },
  {
    label: "Fleet",
    items: [
      { key: "/dashboard/boards", label: "Boards", icon: "boards" },
      { key: "/dashboard/clients", label: "Clients", icon: "clients" },
      { key: "/dashboard/subscriptions", label: "Subscriptions", icon: "subscriptions" },
    ],
  },
  {
    label: "Account",
    items: [
      { key: "/dashboard/users", label: "Users", icon: "users" },
      { key: "/dashboard/settings", label: "Settings", icon: "settings" },
    ],
  },
] as const;

/** Lista plana, en el orden del menú; la usan las pruebas de rutas. */
export const dashboardNavigation: readonly NavigationItem[] = dashboardNavigationGroups.flatMap((group) => group.items);
