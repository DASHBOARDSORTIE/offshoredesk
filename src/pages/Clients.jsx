import { useState } from "react";
import { CLIENTS, STATUT_CONFIG } from "../lib/data";
import { Avatar, Badge } from "./Dashboard";

export default function Clients({ navigate }) {
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState("tous");

  const filtres = [
    { id: "tous", label: "Tous" },
    { id: "complet", label: "Complets" },
    { id: "doc_manquant", label: "Docs manquants" },
    { id: "en_attente", label: "En attente" },
  ];

  const filtered = CLIENTS.filter(c => {
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
          style={{
            flex: 1, maxWidth: 320, padding: "9px 14px", borderRadius: 8,
            border: "1px solid #E5E5EA", fontSize: 13, background: "#fff", outline: "none"
          }}
        />
        <div style={{ display: "flex", gap: 6 }}>
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
        <button onClick={() => navigate("new-client")}
          style={{
            padding: "9px 16px", borderRadius: 8, background: "#0A84FF",
            border: "none", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer"
          }}>+ Nouveau client</button>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E5EA", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F7F6F3" }}>
              {["Client", "Type de compte", "Pays", "Progression", "Statut", "Tickets", "Action"].map(h => (
                <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(client => (
              <ClientTableRow key={client.id} client={client} navigate={navigate} />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px", color: "#AEAEB2", fontSize: 13 }}>
            Aucun client trouvé
          </div>
        )}
      </div>
    </div>
  );
}

function ClientTableRow({ client, navigate }) {
  const cfg = STATUT_CONFIG[client.statut];
  const openTickets = client.tickets.filter(t => t.statut === "ouvert").length;
  const pct = client.progression;
  const barColor = pct === 100 ? "#30D158" : pct >= 70 ? "#0A84FF" : "#FF9F0A";

  return (
    <tr style={{ borderTop: "1px solid #F2F2F7", cursor: "pointer" }}
      onClick={() => navigate("client-detail", client)}>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar initials={`${client.prenom[0]}${client.nom[0]}`} size={30} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1C1C1E" }}>{client.prenom} {client.nom}</div>
            <div style={{ fontSize: 11, color: "#8E8E93" }}>{client.email}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: "12px 16px", fontSize: 13, color: "#3C3C43" }}>{client.type_compte}</td>
      <td style={{ padding: "12px 16px", fontSize: 13, color: "#3C3C43" }}>{client.pays}</td>
      <td style={{ padding: "12px 16px", minWidth: 120 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 4, background: "#F2F2F7", borderRadius: 99 }}>
            <div style={{ height: 4, width: `${pct}%`, background: barColor, borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: 11, color: "#8E8E93", minWidth: 28 }}>{pct}%</span>
        </div>
      </td>
      <td style={{ padding: "12px 16px" }}><Badge cfg={cfg} /></td>
      <td style={{ padding: "12px 16px" }}>
        {openTickets > 0 ? (
          <span style={{ fontSize: 12, background: "#FFF0EE", color: "#C0392B", padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>
            {openTickets} ouvert{openTickets > 1 ? "s" : ""}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: "#AEAEB2" }}>—</span>
        )}
      </td>
      <td style={{ padding: "12px 16px" }}>
        <button style={{
          fontSize: 12, padding: "5px 10px", borderRadius: 6,
          border: "1px solid #E5E5EA", background: "#fff", cursor: "pointer", color: "#1C1C1E"
        }}>Voir →</button>
      </td>
    </tr>
  );
}
