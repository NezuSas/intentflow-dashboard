"use client";

import { authService, authTokenManager } from "@/composition";
import { useTheme } from "@/contexts/ThemeProvider";
import { AppstoreOutlined, CloudServerOutlined, DashboardOutlined, FileTextOutlined, LogoutOutlined, MacCommandOutlined, MenuFoldOutlined, MenuUnfoldOutlined, MoonOutlined, SettingOutlined, SunOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Flex, Layout, Menu, Tooltip, Typography, theme } from "antd";
import type { MenuProps } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

const { Sider, Content } = Layout;

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme: currentTheme, toggleTheme } = useTheme();
  const { token } = theme.useToken();
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
    return () => { cancelled = true; window.removeEventListener("intentflow:logout", redirectToLogin); };
  }, [router]);

  const items = useMemo<MenuProps["items"]>(() => [
    { key: "/dashboard", icon: <DashboardOutlined />, label: <Link href="/dashboard">Overview</Link> },
    { key: "/dashboard/intents", icon: <FileTextOutlined />, label: <Link href="/dashboard/intents">Intents</Link> },
    { key: "/dashboard/users", icon: <UserOutlined />, label: <Link href="/dashboard/users">Users</Link> },
    { key: "/dashboard/clients", icon: <TeamOutlined />, label: <Link href="/dashboard/clients">Clients</Link> },
    { key: "/dashboard/boards", icon: <CloudServerOutlined />, label: <Link href="/dashboard/boards">Boards</Link> },
    { key: "/dashboard/commands", icon: <MacCommandOutlined />, label: <Link href="/dashboard/commands">Commands</Link> },
    { key: "/dashboard/subscriptions", icon: <AppstoreOutlined />, label: <Link href="/dashboard/subscriptions">Subscriptions</Link> },
    { key: "/dashboard/settings", icon: <SettingOutlined />, label: <Link href="/dashboard/settings">Settings</Link> },
  ], []);

  if (!authChecked) return <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>Validating session...</Flex>;

  return <Layout style={{ minHeight: "100vh", background: token.colorBgLayout }}>
    <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} breakpoint="md" collapsedWidth={64} width={248} trigger={null} theme={currentTheme === "dark" ? "dark" : "light"} style={{ background: token.colorBgContainer, borderInlineEnd: `1px solid ${token.colorBorderSecondary}` }}>
      <Flex align="center" justify="space-between" style={{ height: 64, padding: "0 12px", borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
        <Typography.Text strong style={{ color: token.colorText, whiteSpace: "nowrap", fontSize: 16, overflow: "hidden" }}>{collapsed ? "N" : "NEZU · IntentFlow"}</Typography.Text>
        <Flex gap={0}>
          {!collapsed && <Tooltip title={currentTheme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}><Button type="text" shape="circle" aria-label="Toggle theme" icon={currentTheme === "dark" ? <SunOutlined /> : <MoonOutlined />} onClick={toggleTheme} /></Tooltip>}
          <Tooltip title={collapsed ? "Expandir navegación" : "Contraer navegación"}><Button type="text" shape="circle" aria-label="Toggle navigation" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed((value) => !value)} /></Tooltip>
        </Flex>
      </Flex>
      <Menu theme={currentTheme === "dark" ? "dark" : "light"} mode="inline" selectedKeys={[pathname]} items={items} style={{ background: "transparent", borderInlineEnd: 0, padding: 8 }} />
      <div style={{ position: "absolute", insetInline: 0, bottom: 0, padding: 8, borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <Button danger type="text" icon={<LogoutOutlined />} block onClick={() => void authService.logout()}> {!collapsed && "Logout"}</Button>
      </div>
    </Sider>
    <Content style={{ minWidth: 0, overflowY: "auto", padding: 20, background: token.colorBgLayout }}><main>{children}</main></Content>
  </Layout>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) { return <DashboardLayoutContent>{children}</DashboardLayoutContent>; }
