import { useState } from "react";

export default function NewClient({ navigate }) {
  return (
    <div style={{ maxWidth: 500, margin: "40px auto", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 16 }}>👤</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#1C1C1E", marginBottom: 8 }}>Créer un nouveau dossier</div>
      <div style={{ fontSize: 14, color: "#8E8E93", marginBottom: 32 }}>Choisissez comment créer le dossier client.</div>
      <div style={{ display: "grid", gap: 14 }}>
        <button onClick={() => navigate("onboarding")}
          style={{ padding: "20px 24px", borderRadius: 12, border: "1px solid #E5E5EA", background: "#fff", cursor: "pointer", textAlign: "left" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1C1C1E", marginBottom: 4 }}>📋 Formulaire guidé</div>
          <div style={{ fontSize: 13, color: "#8E8E93" }}>Remplir vous-même le dossier étape par étape</div>
        </button>
        <button style={{ padding: "20px 24px", borderRadius: 12, border: "1px solid #E5E5EA", background: "#fff", cursor: "pointer", textAlign: "left" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1C1C1E", marginBottom: 4 }}>🔗 Lien client</div>
          <div style={{ fontSize: 13, color: "#8E8E93" }}>Envoyer un lien au client pour qu'il remplisse lui-même</div>
        </button>
      </div>
    </div>
  );
}
