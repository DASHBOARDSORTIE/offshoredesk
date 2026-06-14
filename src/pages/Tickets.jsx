import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { STATUT_CONFIG } from "../lib/data";

export default function Tickets({ navigate, t }) {
  const [filtre, setFiltre] = useState("tous");
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!t) t = { card: "#fff", border: "#E5E5EA", text: "#1C1C1E", textSub: "#8E8E93", bgSub: "#F7F6F3" };

  useEffect(() => { loadTickets(); }, []);

  async function loadTickets() {
    const { data } = await supabase
      .from("tickets")
      .select("*, clients(id, nom, prenom, pays, type_compte)")
      .order("created_at", { ascending: false });
    setAllTickets(data || []);
    setLoading(false);
  }

  async function marquerResolu(id) {
    await supabase.from("tickets").update({ statut: "resolu" }).eq("id", id);
    loadTickets();
  }

  const filtres = [
    { id: "tous", label: `Tous (${allTickets.length})` },
    { id: "ouvert", label: `Ouverts (${allTickets.filter(t => t.statut === "ouvert").length})` },
    { id: "urgent", label: `Urgents (${allTickets.filter(t => t.priorite === "urgent").length})` },
    { id: "admin", label: "Mes demandes" },
    { id: "resolu", label: `Résolus (${allTickets.filter(t => t.statut === "resolu").length})` },
  ];

  const filtered = allTickets.filter(ticket => {
    if (filtre === "tous") return true;
    if (filtre === "ouvert") return ticket.statut === "ouvert";
    if (filtre === "resolu") return ticket.statut === "resolu";
    if (filtre === "urgent") return ticket.priorite === "urgent";
    if (filtre === "admin") return ticket.auteur === "admin";
    return true;
  });

  const stats = {
    ouverts: allTickets.filter(t => t.statut === "ouvert").length,
    urgents: allTickets.filter(t => t.priorite === "urgent" && t.statut === "ouvert").length,
    resolus: allTickets.filter(t => t.statut === "resolu").length,
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Tickets ouverts", value: stats.ouverts, color: "#FF9F0A" },
          { label: "Urgents", value: stats.urgents, color: "#FF453A" },
          { label: "Résolus", value: stats.resolus, color: "#30D158" },
        ].map((s, i) => (
          <div key={i} style={{ background: t.card, borderRadius: 12, padding: "16px 20px", border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 12, color: t.textSub, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
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

      {loading && <div style={{ textAlign: "center", padding: 40, color: t.textSub, fontSize: 13 }}>Chargement...</div>}

      <div style={{ display: "grid", gap: 12 }}>
        {filtered.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: 40, color: t.textSub, fontSize: 13, background: t.card, borderRadius: 12, border: `1px solid ${t.border}` }}>
            Aucun ticket dans cette catégorie
          </div>
        )}
        {filtered.map(ticket => (
          <div key={ticket.id} style={{ background: t.card, borderRadius: 12, border: `1px solid ${t.border}`, padding: "18px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#0A84FF22", color: "#0A84FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                  {ticket.clients?.prenom?.[0]}{ticket.clients?.nom?.[0]}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{ticket.titre}</div>
                  <div style={{ fontSize: 11, color: t.textSub, marginTop: 2 }}>
                    {ticket.clients?.prenom} {ticket.clients?.nom} · {ticket.clients?.pays} · {ticket.created_at?.slice(0, 10)}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: t.textSub }}>{ticket.auteur === "client" ? "Client" : "Vous"}</span>
                <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 500, background: ticket.priorite === "urgent" ? "#FFF0EE" : "#E8F0FF", color: ticket.priorite === "urgent" ? "#C0392B" : "#1B4FD8" }}>
                  {ticket.priorite === "urgent" ? "Urgent" : "Normal"}
                </span>
                <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 500, background: ticket.statut === "resolu" ? "#E8F9F0" : "#FFF8EC", color: ticket.statut === "resolu" ? "#1A7A4A" : "#B7660A" }}>
                  {ticket.statut === "resolu" ? "Résolu" : "Ouvert"}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: t.textSub, background: t.bgSub, padding: "10px 14px", borderRadius: 8, marginBottom: 12 }}>
              {ticket.message}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => navigate("client-detail", ticket.clients)}
                style={{ fontSize: 12, padding: "6px 12px", borderRadius: 7, background: "none", border: `1px solid ${t.border}`, cursor: "pointer", color: t.text }}>
                Voir le dossier →
              </button>
              {ticket.statut === "ouvert" && (
                <button onClick={() => marquerResolu(ticket.id)}
                  style={{ fontSize: 12, padding: "6px 12px", borderRadius: 7, background: "#30D158", color: "#fff", border: "none", cursor: "pointer" }}>
                  Marquer résolu
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}