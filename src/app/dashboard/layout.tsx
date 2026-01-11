"use client";

import React, { useState, useEffect } from "react";
import styles from "./dashboard.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeProvider, useTheme } from "@/contexts/ThemeProvider";

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Only access theme after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: "📊" },
    { name: "Intents", href: "/dashboard/intents", icon: "🧠" },
    { name: "Users", href: "/dashboard/users", icon: "👥" },
    { name: "Clients", href: "/dashboard/clients", icon: "🏢" },
    { name: "Boards", href: "/dashboard/boards", icon: "📟" },
    { name: "Commands", href: "/dashboard/commands", icon: "⌨️" },
    { name: "Subscriptions", href: "/dashboard/subscriptions", icon: "💳" },
    { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={styles.layout}>
      {/* Mobile Menu Toggle */}
      <button 
        className={`${styles.mobileMenuToggle} ${isMobileMenuOpen ? styles.hidden : ''}`}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className={styles.hamburger}></span>
        <span className={styles.hamburger}></span>
        <span className={styles.hamburger}></span>
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className={styles.overlay} 
          onClick={closeMobileMenu}
        />
      )}

      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className="gradient-text" style={{ fontSize: "1.5rem", fontWeight: 800 }}>
            IntentFlow
          </div>
          {/* Close button for mobile */}
          <button 
            className={styles.closeButton}
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${
                pathname === item.href ? styles.navItemActive : ""
              }`}
              onClick={closeMobileMenu}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className={styles.logoutContainer}>
          {/* Theme Toggle - only render after mount */}
          {mounted && <ThemeToggleButton />}
          
          <div className={styles.divider}></div>
          <button 
            className={styles.logoutButton} 
            onClick={() => { handleLogout(); closeMobileMenu(); }}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}

// Separate component for theme toggle to isolate useTheme
function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      className={styles.themeToggle}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <span className={styles.themeIcon}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </ThemeProvider>
  );
}
