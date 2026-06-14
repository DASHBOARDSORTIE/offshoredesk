import { useState, useEffect } from "react";
import { DOCS_LABELS, STATUT_CONFIG } from "../lib/data";
import { Avatar, Badge } from "./Dashboard";
import { supabase } from "../lib/supabase";

export default function ClientDetail({ client, navigate }) {
  const [activeTab, setActiveTab] = useState("docs");
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [newTicketMsg, setNewTicketMsg] = useState("");
  const [newTicketTitre, setNewTicketTitre] = useState("");
  const [notesInternes, setNotesInternes] = useState(client?.notes_internes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [statuts, setStatuts] = useState([]);
  const [statutSelectionne, setStatutSelectionne] = useState(client?.statut_custom || "");
  const [tickets, setTickets] = useState(client?.tickets || []);
  const [docs, setDocs] = useState(client?.documents || []);

  useEffect(() => {
    loadStatuts();
  }, []);

  async function loadStatuts() {
    const { data } = await supabase.from("statuts").select("*").order("ordre");
    if (data) setStatuts(data);
  }

  async function sauvegarderNotes() {
    setSavingNotes(true);
    await supabase.from("clients").update({ notes_internes: notesInternes }).eq("id", client.id);
    setSavingNotes(false);
  }

  async function changerStatut(statut) {
    setStatutSelectionne(statut);
    await supabase.from("clients").update({ statut_custom: statut }).eq("id", client.id);
  }

  async function creerTicket() {
    if (!newTicketTitre || !newTicketMsg) return;
    await supabase.from("tickets").insert([{
      client_id: client.id,
      titre: newTicketTitre,
      message: newTicketMsg,
      auteur: "admin",
      statut: "ouvert",
      priorite: "normal"
    }]);
    setNewTicketTitre("");
    setNewTicketMsg("");
    setNewTicketOpen(false);
    const { data } = await supabase.from("tickets").select("*").eq("client_id", client.id);
    setTickets(data || []);
  }

  async function marquerResolu(ticketId) {
    await supabase.from("tickets").update({ statut: "resolu" }).eq("id", ticketId);
    const { data } = await supabase.from("tickets").select("*").eq("client_id", client.id);
    setTickets(data || []);
  }

  if (!client) return <div style={{ padding: 40, color: "#8E8E93" }}>Aucun client sélectionné.</div>;

  const cfg = STATUT_CONFIG[client.statut];
  const initials = `${client.prenom[0]}${client.nom[0]}`;

  const statutActuel = statuts.find(s => s.nom === statutSelectionne);

  return (
    <div>
      <button onClick={() => navigate("clients")}
        style={{ fontSize: 13, color: "#0A84FF", background: "none", border: "none", cursor: "pointer", marginBottom: 16, padding: 0 }}>
        ← Retour aux clients
      </button>

      {/* Header client */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E5EA", padding: "24px 28px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Avatar initials={initials} size={52} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1C1C1E" }}>{client.prenom} {client.nom}</div>
              <div style={{ fontSize: 13, color: "#8E8E93", marginTop: 2 }}>{client.email} · {client.tel}</div>
              <div style={{ fontSize: 12, color: "#AEAEB2", marginTop: 4 }}>{client.adresse}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ background: "#F2F2F7", padding: "2px 8px", borderRadius: 6, fontSize: 11 }}>{client.type_compte}</span>
              <span style={{ background: "#F2F2F7", padding: "2px 8px", borderRadius: 6, fontSize: 11 }}>{client.pays}</span>
            </div>
            {statutActuel && (
              <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, fontWeight: 500, background: statutActuel.couleur + "22", color: statutActuel.couleur }}>
                {statutActuel.nom}
              </span>
            )}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
            <span style={{ color: "#8E8E93" }}>Progression du dossier</span>
            <span style={{ fontWeight: 600, color: "#1C1C1E" }}>{client.progression}%</span>
          </div>
          <div style={{ height: 7, background: "#F2F2F7", borderRadius: 99 }}>
            <div style={{ height: 7, borderRadius: 99, transition: "width 0.5s", width: `${client.progression}%`, background: client.progression === 100 ? "#30D158" : client.progression >= 70 ? "#0A84FF" : "#FF9F0A" }} />
          </div>
        </div>
      </div>

      {/* Statuts personnalisés */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E5EA", padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E", marginBottom: 12 }}>Statut du dossier</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {statuts.map(s => (
            <button key={s.id} onClick={() => changerStatut(s.nom)}
              style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer",
                border: `2px solid ${statutSelectionne === s.nom ? s.couleur : "#E5E5EA"}`,
                background: statutSelectionne === s.nom ? s.couleur + "22" : "#fff",
                color: statutSelectionne === s.nom ? s.couleur : "#8E8E93"
              }}>{s.nom}</button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { id: "docs", label: "Documents KYC" },
          { id: "tickets", label: `Tickets (${tickets.length})` },
          { id: "notes", label: "Notes internes" },
          { id: "infos", label: "Informations" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              border: "1px solid", cursor: "pointer",
              borderColor: activeTab === tab.id ? "#1C1C1E" : "#E5E5EA",
              background: activeTab === tab.id ? "#1C1C1E" : "#fff",
              color: activeTab === tab.id ? "#fff" : "#8E8E93"
            }}>{tab.label}</button>
        ))}
      </div>

      {/* Documents */}
      {activeTab === "docs" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E5EA", padding: "20px 24px" }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#1C1C1E" }}>Documents requis</div>
          <div style={{ display: "grid", gap: 12 }}>
            {Object.entries(DOCS_LABELS).map(([key, label]) => {
              const doc = docs.find(d => d.type === key);
              const statut = doc?.statut || "manquant";
              const statCfg = STATUT_CONFIG[statut];
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10, border: "1px solid #F2F2F7", background: "#FAFAFA" }}>
                  <div style={{ fontSize: 22 }}>{statut === "ok" ? "📄" : statut === "manquant" ? "❌" : "⚠️"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#1C1C1E" }}>{label}</div>
                    {doc?.nom_fichier
                      ? <div style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}>{doc.nom_fichier}</div>
                      : <div style={{ fontSize: 11, color: "#FF453A", marginTop: 2 }}>Document non fourni</div>
                    }
                  </div>
                  {doc?.url && (
                    <a href={doc.url} target="_blank" rel="noreferrer"
                      style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: "#0A84FF", color: "#fff", textDecoration: "none" }}>
                      Télécharger
                    </a>
                  )}
                  <Badge cfg={statCfg} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tickets */}
      {activeTab === "tickets" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E5EA", padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E" }}>Tickets</div>
            <button onClick={() => setNewTicketOpen(!newTicketOpen)}
              style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, background: "#1C1C1E", color: "#fff", border: "none", cursor: "pointer" }}>
              + Créer un ticket
            </button>
          </div>

          {newTicketOpen && (
            <div style={{ background: "#F7F6F3", borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <input placeholder="Titre du ticket" value={newTicketTitre} onChange={e => setNewTicketTitre(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid #E5E5EA", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
              <textarea placeholder="Message au client..." value={newTicketMsg} onChange={e => setNewTicketMsg(e.target.value)} rows={3}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid #E5E5EA", fontSize: 13, resize: "none", boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={creerTicket} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, background: "#0A84FF", color: "#fff", border: "none", cursor: "pointer" }}>Envoyer</button>
                <button onClick={() => setNewTicketOpen(false)} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, background: "none", color: "#8E8E93", border: "1px solid #E5E5EA", cursor: "pointer" }}>Annuler</button>
              </div>
            </div>
          )}

          {tickets.length === 0 && <div style={{ textAlign: "center", padding: "24px", color: "#AEAEB2", fontSize: 13 }}>Aucun ticket</div>}
          {tickets.map(ticket => (
            <div key={ticket.id} style={{ border: "1px solid #F2F2F7", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>{ticket.titre}</div>
                  <div style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}>
                    {ticket.auteur === "client" ? "Ouvert par le client" : "Votre demande"} · {ticket.created_at?.slice(0, 10)}
                  </div>
                </div>
                <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 500, background: ticket.statut === "resolu" ? "#E8F9F0" : "#FFF8EC", color: ticket.statut === "resolu" ? "#1A7A4A" : "#B7660A" }}>
                  {ticket.statut === "resolu" ? "Résolu" : "Ouvert"}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "#3C3C43", background: "#F7F6F3", padding: "10px 12px", borderRadius: 8 }}>{ticket.message}</div>
              {ticket.statut === "ouvert" && (
                <button onClick={() => marquerResolu(ticket.id)}
                  style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: "#30D158", color: "#fff", border: "none", cursor: "pointer", marginTop: 8 }}>
                  Marquer résolu
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Notes internes */}
      {activeTab === "notes" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E5EA", padding: "20px 24px" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E", marginBottom: 6 }}>Notes internes</div>
          <div style={{ fontSize: 12, color: "#8E8E93", marginBottom: 16 }}>Visibles uniquement par vous — le client ne les voit pas</div>
          <textarea
            value={notesInternes}
            onChange={e => setNotesInternes(e.target.value)}
            placeholder="Ex: Client contacté le 12/06, en attente de son relevé bancaire BNP..."
            rows={8}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #E5E5EA", fontSize: 13, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
          />
          <button onClick={sauvegarderNotes} disabled={savingNotes}
            style={{ marginTop: 12, padding: "9px 20px", borderRadius: 8, background: savingNotes ? "#AEAEB2" : "#1C1C1E", color: "#fff", border: "none", fontSize: 13, fontWeight: 500, cursor: savingNotes ? "default" : "pointer" }}>
            {savingNotes ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      )}

      {/* Infos */}
      {activeTab === "infos" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E5EA", padding: "20px 24px" }}>
          {[
            { label: "Nom complet", value: `${client.prenom} ${client.nom}` },
            { label: "Email", value: client.email },
            { label: "Téléphone", value: client.tel },
            { label: "Adresse", value: client.adresse },
            { label: "Type de compte", value: client.type_compte },
            { label: "Pays / Juridiction", value: client.pays },
            { label: "Date de création", value: client.created_at?.slice(0, 10) },
          ].map(({ label, value }, i, arr) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid #F2F2F7" : "none" }}>
              <span style={{ fontSize: 13, color: "#8E8E93" }}>{label}</span>
              <span style={{ fontSize: 13, color: "#1C1C1E", fontWeight: 500 }}>{value || "—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}