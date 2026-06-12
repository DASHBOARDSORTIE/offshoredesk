import { useState } from "react";
import { DOCS_LABELS, STATUT_CONFIG } from "../lib/data";
import { Avatar, Badge } from "./Dashboard";

export default function ClientDetail({ client, navigate }) {
  const [activeTab, setActiveTab] = useState("docs");
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [newTicketMsg, setNewTicketMsg] = useState("");
  const [newTicketTitre, setNewTicketTitre] = useState("");

  if (!client) return <div style={{ padding: 40, color: "#8E8E93" }}>Aucun client sélectionné.</div>;

  const cfg = STATUT_CONFIG[client.statut];
  const initials = `${client.prenom[0]}${client.nom[0]}`;

  return (
    <div>
      <button onClick={() => navigate("clients")}
        style={{ fontSize: 13, color: "#0A84FF", background: "none", border: "none", cursor: "pointer", marginBottom: 16, padding: 0 }}>
        ← Retour aux clients
      </button>

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
            <Badge cfg={cfg} />
            <div style={{ fontSize: 11, color: "#8E8E93" }}>
              <span style={{ background: "#F2F2F7", padding: "2px 8px", borderRadius: 6, marginRight: 6 }}>{client.type_compte}</span>
              <span style={{ background: "#F2F2F7", padding: "2px 8px", borderRadius: 6 }}>{client.pays}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
            <span style={{ color: "#8E8E93" }}>Progression du dossier</span>
            <span style={{ fontWeight: 600, color: "#1C1C1E" }}>{client.progression}%</span>
          </div>
          <div style={{ height: 7, background: "#F2F2F7", borderRadius: 99 }}>
            <div style={{
              height: 7, borderRadius: 99, transition: "width 0.5s",
              width: `${client.progression}%`,
              background: client.progression === 100 ? "#30D158" : client.progression >= 70 ? "#0A84FF" : "#FF9F0A"
            }} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { id: "docs", label: "Documents KYC" },
          { id: "tickets", label: `Tickets (${client.tickets.length})` },
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

      {activeTab === "docs" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E5EA", padding: "20px 24px" }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#1C1C1E" }}>Documents requis</div>
          <div style={{ display: "grid", gap: 12 }}>
            {Object.entries(client.docs).map(([key, doc]) => {
              const statCfg = STATUT_CONFIG[doc.statut];
              return (
                <div key={key} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", borderRadius: 10, border: "1px solid #F2F2F7", background: "#FAFAFA"
                }}>
                  <div style={{ fontSize: 22 }}>
                    {doc.statut === "ok" ? "📄" : doc.statut === "manquant" ? "❌" : "⚠️"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#1C1C1E" }}>{DOCS_LABELS[key]}</div>
                    {doc.nom
                      ? <div style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}>{doc.nom} · {doc.date}</div>
                      : <div style={{ fontSize: 11, color: "#FF453A", marginTop: 2 }}>Document non fourni</div>
                    }
                  </div>
                  <Badge cfg={statCfg} />
                  {doc.statut === "manquant" && (
                    <button style={{
                      fontSize: 11, padding: "5px 10px", borderRadius: 6,
                      background: "#0A84FF", color: "#fff", border: "none", cursor: "pointer"
                    }}>Relancer</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "tickets" && (
        <div>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E5EA", padding: "20px 24px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E" }}>Tickets</div>
              <button onClick={() => setNewTicketOpen(!newTicketOpen)}
                style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, background: "#1C1C1E", color: "#fff", border: "none", cursor: "pointer" }}>
                + Créer un ticket
              </button>
            </div>

            {newTicketOpen && (
              <div style={{ background: "#F7F6F3", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, color: "#1C1C1E" }}>Nouveau ticket</div>
                <input placeholder="Titre du ticket"
                  value={newTicketTitre} onChange={e => setNewTicketTitre(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid #E5E5EA", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
                <textarea placeholder="Message au client..."
                  value={newTicketMsg} onChange={e => setNewTicketMsg(e.target.value)}
                  rows={3}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid #E5E5EA", fontSize: 13, resize: "none", boxSizing: "border-box" }} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, background: "#0A84FF", color: "#fff", border: "none", cursor: "pointer" }}>
                    Envoyer
                  </button>
                  <button onClick={() => setNewTicketOpen(false)}
                    style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, background: "none", color: "#8E8E93", border: "1px solid #E5E5EA", cursor: "pointer" }}>
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {client.tickets.length === 0 && (
              <div style={{ textAlign: "center", padding: "24px", color: "#AEAEB2", fontSize: 13 }}>Aucun ticket pour ce client</div>
            )}
            {client.tickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
          </div>
        </div>
      )}

      {activeTab === "infos" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E5EA", padding: "20px 24px" }}>
          <InfoRow label="Nom complet" value={`${client.prenom} ${client.nom}`} />
          <InfoRow label="Email" value={client.email} />
          <InfoRow label="Téléphone" value={client.tel} />
          <InfoRow label="Adresse" value={client.adresse} />
          <InfoRow label="Type de compte" value={client.type_compte} />
          <InfoRow label="Pays / Juridiction" value={client.pays} />
          <InfoRow label="Date de création" value={client.date_creation} />
          <InfoRow label="IBAN" value="En attente d'ouverture" last />
        </div>
      )}
    </div>
  );
}

function TicketCard({ ticket }) {
  const statCfg = STATUT_CONFIG[ticket.statut];
  const prioCfg = STATUT_CONFIG[ticket.priorite];
  return (
    <div style={{ border: "1px solid #F2F2F7", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>{ticket.titre}</div>
          <div style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}>
            {ticket.auteur === "client" ? "Ouvert par le client" : "Votre demande"} · {ticket.date}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Badge cfg={prioCfg} />
          <Badge cfg={statCfg} />
        </div>
      </div>
      <div style={{ fontSize: 13, color: "#3C3C43", background: "#F7F6F3", padding: "10px 12px", borderRadius: 8 }}>
        {ticket.message}
      </div>
      {ticket.statut === "ouvert" && (
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: "#30D158", color: "#fff", border: "none", cursor: "pointer" }}>
            Marquer résolu
          </button>
          <button style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: "none", color: "#0A84FF", border: "1px solid #E5E5EA", cursor: "pointer" }}>
            Répondre
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, last }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 0", borderBottom: last ? "none" : "1px solid #F2F2F7"
    }}>
      <span style={{ fontSize: 13, color: "#8E8E93" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#1C1C1E", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
