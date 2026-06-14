import { useState } from "react";
import { CLIENTS, STATUT_CONFIG } from "../lib/data";
import { supabase } from "../lib/supabase";

export default function Clients({ navigate, t }) {
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [clients, setClients] = useState(CLIENTS);

  if (!t) t = { card: "#fff", border: "#E5E5EA", text: "#1C1C1E", textSub: "#8E8E93", bgSub: "#F7F6F3" };

  const filtres = [
    { id: "tous", label: "Tous" },
    { id: "complet", label: "Complets" },
    { id: "doc_manquant", label: "Docs manquants" },
    { id: "en_attente", label: "En attente" },
  ];

  const filtered = clients.filter(c => {
    const matchSearch = `${c.prenom} ${c.nom} ${c.email} ${c.pays}`.toLowerCase().includes(search.toLowerCase());
    const matchFiltre = filtre === "tous" || c.statut === filtre;
    return matchSearch && matchFiltre;
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
        <input
          placeholder="Rechercher un client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 320, padding: "9px 14px", borderRadius: 8, border: `1px solid ${t.border}`, fontSize: 13, background: t.card, outline: "none", color: t.text }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {filtres.map(f => (
            <button key={f.id} onClick={() => setFiltre(f.id)}
              style={{
                padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                border: "1px solid", cursor: "pointer",
                borderColor: filtre === f.id ? "#1C1C1E" : t.border,
                background: filtre === f.id ? "#1C1C1E" : t.card,
                color: filtre === f.id ? "#fff" : t.textSub
              }}>{f.label}</button>
          ))}
        </div>
        <button onClick={() => navigate("new-client")}
          style={{ padding: "9px 16px", borderRadius: 8, background: "#0A84FF", border: "none", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          + Nouveau client
        </button>
      </div>

      <div style={{ background: t.card, borderRadius: 12, border: `1px solid ${t.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: t.bgSub }}>
              {["Client", "Type de compte", "Pays", "Progression", "Statut", "Tickets", "Action"].map(h => (
                <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: t.textSub, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(client => (
              <ClientTableRow key={client.id} client={client} navigate={navigate} t={t} />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px", color: t.textSub, fontSize: 13 }}>
            Aucun client trouvé
          </div>
        )}
      </div>
    </div>
  );
}

function ClientTableRow({ client, navigate, t }) {
  const cfg = STATUT_CONFIG[client.statut];
  const openTickets = client.tickets?.filter(t => t.statut === "ouvert").length || 0;
  const pct = client.progression || 0;
  const barColor = pct === 100 ? "#30D158" : pct >= 70 ? "#0A84FF" : "#FF9F0A";
  const initials = `${client.prenom[0]}${client.nom[0]}`;

  return (
    <tr style={{ borderTop: `1px solid ${t.border}`, cursor: "pointer" }}
      onClick={() => navigate("client-detail", client)}>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar initials={initials} size={30} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{client.prenom} {client.nom}</div>
            <div style={{ fontSize: 11, color: t.textSub }}>{client.email}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: "12px 16px", fontSize: 13, color: t.text }}>{client.type_compte}</td>
      <td style={{ padding: "12px 16px", fontSize: 13, color: t.text }}>{client.pays}</td>
      <td style={{ padding: "12px 16px", minWidth: 120 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 4, background: t.bgSub, borderRadius: 99 }}>
            <div style={{ height: 4, width: `${pct}%`, background: barColor, borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: 11, color: t.textSub, minWidth: 28 }}>{pct}%</span>
        </div>
      </td>
      <td style={{ padding: "12px 16px" }}><Badge cfg={cfg} /></td>
      <td style={{ padding: "12px 16px" }}>
        {openTickets > 0 ? (
          <span style={{ fontSize: 12, background: "#FFF0EE", color: "#C0392B", padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>
            {openTickets} ouvert{openTickets > 1 ? "s" : ""}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: t.textSub }}>—</span>
        )}
      </td>
      <td style={{ padding: "12px 16px" }}>
        <button style={{ fontSize: 12, padding: "5px 10px", borderRadius: 6, border: `1px solid ${t.border}`, background: t.card, cursor: "pointer", color: t.text }}>
          Voir →
        </button>
      </td>
    </tr>
  );
}

function Avatar({ initials, size = 34 }) {
  const colors = ["#E8F0FF", "#E8F9F0", "#FFF8EC", "#FEF0F0", "#F0EEFF"];
  const textColors = ["#1B4FD8", "#1A7A4A", "#B7660A", "#C0392B", "#5B21B6"];
  const idx = initials.charCodeAt(0) % 5;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: colors[idx], color: textColors[idx], display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 600, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Badge({ cfg }) {
  if (!cfg) return null;
  return (
    <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 500, background: cfg.bg, color: cfg.color, whiteSpace: "nowrap" }}>
      {cfg.label}
    </span>
  );
}