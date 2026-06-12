import { useState } from "react";
import { CLIENTS, STATUT_CONFIG } from "../lib/data";
import { Avatar, Badge } from "./Dashboard";

export default function Tickets({ navigate }) {
  const [filtre, setFiltre] = useState("tous");

  const allTickets = CLIENTS.flatMap(c =>
    c.tickets.map(t => ({ ...t, client: c }))
  );

  const filtered = allTickets.filter(t => {
    if (filtre === "tous") return true;
    if (filtre === "ouvert") return t.statut === "ouvert";
    if (filtre === "resolu") return t.statut === "resolu";
    if (filtre === "urgent") return t.priorite === "urgent";
    if (filtre === "admin") return t.auteur === "admin";
    return true;
  });

  const stats = {
    total: allTickets.length,
    ouverts: allTickets.filter(t => t.statut === "ouvert").length,
    urgents: allTickets.filter(t => t.priorite === "urgent").length,
    resolus: allTickets.filter(t => t.statut === "resolu").length,
  };

  const filtres = [
    { id: "tous", label: `Tous (${stats.total})` },
    { id: "ouvert", label: `Ouverts (${stats.ouverts})` },
    { id: "urgent", label: `Urgents (${stats.urgents})` },
    { id: "admin", label: "Mes demandes" },
    { id: "resolu", label: `Résolus (${stats.resolus})` },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Tickets ouverts" value={stats.ouverts} color="#FF9F0A" />
        <StatCard label="Urgents" value={stats.urgents} color="#FF453A" />
        <StatCard label="Résolus" value={stats.resolus} color="#30D158" />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {filtres.map(f => (
          <button key={f.id} onClick={() => setFiltre(f.id)}
            style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
              border: "1px solid", cursor: "pointer",
              borderColor: filtre === f.id ? "#1C1C1E" : "#E5E5EA",
              background: filtre === f.id ? "#1C1C1E" : "#fff",
              color: filtre === f.id ? "#fff" : "#8E8E93"
            }}>{f.label}</button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "#AEAEB2", fontSize: 13, background: "#fff", borderRadius: 12, border: "1px solid #E5E5EA" }}>
            Aucun ticket dans cette catégorie
          </div>
        )}
        {filtered.map(ticket => (
          <TicketFullCard key={ticket.id} ticket={ticket} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1px solid #E5E5EA" }}>
      <div style={{ fontSize: 12, color: "#8E8E93", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function TicketFullCard({ ticket, navigate }) {
  const statCfg = STATUT_CONFIG[ticket.statut];
  const prioCfg = STATUT_CONFIG[ticket.priorite];
  const initials = `${ticket.client.prenom[0]}${ticket.client.nom[0]}`;

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E5EA", padding: "18px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Avatar initials={initials} size={34} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E" }}>{ticket.titre}</div>
            <div style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}>
              {ticket.client.prenom} {ticket.client.nom} · {ticket.client.pays} · {ticket.date}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#8E8E93" }}>
            {ticket.auteur === "client" ? "Client" : "Vous"}
          </span>
          <Badge cfg={prioCfg} />
          <Badge cfg={statCfg} />
        </div>
      </div>

      <div style={{ fontSize: 13, color: "#3C3C43", background: "#F7F6F3", padding: "10px 14px", borderRadius: 8, marginBottom: 12 }}>
        {ticket.message}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => navigate("client-detail", ticket.client)}
          style={{ fontSize: 12, padding: "6px 12px", borderRadius: 7, background: "none", border: "1px solid #E5E5EA", cursor: "pointer", color: "#1C1C1E" }}>
          Voir le dossier →
        </button>
        {ticket.statut === "ouvert" && <>
          <button style={{ fontSize: 12, padding: "6px 12px", borderRadius: 7, background: "#0A84FF", color: "#fff", border: "none", cursor: "pointer" }}>
            Répondre
          </button>
          <button style={{ fontSize: 12, padding: "6px 12px", borderRadius: 7, background: "#30D158", color: "#fff", border: "none", cursor: "pointer" }}>
            Marquer résolu
          </button>
        </>}
      </div>
    </div>
  );
}
