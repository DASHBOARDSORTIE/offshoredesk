import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { signOut } from "../lib/auth";
import Agenda from "./Agenda";
import FloatingChat from "./FloatingChat";

export default function ClientPortal({ user, onLogout }) {
  const [profil, setProfil] = useState(null);
  const [dossiers, setDossiers] = useState([]);
  const [activeTab, setActiveTab] = useState("dossiers");
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewDossier, setShowNewDossier] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const theme = {
    bg: darkMode ? "#0D0D0F" : "#F7F6F3",
    card: darkMode ? "#1C1C1E" : "#fff",
    border: darkMode ? "#2C2C2E" : "#E5E5EA",
    text: darkMode ? "#fff" : "#1C1C1E",
    textSub: darkMode ? "#8E8E93" : "#8E8E93",
    bgSub: darkMode ? "#2C2C2E" : "#F7F6F3",
    nav: darkMode ? "#000" : "#1C1C1E",
  };

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data: profilData } = await supabase
      .from("profils").select("*").eq("user_id", user.id).maybeSingle();
    if (profilData) {
      setProfil(profilData);
      const { data: dossiersData } = await supabase
        .from("clients").select("*, tickets(*)")
        .eq("profil_id", profilData.id).order("created_at", { ascending: false });
      setDossiers(dossiersData || []);
    }
    setLoading(false);
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg }}>
      <div style={{ fontSize: 14, color: "#8E8E93" }}>Chargement...</div>
    </div>
  );

  if (!profil) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg }}>
      <div style={{ background: theme.card, borderRadius: 16, padding: "40px 36px", width: 400, border: `1px solid ${theme.border}`, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 8 }}>Profil en cours de création</div>
        <div style={{ fontSize: 14, color: theme.textSub, marginBottom: 24 }}>Votre espace client sera actif dans quelques instants.</div>
        <button onClick={async () => { await signOut(); onLogout(); }}
          style={{ fontSize: 13, color: "#8E8E93", background: "none", border: "none", cursor: "pointer" }}>
          Se déconnecter
        </button>
      </div>
    </div>
  );

  if (selectedDossier) return (
    <DossierDetail
      dossier={selectedDossier}
      user={user}
      profil={profil}
      onBack={() => { setSelectedDossier(null); loadData(); }}
      onLogout={onLogout}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      theme={theme}
    />
  );

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: theme.nav, padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>OffshoreDesk</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => setDarkMode(!darkMode)}
            style={{ fontSize: 16, background: "none", border: "none", cursor: "pointer" }}>
            {darkMode ? "☀️" : "🌙"}
          </button>
          <span style={{ color: "#8E8E93", fontSize: 13 }}>{profil.prenom} {profil.nom}</span>
          <button onClick={async () => { await signOut(); onLogout(); }}
            style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: "none", border: "1px solid #3C3C3E", color: "#8E8E93", cursor: "pointer" }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 750, margin: "32px auto", padding: "0 20px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[
            { id: "dossiers", label: "Mes dossiers" },
            { id: "agenda", label: "📅 Prendre RDV" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                border: `1px solid ${activeTab === tab.id ? theme.text : theme.border}`,
                cursor: "pointer",
                background: activeTab === tab.id ? theme.text : theme.card,
                color: activeTab === tab.id ? (darkMode ? "#000" : "#fff") : theme.textSub
              }}>{tab.label}</button>
          ))}
        </div>

        {activeTab === "dossiers" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: theme.text }}>Bonjour {profil.prenom} 👋</div>
              <button onClick={() => setShowNewDossier(true)}
                style={{ padding: "8px 16px", borderRadius: 8, background: "#0A84FF", color: "#fff", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                + Nouvelle demande
              </button>
            </div>

            {showNewDossier && (
              <NouveauDossier profil={profil} theme={theme}
                onCreated={() => { setShowNewDossier(false); loadData(); }}
                onCancel={() => setShowNewDossier(false)} />
            )}

            {dossiers.length === 0 && !showNewDossier && (
              <div style={{ background: theme.card, borderRadius: 14, border: `1px solid ${theme.border}`, padding: "40px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, marginBottom: 8 }}>Aucune demande en cours</div>
                <div style={{ fontSize: 13, color: theme.textSub, marginBottom: 20 }}>Créez votre première demande d'ouverture de compte</div>
                <button onClick={() => setShowNewDossier(true)}
                  style={{ padding: "10px 20px", borderRadius: 9, background: "#1C1C1E", color: "#fff", border: "none", fontSize: 13, cursor: "pointer" }}>
                  + Nouvelle demande
                </button>
              </div>
            )}

            <div style={{ display: "grid", gap: 12 }}>
              {dossiers.map(dossier => (
                <div key={dossier.id} onClick={() => setSelectedDossier(dossier)}
                  style={{ background: theme.card, borderRadius: 12, border: `1px solid ${theme.border}`, padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#F0F7FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {dossier.beneficiaire === "autre" ? "👤" : "🪪"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>
                      {dossier.beneficiaire === "autre"
                        ? `${dossier.beneficiaire_prenom} ${dossier.beneficiaire_nom}`
                        : `${dossier.prenom} ${dossier.nom}`}
                    </div>
                    <div style={{ fontSize: 12, color: theme.textSub, marginTop: 2 }}>
                      {dossier.type_compte} · {dossier.pays}
                      {dossier.beneficiaire === "autre" && <span style={{ marginLeft: 8, background: "#F0F7FF", color: "#0A84FF", padding: "1px 6px", borderRadius: 4, fontSize: 11 }}>Tiers</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span style={{
                      fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 500,
                      background: dossier.statut === "complet" ? "#E8F9F0" : dossier.statut === "en_attente" ? "#FFF8EC" : "#FFF0EE",
                      color: dossier.statut === "complet" ? "#1A7A4A" : dossier.statut === "en_attente" ? "#B7660A" : "#C0392B"
                    }}>
                      {dossier.statut === "complet" ? "Complet" : dossier.statut === "en_attente" ? "En attente" : "Doc manquant"}
                    </span>
                    <div style={{ fontSize: 11, color: theme.textSub }}>{dossier.progression}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "agenda" && (
          <div style={{ background: theme.card, borderRadius: 14, border: `1px solid ${theme.border}`, padding: "20px 24px" }}>
            <Agenda user={user} isAdmin={false} />
          </div>
        )}
      </div>

      {dossiers.length > 0 && (
        <FloatingChat isAdmin={false} clientId={dossiers[0]?.id} clientNom={`${profil.prenom} ${profil.nom}`} />
      )}
    </div>
  );
}

function NouveauDossier({ profil, onCreated, onCancel, theme }) {
  const [beneficiaire, setBeneficiaire] = useState("soi-meme");
  const [benefNom, setBenefNom] = useState("");
  const [benefPrenom, setBenefPrenom] = useState("");
  const [typeCompte, setTypeCompte] = useState("");
  const [pays, setPays] = useState("");
  const [loading, setLoading] = useState(false);
  const PAYS = [
    { nom: "Belgique", flag: "🇧🇪" },
    { nom: "Malte", flag: "🇲🇹" },
    { nom: "Hollande", flag: "🇳🇱" },
    { nom: "Estonie", flag: "🇪🇪" },
  ];

  async function creer() {
    if (!typeCompte || !pays) return alert("Veuillez choisir un type de compte et un pays");
    if (beneficiaire === "autre" && (!benefNom || !benefPrenom)) return alert("Veuillez renseigner le nom et prénom du bénéficiaire");
    setLoading(true);
    try {
      const { data: newClient } = await supabase.from("clients").insert([{
        profil_id: profil.id,
        nom: beneficiaire === "autre" ? benefNom : profil.nom,
        prenom: beneficiaire === "autre" ? benefPrenom : profil.prenom,
        email: profil.email,
        tel: profil.tel,
        type_compte: typeCompte,
        pays,
        beneficiaire,
        beneficiaire_nom: beneficiaire === "autre" ? benefNom : null,
        beneficiaire_prenom: beneficiaire === "autre" ? benefPrenom : null,
        statut: "doc_manquant",
        progression: 0,
      }]).select().single();

      if (newClient) {
        await supabase.from("timeline").insert([{
          client_id: newClient.id,
          type: "creation",
          description: `Dossier créé — ${typeCompte} · ${pays}`,
          auteur: "client"
        }]);
      }
      onCreated();
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: theme.card, borderRadius: 14, border: `1px solid ${theme.border}`, padding: "24px", marginBottom: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, marginBottom: 20 }}>Nouvelle demande d'ouverture</div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: theme.textSub, marginBottom: 8 }}>Ce compte est pour :</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[{ id: "soi-meme", label: "Moi-même", icon: "🪪" }, { id: "autre", label: "Une autre personne", icon: "👤" }].map(opt => (
            <button key={opt.id} onClick={() => setBeneficiaire(opt.id)}
              style={{ padding: "14px", borderRadius: 10, cursor: "pointer", textAlign: "left", border: `2px solid ${beneficiaire === opt.id ? "#0A84FF" : theme.border}`, background: beneficiaire === opt.id ? "#F0F7FF" : theme.card }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{opt.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: theme.text }}>{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      {beneficiaire === "autre" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: theme.textSub, marginBottom: 6 }}>Prénom</label>
            <input value={benefPrenom} onChange={e => setBenefPrenom(e.target.value)} placeholder="Prénom"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 13, boxSizing: "border-box", background: theme.card, color: theme.text }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: theme.textSub, marginBottom: 6 }}>Nom</label>
            <input value={benefNom} onChange={e => setBenefNom(e.target.value)} placeholder="Nom"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 13, boxSizing: "border-box", background: theme.card, color: theme.text }} />
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: theme.textSub, marginBottom: 8 }}>Type de compte</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {["Nominatif", "Anonyme"].map(type => (
            <button key={type} onClick={() => setTypeCompte(type)}
              style={{ padding: "12px", borderRadius: 10, cursor: "pointer", border: `2px solid ${typeCompte === type ? "#0A84FF" : theme.border}`, background: typeCompte === type ? "#F0F7FF" : theme.card, fontSize: 13, fontWeight: 500, color: theme.text }}>
              {type === "Nominatif" ? "🪪 Nominatif" : "🔒 Anonyme"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: theme.textSub, marginBottom: 8 }}>Pays / Juridiction</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {PAYS.map(p => (
            <button key={p.nom} onClick={() => setPays(p.nom)}
              style={{ padding: "12px 8px", borderRadius: 10, cursor: "pointer", textAlign: "center", border: `2px solid ${pays === p.nom ? "#0A84FF" : theme.border}`, background: pays === p.nom ? "#F0F7FF" : theme.card }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{p.flag}</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: theme.text }}>{p.nom}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={creer} disabled={loading}
          style={{ flex: 1, padding: "11px", borderRadius: 9, background: loading ? "#AEAEB2" : "#30D158", color: "#fff", border: "none", fontSize: 14, fontWeight: 500, cursor: loading ? "default" : "pointer" }}>
          {loading ? "Création..." : "Créer la demande ✓"}
        </button>
        <button onClick={onCancel}
          style={{ flex: 1, padding: "11px", borderRadius: 9, background: theme.card, color: theme.text, border: `1px solid ${theme.border}`, fontSize: 14, cursor: "pointer" }}>
          Annuler
        </button>
      </div>
    </div>
  );
}

function DossierDetail({ dossier, user, profil, onBack, onLogout, darkMode, setDarkMode, theme }) {
  const [activeTab, setActiveTab] = useState("docs");
  const [tickets, setTickets] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [newTicket, setNewTicket] = useState(false);
  const [ticketTitre, setTicketTitre] = useState("");
  const [ticketMsg, setTicketMsg] = useState("");

  useEffect(() => {
    loadDossierData();
  }, [dossier.id]);

  async function loadDossierData() {
    const [{ data: ticketsData }, { data: docsData }] = await Promise.all([
      supabase.from("tickets").select("*").eq("client_id", dossier.id).order("created_at", { ascending: false }),
      supabase.from("documents").select("*").eq("client_id", dossier.id)
    ]);
    setTickets(ticketsData || []);
    setDocuments(docsData || []);
  }

  async function envoyerTicket() {
    if (!ticketTitre || !ticketMsg) return;
    await supabase.from("tickets").insert([{
      client_id: dossier.id, titre: ticketTitre, message: ticketMsg, auteur: "client", statut: "ouvert", priorite: "normal"
    }]);
    setTicketTitre(""); setTicketMsg(""); setNewTicket(false);
    loadDossierData();
  }

  const DOCS_REQUIS = [
    { type: "cni_recto", label: "CNI — Recto", icon: "🪪", info: "Face avant" },
    { type: "cni_verso", label: "CNI — Verso", icon: "🔄", info: "Face arrière" },
    { type: "justif_dom", label: "Justificatif de domicile", icon: "🏠", info: "Moins de 3 mois" },
    { type: "releve_banque", label: "Relevé bancaire (3 mois)", icon: "🏦", info: "3 derniers mois" },
    { type: "avis_impot", label: "Avis d'imposition", icon: "📑", info: "Dernier avis" },
    { type: "selfie", label: "Selfie de vérification", icon: "🤳", info: "CNI + date du jour" },
  ];

  const nomDossier = dossier.beneficiaire === "autre"
    ? `${dossier.beneficiaire_prenom} ${dossier.beneficiaire_nom}`
    : `${dossier.prenom} ${dossier.nom}`;

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: theme.nav, padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>OffshoreDesk</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ fontSize: 16, background: "none", border: "none", cursor: "pointer" }}>
            {darkMode ? "☀️" : "🌙"}
          </button>
          <span style={{ color: "#8E8E93", fontSize: 13 }}>{profil.prenom} {profil.nom}</span>
          <button onClick={async () => { await signOut(); onLogout(); }}
            style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: "none", border: "1px solid #3C3C3E", color: "#8E8E93", cursor: "pointer" }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 750, margin: "32px auto", padding: "0 20px" }}>
        <button onClick={onBack}
          style={{ fontSize: 13, color: "#0A84FF", background: "none", border: "none", cursor: "pointer", marginBottom: 16, padding: 0 }}>
          ← Retour à mes dossiers
        </button>

        <div style={{ background: theme.card, borderRadius: 14, border: `1px solid ${theme.border}`, padding: "24px 28px", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 4 }}>{nomDossier}</div>
          <div style={{ fontSize: 13, color: theme.textSub, marginBottom: 16 }}>
            {dossier.type_compte} · {dossier.pays}
            {dossier.beneficiaire === "autre" && <span style={{ marginLeft: 8, background: "#F0F7FF", color: "#0A84FF", padding: "2px 8px", borderRadius: 4, fontSize: 11 }}>Compte tiers</span>}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
            <span style={{ color: theme.textSub }}>Progression</span>
            <span style={{ fontWeight: 600, color: theme.text }}>{dossier.progression}%</span>
          </div>
          <div style={{ height: 7, background: theme.bgSub, borderRadius: 99 }}>
            <div style={{ height: 7, borderRadius: 99, background: dossier.progression === 100 ? "#30D158" : "#0A84FF", width: `${dossier.progression}%` }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[{ id: "docs", label: "Documents" }, { id: "tickets", label: `Tickets (${tickets.length})` }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: `1px solid ${activeTab === tab.id ? theme.text : theme.border}`, cursor: "pointer", background: activeTab === tab.id ? theme.text : theme.card, color: activeTab === tab.id ? (darkMode ? "#000" : "#fff") : theme.textSub }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "docs" && (
          <div style={{ background: theme.card, borderRadius: 14, border: `1px solid ${theme.border}`, padding: "20px 24px" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 16 }}>Documents requis</div>
            {DOCS_REQUIS.map(doc => {
              const existing = documents.find(d => d.type === doc.type);
              return (
                <UploadDoc
                  key={doc.type}
                  doc={doc}
                  existing={existing}
                  clientId={dossier.id}
                  theme={theme}
                  onUploaded={loadDossierData}
                />
              );
            })}
          </div>
        )}

        {activeTab === "tickets" && (
          <div style={{ background: theme.card, borderRadius: 14, border: `1px solid ${theme.border}`, padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>Tickets</div>
              <button onClick={() => setNewTicket(!newTicket)}
                style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, background: "#1C1C1E", color: "#fff", border: "none", cursor: "pointer" }}>
                + Nouveau ticket
              </button>
            </div>
            {newTicket && (
              <div style={{ background: theme.bgSub, borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <input placeholder="Sujet" value={ticketTitre} onChange={e => setTicketTitre(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: `1px solid ${theme.border}`, fontSize: 13, marginBottom: 8, boxSizing: "border-box", background: theme.card, color: theme.text }} />
                <textarea placeholder="Votre message..." value={ticketMsg} onChange={e => setTicketMsg(e.target.value)} rows={3}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: `1px solid ${theme.border}`, fontSize: 13, resize: "none", boxSizing: "border-box", background: theme.card, color: theme.text }} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={envoyerTicket} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, background: "#0A84FF", color: "#fff", border: "none", cursor: "pointer" }}>Envoyer</button>
                  <button onClick={() => setNewTicket(false)} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, background: "none", color: theme.textSub, border: `1px solid ${theme.border}`, cursor: "pointer" }}>Annuler</button>
                </div>
              </div>
            )}
            {tickets.map(ticket => (
              <div key={ticket.id} style={{ border: `1px solid ${theme.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{ticket.titre}</div>
                  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 500, background: ticket.statut === "resolu" ? "#E8F9F0" : "#FFF8EC", color: ticket.statut === "resolu" ? "#1A7A4A" : "#B7660A" }}>
                    {ticket.statut === "resolu" ? "Résolu" : "En cours"}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: theme.textSub, background: theme.bgSub, padding: "10px 12px", borderRadius: 8 }}>{ticket.message}</div>
              </div>
            ))}
            {tickets.length === 0 && !newTicket && (
              <div style={{ textAlign: "center", padding: "24px", color: "#AEAEB2", fontSize: 13 }}>Aucun ticket ouvert</div>
            )}
          </div>
        )}
      </div>

      <FloatingChat isAdmin={false} clientId={dossier.id} clientNom={`${profil.prenom} ${profil.nom}`} />
    </div>
  );
}

function UploadDoc({ doc, existing, clientId, theme, onUploaded }) {
  const [loading, setLoading] = useState(false);
  const [localExisting, setLocalExisting] = useState(existing);

  useEffect(() => {
    setLocalExisting(existing);
  }, [existing]);

  const statut = localExisting?.statut || "manquant";

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
        client_id: clientId, type: doc.type, nom_fichier: file.name,
        url: urlData.publicUrl, statut: "ok", uploaded_at: new Date().toISOString(),
      }], { onConflict: "client_id,type" });
      await supabase.from("timeline").insert([{
        client_id: clientId, type: "document",
        description: `Document uploadé : ${doc.label}`, auteur: "client"
      }]);
      setLocalExisting({ statut: "ok", nom_fichier: file.name });
      if (onUploaded) onUploaded();
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: `1px solid ${theme.border}` }}>
      <div style={{ fontSize: 20 }}>{statut === "ok" ? "✅" : statut === "expire" ? "⚠️" : "❌"}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: theme.text }}>{doc.label}</div>
        <div style={{ fontSize: 11, color: theme.textSub, marginTop: 2 }}>{localExisting?.nom_fichier || doc.info}</div>
      </div>
      <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 500,
        background: statut === "ok" ? "#E8F9F0" : statut === "expire" ? "#FFF8EC" : "#FFF0EE",
        color: statut === "ok" ? "#1A7A4A" : statut === "expire" ? "#B7660A" : "#C0392B" }}>
        {statut === "ok" ? "Reçu" : statut === "expire" ? "Expiré" : "Manquant"}
      </span>
      <label style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: "#0A84FF", color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>
        <input type="file" onChange={handleFile} style={{ display: "none" }} accept=".pdf,.jpg,.jpeg,.png" />
        {loading ? "⏳" : statut === "ok" ? "Remplacer" : "Uploader"}
      </label>
    </div>
  );
}