import React, { useEffect } from "react";
import "../styles/toast.css";

export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
    warning: "⚠️",
  };

  const backgroundColors = {
    success: "#16A34A",
    error: "#DC2626",
    info: "#2563EB",
    warning: "#D97706",
  };

  return (
    <div
      className={`toast toast-${type}`}
      style={{
        position: "fixed",
        bottom: "25px",
        right: "25px",
        backgroundColor: backgroundColors[type] || "#1E293B",
        color: "#FFFFFF",
        padding: "12px 20px",
        borderRadius: "8px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "14px",
        fontWeight: "600",
        zIndex: 9999,
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <span style={{ fontSize: "16px" }}>{icons[type] || "ℹ️"}</span>
      <span>{message}</span>
    </div>
  );
}
