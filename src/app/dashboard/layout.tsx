"use client";

import { authService, authTokenManager } from "@/composition";
import { useTheme } from "@/contexts/ThemeProvider";
import { dashboardNavigationGroups, type NavigationIcon } from "@/shared/navigation/dashboardNavigation";
import { BrandMark } from "@/shared/components/layout/BrandMark";
import styles from "./dashboard.module.css";
import {
  AppstoreOutlined,
  CloudServerOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MacCommandOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SettingOutlined,
  SunOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState, type ReactNode } from "react";

const icons: Record<NavigationIcon, ReactNode> = {
  dashboard: <DashboardOutlined />,
  intents: <FileTextOutlined />,
  users: <UserOutlined />,
  clients: <TeamOutlined />,
  boards: <CloudServerOutlined />,
  commands: <MacCommandOutlined />,
  subscriptions: <AppstoreOutlined />,
  settings: <SettingOutlined />,
};

/**
 * Armazón del panel: barra lateral oscura con la marca, la navegación agrupada por lo que hace el operador y los
 * controles de cuenta; a la derecha, el contenido con un ancho máximo cómodo para tablas.
 */
function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme: currentTheme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const redirectToLogin = () => router.replace("/login");
    window.addEventListener("intentflow:logout", redirectToLogin);
    const validateSession = async () => {
      if (!authTokenManager.hasSession()) return redirectToLogin();
      if (!authTokenManager.getAccessToken() && authTokenManager.getRefreshToken()) {
        const token = await authTokenManager.refreshAccessToken();
        if (!token) return redirectToLogin();
      }
      if (!cancelled) setAuthChecked(true);
    };
    void validateSession();
    return () => {
      cancelled = true;
      window.removeEventListener("intentflow:logout", redirectToLogin);
    };
  }, [router]);

  if (!authChecked) {
    return (
      <div className={styles.validating} role="status">
        <BrandMark size={40} />
        <span>Validando la sesión...</span>
      </div>
    );
  }

  const isActive = (key: string) => (key === "/dashboard" ? pathname === key : pathname === key || pathname.startsWith(`${key}/`));

  return (
    <div className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ""}`}>
      <aside className={styles.sidebar} aria-label="Navegación principal">
        <div className={styles.brand}>
          <BrandMark size={34} />
          {!collapsed && (
            <div className={styles.brandText}>
              <span className={styles.brandName}>IntentFlow</span>
              <span className={styles.brandSub}>Gestor de intenciones · NEZU</span>
            </div>
          )}
        </div>

        <nav className={styles.nav}>
          {dashboardNavigationGroups.map((group) => (
            <div key={group.label} className={styles.navGroup}>
              {!collapsed && <div className={styles.navGroupLabel}>{group.label}</div>}
              {group.items.map((item) => {
                const active = isActive(item.key);
                const link = (
                  <button
                    key={item.key}
                    type="button"
                    className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={() => router.push(item.key)}
                  >
                    <span className={styles.navIcon}>{icons[item.icon]}</span>
                    {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                  </button>
                );
                return collapsed ? (
                  <Tooltip key={item.key} title={item.label} placement="right">
                    {link}
                  </Tooltip>
                ) : (
                  link
                );
              })}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Tooltip title={currentTheme === "dark" ? "Modo claro" : "Modo oscuro"} placement="right">
            <button type="button" className={styles.footerButton} aria-label="Cambiar tema" onClick={toggleTheme}>
              {currentTheme === "dark" ? <SunOutlined /> : <MoonOutlined />}
              {!collapsed && <span>{currentTheme === "dark" ? "Modo claro" : "Modo oscuro"}</span>}
            </button>
          </Tooltip>
          <Tooltip title={collapsed ? "Expandir el menú" : "Contraer el menú"} placement="right">
            <button type="button" className={styles.footerButton} aria-label="Contraer o expandir el menú" onClick={() => setCollapsed((value) => !value)}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              {!collapsed && <span>Contraer</span>}
            </button>
          </Tooltip>
          <Tooltip title="Cerrar sesión" placement="right">
            <button type="button" className={`${styles.footerButton} ${styles.logout}`} onClick={() => void authService.logout()}>
              <LogoutOutlined />
              {!collapsed && <span>Cerrar sesión</span>}
            </button>
          </Tooltip>
        </div>
      </aside>

      <div className={styles.content}>
        <main className={styles.contentInner}>{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>;
}
