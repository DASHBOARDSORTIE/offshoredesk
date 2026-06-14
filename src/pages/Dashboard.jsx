import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Dashboard({ navigate, t, dark }) {
  const [clients, setClients] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [{ data: clientsData }, { data: ticketsData }] = await Promise.all([
      supabase.from("clients").select("*, documents(*), tickets(*)").order("created_at", { ascending: false }),
      supabase.from("tickets").select("*, clients(nom, prenom, pays)").order("created_at", { ascending: false })
    ]);
    setClients(clientsData || []);
    setTickets(ticketsData || []);
    setLoading(false);
  }

  if (!t) t = { bg: "#F7F6F3", card: "#fff", border: "#E5E5EA", text: "#1C1C1E", textSub: "#8E8E93", bgSub: "#F7F6F3" };

  const total = clients.length;
  const complets = clients.filter(c => c.statut === "complet").length;
  const manquants = clients.filter(c => c.statut === "doc_manquant").length;
  const ticketsOuverts = tickets.filter(t => t.statut === "ouvert").length;
  const montantTotal = clients.reduce((sum, c) => sum + (c.montant_investi || 0), 0);

  const recentClients = clients.slice(0, 5);
  const recentTickets = tickets.slice(0, 4);

  const formatMontant = (val) => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(val);

  const COULEURS_AVATAR = ["#0A84FF", "#30D158", "#FF9F0A", "#BF5AF2", "#FF453A"];

  return (
    <div>
      {/* Métriques */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Clients actifs", value: total, sub: "+3 ce mois", color: "#0A84FF", bg: dark ? "#0A84FF11" : "#E8F0FF", emoji: "👥" },
          { label: "Dossiers complets", value: complets, sub: `${total - complets} incomplets`, color: "#30D158", bg: dark ? "#30D15811" : "#E8F9F0", emoji: "✅" },
          { label: "Docs manquants", value: manquants, sub: "Relances à envoyer", color: "#FF9F0A", bg: dark ? "#FF9F0A11" : "#FFF8EC", emoji: "⚠️" },
          { label: "Tickets ouverts", value: ticketsOuverts, sub: "À traiter", color: "#FF453A", bg: dark ? "#FF453A11" : "#FFF0EE", emoji: "🎫" },
        ].map((m, i) => (
          <div key={i} style={{
            background: t.card, borderRadius: 14, padding: "20px 22px",
            border: `1px solid ${t.border}`, position: "relative", overflow: "hidden",
            transition: "all 0.2s"
          }}>
            <div style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: 10, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
              {m.emoji}
            </div>
            <div style={{ fontSize: 12, color: t.textSub, marginBottom: 8, fontWeight: 500 }}>{m.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: m.color, marginBottom: 4, letterSpacing: "-1px" }}>{m.value}</div>
            <div style={{ fontSize: 11, color: t.textSub }}>{m.sub}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${m.color}44, ${m.color})` }} />
          </div>
        ))}
      </div>

      {/* Montant total */}
      <div style={{
        background: dark ? "linear-gradient(135deg, #0A84FF22, #BF5AF222)" : "linear-gradient(135deg, #0A84FF11, #BF5AF211)",
        borderRadius: 14, padding: "20px 24px", marginBottom: 24,
        border: `1px solid ${dark ? "#0A84FF33" : "#0A84FF22"}`,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <div style={{ fontSize: 12, color: t.textSub, marginBottom: 4 }}>💰 Volume total géré</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: t.text, letterSpacing: "-1px" }}>
            {formatMontant(montantTotal)} EUR
          </div>
        </div>
        <div style={{ fontSize: 40 }}>🏦</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Clients récents */}
        <div style={{ background: t.card, borderRadius: 14, padding: "20px 24px", border: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>Clients récents</div>
            <button onClick={() => navigate("clients")}
              style={{ fontSize: 12, color: "#0A84FF", background: "none", border: "none", cursor: "pointer" }}>
              Voir tout →
            </button>
          </div>
          {recentClients.map((client, i) => {
            const initials = `${client.prenom[0]}${client.nom[0]}`;
            const couleur = COULEURS_AVATAR[i % COULEURS_AVATAR.length];
            return (
              <div key={client.id} onClick={() => navigate("client-detail", client)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${t.border}`, cursor: "pointer" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: couleur + "22", color: couleur, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{client.prenom} {client.nom}</div>
                  <div style={{ fontSize: 11, color: t.textSub }}>{client.type_compte} · {client.pays}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span style={{
                    fontSize: 10, padding: "2px 7px", borderRadius: 5, fontWeight: 600,
                    background: client.statut === "complet" ? "#E8F9F0" : client.statut === "en_attente" ? "#FFF8EC" : "#FFF0EE",
                    color: client.statut === "complet" ? "#1A7A4A" : client.statut === "en_attente" ? "#B7660A" : "#C0392B"
                  }}>
                    {client.statut === "complet" ? "Complet" : client.statut === "en_attente" ? "En attente" : "Docs manquants"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tickets */}
        <div style={{ background: t.card, borderRadius: 14, padding: "20px 24px", border: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>Tickets en cours</div>
            <button onClick={() => navigate("tickets")}
              style={{ fontSize: 12, color: "#0A84FF", background: "none", border: "none", cursor: "pointer" }}>
              Voir tout →
            </button>
          </div>
          {recentTickets.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px 0", color: t.textSub, fontSize: 13 }}>Aucun ticket ouvert 🎉</div>
          )}
          {recentTickets.map(ticket => (
            <div key={ticket.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: `1px solid ${t.border}` }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0, background: ticket.priorite === "urgent" ? "#FF453A" : "#0A84FF" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{ticket.titre}</div>
                <div style={{ fontSize: 11, color: t.textSub, marginTop: 2 }}>
                  {ticket.clients?.prenom} {ticket.clients?.nom} · {ticket.auteur === "client" ? "Client" : "Vous"}
                </div>
              </div>
              <span style={{
                fontSize: 10, padding: "2px 7px", borderRadius: 5, fontWeight: 600,
                background: ticket.priorite === "urgent" ? "#FFF0EE" : "#E8F0FF",
                color: ticket.priorite === "urgent" ? "#C0392B" : "#1B4FD8"
              }}>{ticket.priorite === "urgent" ? "Urgent" : "Normal"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progression */}
      <div style={{ background: t.card, borderRadius: 14, padding: "20px 24px", border: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 16 }}>Avancement des dossiers</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 40px" }}>
          {clients.map(c => {
            const pct = c.progression || 0;
            const color = pct === 100 ? "#30D158" : pct >= 70 ? "#0A84FF" : pct >= 40 ? "#FF9F0A" : "#FF453A";
            return (
              <div key={c.id} onClick={() => navigate("client-detail", c)}
                style={{ cursor: "pointer", padding: "6px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: t.text, fontWeight: 500 }}>{c.prenom} {c.nom}</span>
                  <span style={{ color: t.textSub }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: t.bgSub, borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: 6, width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}