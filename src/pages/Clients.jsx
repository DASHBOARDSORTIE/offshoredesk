import { useState, useEffect } from "react";
import { STATUT_CONFIG } from "../lib/data";
import { supabase } from "../lib/supabase";

export default function Clients({ navigate, t }) {
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);

  if (!t) t = { card: "#fff", border: "#E5E5EA", text: "#1C1C1E", textSub: "#8E8E93", bgSub: "#F7F6F3" };

  useEffect(() => { loadClients(); }, []);

  async function loadClients() {
    const { data } = await supabase
      .from("clients")
      .select("*, tickets(*)")
      .order("created_at", { ascending: false });
    setClients(data || []);
    setLoading(false);
  }

  async function gelerClient(id, gele) {
    await supabase.from("clients").update({ gele: !gele }).eq("id", id);
    await loadClients();
    setConfirmAction(null);
  }

  async function supprimerClient(id) {
    await supabase.from("clients").delete().eq("id", id);
    await loadClients();
    setConfirmAction(null);
  }

  const filtres = [
    { id: "tous", label: "Tous" },
    { id: "complet", label: "Complets" },
    { id: "doc_manquant", label: "Docs manquants" },
    { id: "en_attente", label: "En attente" },
    { id: "gele", label: "❄️ Gelés" },
  ];

  const filtered = clients.filter(c => {
    const matchSearch = `${c.prenom} ${c.nom} ${c.email} ${c.pays}`.toLowerCase().includes(search.toLowerCase());
    const matchFiltre = filtre === "tous" || (filtre === "gele" ? c.gele : c.statut === filtre);
    return matchSearch && matchFiltre;
  });

  return (
    <div>
      {/* Modal confirmation */}
      {confirmAction && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 32, marginBottom: 12, textAlign: "center" }}>
              {confirmAction.type === "supprimer" ? "🗑️" : confirmAction.gele ? "🔓" : "❄️"}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1C1C1E", marginBottom: 8, textAlign: "center" }}>
              {confirmAction.type === "supprimer"
                ? "Supprimer ce client ?"
                : confirmAction.gele ? "Dégeler ce compte ?" : "Geler ce compte ?"}
            </div>
            <div style={{ fontSize: 13, color: "#8E8E93", marginBottom: 24, textAlign: "center" }}>
              {confirmAction.type === "supprimer"
                ? `Le dossier de ${confirmAction.nom} sera définitivement supprimé avec tous ses documents et tickets.`
                : confirmAction.gele
                ? `${confirmAction.nom} pourra de nouveau accéder à son espace.`
                : `${confirmAction.nom} ne pourra plus accéder à son espace client.`}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmAction(null)}
                style={{ flex: 1, padding: "10px", borderRadius: 9, background: "#fff", color: "#1C1C1E", border: "1px solid #E5E5EA", fontSize: 13, cursor: "pointer" }}>
                Annuler
              </button>
              <button onClick={() => {
                if (confirmAction.type === "supprimer") supprimerClient(confirmAction.id);
                else gelerClient(confirmAction.id, confirmAction.gele);
              }}
                style={{ flex: 1, padding: "10px", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", background: confirmAction.type === "supprimer" ? "#FF453A" : confirmAction.gele ? "#30D158" : "#0A84FF", color: "#fff" }}>
                {confirmAction.type === "supprimer" ? "Supprimer" : confirmAction.gele ? "Dégeler" : "Geler"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
        <input
          placeholder="Rechercher un client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 320, padding: "9px 14px", borderRadius: 8, border: `1px solid ${t.border}`, fontSize: 13, background: t.card, outline: "none", color: t.text }}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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

      {loading && <div style={{ textAlign: "center", padding: 40, color: t.textSub }}>Chargement...</div>}

      <div style={{ background: t.card, borderRadius: 12, border: `1px solid ${t.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: t.bgSub }}>
              {["Client", "Type", "Pays", "Progression", "Statut", "Actions"].map(h => (
                <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: t.textSub, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(client => {
              const cfg = STATUT_CONFIG[client.statut];
              const pct = client.progression || 0;
              const barColor = pct === 100 ? "#30D158" : pct >= 70 ? "#0A84FF" : "#FF9F0A";
              const initials = `${client.prenom[0]}${client.nom[0]}`;
              const COULEURS = ["#0A84FF", "#30D158", "#FF9F0A", "#BF5AF2", "#FF453A"];
              const couleur = COULEURS[initials.charCodeAt(0) % COULEURS.length];

              return (
                <tr key={client.id} style={{ borderTop: `1px solid ${t.border}`, opacity: client.gele ? 0.5 : 1 }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                      onClick={() => navigate("client-detail", client)}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: couleur + "22", color: couleur, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: t.text, display: "flex", alignItems: "center", gap: 6 }}>
                          {client.prenom} {client.nom}
                          {client.gele && <span style={{ fontSize: 10, background: "#E8F0FF", color: "#1B4FD8", padding: "1px 6px", borderRadius: 4 }}>❄️ Gelé</span>}
                        </div>
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
                  <td style={{ padding: "12px 16px" }}>
                    {cfg && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 500, background: cfg.bg, color: cfg.color, whiteSpace: "nowrap" }}>{cfg.label}</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => navigate("client-detail", client)}
                        style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: `1px solid ${t.border}`, background: t.card, cursor: "pointer", color: t.text }}>
                        Voir
                      </button>
                      <button onClick={() => setConfirmAction({ type: "geler", id: client.id, nom: `${client.prenom} ${client.nom}`, gele: client.gele })}
                        style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "none", background: client.gele ? "#E8F9F0" : "#E8F0FF", cursor: "pointer", color: client.gele ? "#1A7A4A" : "#1B4FD8" }}>
                        {client.gele ? "🔓 Dégeler" : "❄️ Geler"}
                      </button>
                      <button onClick={() => setConfirmAction({ type: "supprimer", id: client.id, nom: `${client.prenom} ${client.nom}` })}
                        style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "none", background: "#FFF0EE", cursor: "pointer", color: "#C0392B" }}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "32px", color: t.textSub, fontSize: 13 }}>
            Aucun client trouvé
          </div>
        )}
      </div>
    </div>
  );
}