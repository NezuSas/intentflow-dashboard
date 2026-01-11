"use client";

import React from "react";
import styles from "../dashboard.module.css";
import { authService } from "@/services/authService";

export default function SettingsPage() {
  return (
    <div>
      <div className={styles.header}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 700 }}>Settings</h1>
      </div>

      <div style={{ display: "grid", gap: "2rem" }}>
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>Profile Settings</h2>
          <div style={{ display: "grid", gap: "1rem", maxWidth: "400px" }}>
            <div className="input-group">
              <label className="input-label">Display Name</label>
              <input className="input-field" type="text" defaultValue="Oscar Cuen" />
            </div>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input className="input-field" type="email" defaultValue="oscar@nezuecuador.com" disabled />
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: "1rem" }}>Update Profile</button>
        </div>

        <div className="glass-panel" style={{ padding: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>Account Actions</h2>
          <button 
            className="btn btn-ghost" 
            style={{ color: "#f87171", borderColor: "rgba(239, 68, 68, 0.2)" }}
            onClick={() => authService.logout()}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
