import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { signOut } from "../lib/auth";

export default function ClientPortal({ user, onLogout }) {
  const [client, setClient] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState("docs");
  const [newTicket, setNewTicket] = useState(false);
  const [ticketTitre, setTicketTitre] = useState("");
  const [ticketMsg, setTicketMsg] = useState("");

  useEffect(() => { loadClientData(); }, []);

  async function loadClientData() {
    const { data } = await supabase
      .from("clients")
      .select("*, documents(*), tickets(*)")
      .eq("user_id", user.id)
      .single();
    if (data) {
      setClient(data);
      setTickets(data.tickets || []);
    }
  }

  async function envoyerTicket() {
    if (!ticketTitre || !ticketMsg) return;
    await supabase.from("tickets").insert([{
      client_id: client.id,
      titre: ticketTitre,
      message: ticketMsg,
      auteur: "client",
      statut: "ouvert",
      priorite: "normal"
    }]);
    setTicketTitre("");
    setTicketMsg("");
    setNewTicket(false);
    loadClientData();
  }

  const DOCS_LABELS = {
    cni_recto: "CNI — Recto",
    cni_verso: "CNI — Verso",
    passeport: "Passeport",
    justif_dom: "Justificatif de domicile",
    releve_banque: "Relevé bancaire",
    avis_impot: "Avis d'imposition",
    selfie: "Selfie de vérification",
  };

  const DOCS_REQUIS = [
    { type: "cni_recto", label: "CNI — Recto", icon: "🪪", info: "Face avant" },
    { type: "cni_verso", label: "CNI — Verso", icon: "🔄", info: "Face arrière" },
    { type: "justif_dom", label: "Justificatif de domicile", icon: "🏠", info: "Moins de 3 mois" },
    { type: "releve_banque", label: "Relevé bancaire (3 mois)", icon: "🏦", info: "3 derniers mois" },
    { type: "avis_impot", label: "Avis d'imposition", icon: "📑", info: "Dernier avis" },
    { type: "selfie", label: "Selfie de vérification", icon: "🤳", info: "CNI + date du jour" },
  ];

  if (!client) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F6F3" }}>
      <div style={{ fontSize: 14, color: "#8E8E93" }}>Chargement de votre dossier...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F3", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: "#1C1C1E", padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>OffshoreDesk</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#8E8E93", fontSize: 13 }}>{user.email}</span>
          <button onClick={async () => { await signOut(); onLogout(); }}
            style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: "none", border: "1px solid #3C3C3E", color: "#8E8E93", cursor: "pointer" }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "32px auto", padding: "0 20px" }}>
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E5EA", padding: "24px 28px", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1C1C1E", marginBottom: 4 }}>Bonjour {client.prenom} 👋</div>
          <div style={{ fontSize: 13, color: "#8E8E93", marginBottom: 16 }}>{client.type_compte} · {client.pays}</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
            <span style={{ color: "#8E8E93" }}>Progression de votre dossier</span>
            <span style={{ fontWeight: 600 }}>{client.progression}%</span>
          </div>
          <div style={{ height: 7, background: "#F2F2F7", borderRadius: 99 }}>
            <div style={{ height: 7, borderRadius: 99, background: client.progression === 100 ? "#30D158" : "#0A84FF", width: `${client.progression}%` }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[{ id: "docs", label: "Mes documents" }, { id: "tickets", label: `Mes tickets (${tickets.length})` }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "1px solid", cursor: "pointer", borderColor: activeTab === tab.id ? "#1C1C1E" : "#E5E5EA", background: activeTab === tab.id ? "#1C1C1E" : "#fff", color: activeTab === tab.id ? "#fff" : "#8E8E93" }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "docs" && (
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E5EA", padding: "20px 24px" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E", marginBottom: 16 }}>Vos documents</div>
            {DOCS_REQUIS.map(doc => {
              const existing = (client.documents || []).find(d => d.type === doc.type);
              return (
                <UploadDoc
                  key={doc.type}
                  doc={doc}
                  existing={existing}
                  clientId={client.id}
                  onUploaded={loadClientData}
                />
              );
            })}
          </div>
        )}

        {activeTab === "tickets" && (
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E5EA", padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E" }}>Vos tickets</div>
              <button onClick={() => setNewTicket(!newTicket)}
                style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, background: "#1C1C1E", color: "#fff", border: "none", cursor: "pointer" }}>
                + Nouveau ticket
              </button>
            </div>

            {newTicket && (
              <div style={{ background: "#F7F6F3", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <input placeholder="Sujet" value={ticketTitre} onChange={e => setTicketTitre(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid #E5E5EA", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
                <textarea placeholder="Votre message..." value={ticketMsg} onChange={e => setTicketMsg(e.target.value)} rows={3}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid #E5E5EA", fontSize: 13, resize: "none", boxSizing: "border-box" }} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={envoyerTicket}
                    style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, background: "#0A84FF", color: "#fff", border: "none", cursor: "pointer" }}>
                    Envoyer
                  </button>
                  <button onClick={() => setNewTicket(false)}
                    style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, background: "none", color: "#8E8E93", border: "1px solid #E5E5EA", cursor: "pointer" }}>
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {tickets.map(ticket => (
              <div key={ticket.id} style={{ border: "1px solid #F2F2F7", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>{ticket.titre}</div>
                  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 500, background: ticket.statut === "resolu" ? "#E8F9F0" : "#FFF8EC", color: ticket.statut === "resolu" ? "#1A7A4A" : "#B7660A" }}>
                    {ticket.statut === "resolu" ? "Résolu" : "En cours"}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "#3C3C43", background: "#F7F6F3", padding: "10px 12px", borderRadius: 8 }}>{ticket.message}</div>
                <div style={{ fontSize: 11, color: "#AEAEB2", marginTop: 6 }}>{ticket.created_at?.slice(0, 10)}</div>
              </div>
            ))}

            {tickets.length === 0 && !newTicket && (
              <div style={{ textAlign: "center", padding: "24px", color: "#AEAEB2", fontSize: 13 }}>Aucun ticket ouvert</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function UploadDoc({ doc, existing, clientId, onUploaded }) {
  const [loading, setLoading] = useState(false);
  const statut = existing?.statut || "manquant";

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${clientId}/${doc.type}_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("documents").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);

      await supabase.from("documents").upsert([{
        client_id: clientId,
        type: doc.type,
        nom_fichier: file.name,
        url: urlData.publicUrl,
        statut: "ok",
        uploaded_at: new Date().toISOString(),
      }], { onConflict: "client_id,type" });

      onUploaded();
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid #F2F2F7" }}>
      <div style={{ fontSize: 20 }}>{statut === "ok" ? "✅" : statut === "expire" ? "⚠️" : "❌"}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#1C1C1E" }}>{doc.label}</div>
        <div style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}>
          {existing?.nom_fichier || doc.info}
        </div>
      </div>
      <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 500, background: statut === "ok" ? "#E8F9F0" : statut === "expire" ? "#FFF8EC" : "#FFF0EE", color: statut === "ok" ? "#1A7A4A" : statut === "expire" ? "#B7660A" : "#C0392B" }}>
        {statut === "ok" ? "Reçu" : statut === "expire" ? "Expiré" : "Manquant"}
      </span>
      <label style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: "#0A84FF", color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>
        <input type="file" onChange={handleFile} style={{ display: "none" }} accept=".pdf,.jpg,.jpeg,.png" />
        {loading ? "⏳" : statut === "ok" ? "Remplacer" : "Uploader"}
      </label>
    </div>
  );
}