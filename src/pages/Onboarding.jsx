import { useState } from "react";
import { PAYS_DISPONIBLES } from "../lib/data";
import { supabase } from "../lib/supabase";

const ETAPES = [
  "Type de compte",
  "Pays / Juridiction",
  "Informations personnelles",
  "Documents d'identité",
  "Documents financiers",
  "Selfie de vérification",
];

export default function Onboarding({ navigate }) {
  const [etape, setEtape] = useState(0);
  const [form, setForm] = useState({
    type_compte: "",
    pays: "",
    nom: "", prenom: "", adresse: "", email: "", tel: "",
    type_identite: "",
    cni_recto: null, cni_verso: null, passeport: null,
    justif_dom: null,
    releve_banque: [], avis_impot: null,
    selfie: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [clientId, setClientId] = useState(null);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const paysFiltered = PAYS_DISPONIBLES.filter(p =>
    form.type_compte === "" || p.type.includes(form.type_compte)
  );

  const stepValid = () => {
    if (etape === 0) return form.type_compte !== "";
    if (etape === 1) return form.pays !== "";
    if (etape === 2) return form.nom && form.prenom && form.adresse && form.email && form.tel;
    return true;
  };

  const creerDossier = async () => {
    try {
      const { data, error } = await supabase.from("clients").insert([{
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        tel: form.tel,
        adresse: form.adresse,
        type_compte: form.type_compte,
        pays: form.pays,
        statut: "doc_manquant",
        progression: 0,
      }]).select().single();
      if (error) throw error;
      setClientId(data.id);
      setSubmitted(true);
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 520, margin: "60px auto", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#1C1C1E", marginBottom: 8 }}>Dossier créé avec succès</div>
        <div style={{ fontSize: 14, color: "#8E8E93", marginBottom: 32 }}>Le client a été ajouté à la base de données.</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => navigate("clients")}
            style={{ padding: "10px 20px", borderRadius: 9, background: "#1C1C1E", color: "#fff", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            Voir les clients
          </button>
          <button onClick={() => { setSubmitted(false); setEtape(0); setClientId(null); }}
            style={{ padding: "10px 20px", borderRadius: 9, background: "#fff", color: "#1C1C1E", border: "1px solid #E5E5EA", fontSize: 13, cursor: "pointer" }}>
            Nouveau dossier
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <StepIndicator etape={etape} etapes={ETAPES} />
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E5EA", padding: "28px 32px", marginTop: 24 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#1C1C1E", marginBottom: 4 }}>{ETAPES[etape]}</div>
        <div style={{ fontSize: 13, color: "#8E8E93", marginBottom: 24 }}>Étape {etape + 1} sur {ETAPES.length}</div>

        {etape === 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {["Nominatif", "Anonyme"].map(type => (
              <button key={type} onClick={() => update("type_compte", type)}
                style={{ padding: "20px", borderRadius: 10, cursor: "pointer", textAlign: "left", border: `2px solid ${form.type_compte === type ? "#0A84FF" : "#E5E5EA"}`, background: form.type_compte === type ? "#F0F7FF" : "#fff" }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{type === "Nominatif" ? "🪪" : "🔒"}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E" }}>{type}</div>
                <div style={{ fontSize: 12, color: "#8E8E93", marginTop: 4 }}>{type === "Nominatif" ? "Compte au nom du client" : "Compte sans identification nominale"}</div>
              </button>
            ))}
          </div>
        )}

        {etape === 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {paysFiltered.map(pays => (
              <button key={pays.nom} onClick={() => update("pays", pays.nom)}
                style={{ padding: "16px", borderRadius: 10, cursor: "pointer", textAlign: "left", border: `2px solid ${form.pays === pays.nom ? "#0A84FF" : "#E5E5EA"}`, background: form.pays === pays.nom ? "#F0F7FF" : "#fff" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E", marginBottom: 6 }}>{pays.nom}</div>
                <div style={{ fontSize: 11, color: "#8E8E93" }}>Délai : {pays.delai} · {pays.frais}</div>
              </button>
            ))}
          </div>
        )}

        {etape === 2 && (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Prénom" value={form.prenom} onChange={v => update("prenom", v)} placeholder="Antoine" />
              <Field label="Nom" value={form.nom} onChange={v => update("nom", v)} placeholder="Dupont" />
            </div>
            <Field label="Adresse complète" value={form.adresse} onChange={v => update("adresse", v)} placeholder="12 rue de la Paix, 75001 Paris" />
            <Field label="Email" value={form.email} onChange={v => update("email", v)} placeholder="client@email.com" type="email" />
            <Field label="Téléphone" value={form.tel} onChange={v => update("tel", v)} placeholder="+33 6 12 34 56 78" type="tel" />
          </div>
        )}

        {etape === 3 && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 8 }}>
              {["CNI", "Passeport"].map(type => (
                <button key={type} onClick={() => update("type_identite", type)}
                  style={{ padding: "14px", borderRadius: 10, cursor: "pointer", textAlign: "left", border: `2px solid ${form.type_identite === type ? "#0A84FF" : "#E5E5EA"}`, background: form.type_identite === type ? "#F0F7FF" : "#fff" }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{type === "CNI" ? "🪪" : "📘"}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>{type}</div>
                  <div style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}>{type === "CNI" ? "Recto + verso requis" : "Page photo uniquement"}</div>
                </button>
              ))}
            </div>
            {form.type_identite === "CNI" && (
              <>
                <UploadZone label="CNI — Recto" info="Face avant" icon="🪪" docType="cni_recto" />
                <UploadZone label="CNI — Verso" info="Face arrière" icon="🔄" docType="cni_verso" />
              </>
            )}
            {form.type_identite === "Passeport" && (
              <UploadZone label="Passeport — Page photo" info="Page avec photo" icon="📘" docType="passeport" />
            )}
            {!form.type_identite && (
              <div style={{ textAlign: "center", padding: "20px", color: "#AEAEB2", fontSize: 13, background: "#F7F6F3", borderRadius: 10 }}>
                Sélectionnez un type de document
              </div>
            )}
            <UploadZone label="Justificatif de domicile" info="Moins de 3 mois (facture, bail...)" icon="🏠" docType="justif_dom" />
          </div>
        )}

        {etape === 4 && (
          <div style={{ display: "grid", gap: 16 }}>
            <UploadZone label="Relevés bancaires des 3 derniers mois" info="3 fichiers PDF ou images" icon="🏦" docType="releve_banque" />
            <UploadZone label="Avis d'imposition" info="Dernier avis disponible" icon="📑" docType="avis_impot" />
          </div>
        )}

        {etape === 5 && (
          <div>
            <div style={{ background: "#FFF8EC", border: "1px solid #FDECC8", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#B7660A", marginBottom: 6 }}>📸 Instructions pour le selfie</div>
              <ul style={{ fontSize: 12, color: "#7A4A0A", paddingLeft: 16, margin: 0, lineHeight: 1.8 }}>
                <li>Tenez votre CNI ou passeport à côté de votre visage</li>
                <li>Tenez une feuille avec la <strong>date du jour écrite à la main</strong></li>
                <li>Bonne lumière, visage et document clairement visibles</li>
                <li>Pas de filtre, pas de retouche</li>
              </ul>
            </div>
            <UploadZone label="Selfie de vérification" info="CNI + date du jour manuscrite" icon="🤳" docType="selfie" />
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <button onClick={() => setEtape(e => Math.max(0, e - 1))} disabled={etape === 0}
          style={{ padding: "10px 20px", borderRadius: 9, border: "1px solid #E5E5EA", background: "#fff", color: etape === 0 ? "#AEAEB2" : "#1C1C1E", fontSize: 13, cursor: etape === 0 ? "default" : "pointer" }}>
          ← Précédent
        </button>
        {etape < ETAPES.length - 1 ? (
          <button onClick={() => setEtape(e => e + 1)} disabled={!stepValid()}
            style={{ padding: "10px 24px", borderRadius: 9, border: "none", background: stepValid() ? "#0A84FF" : "#AEAEB2", color: "#fff", fontSize: 13, fontWeight: 500, cursor: stepValid() ? "pointer" : "default" }}>
            Continuer →
          </button>
        ) : (
          <button onClick={creerDossier}
            style={{ padding: "10px 24px", borderRadius: 9, border: "none", background: "#30D158", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            Créer le dossier ✓
          </button>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ etape, etapes }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {etapes.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < etapes.length - 1 ? 1 : 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, background: i < etape ? "#30D158" : i === etape ? "#0A84FF" : "#F2F2F7", color: i <= etape ? "#fff" : "#AEAEB2" }}>
              {i < etape ? "✓" : i + 1}
            </div>
            <div style={{ fontSize: 10, color: i === etape ? "#0A84FF" : "#AEAEB2", whiteSpace: "nowrap", fontWeight: i === etape ? 600 : 400 }}>{label}</div>
          </div>
          {i < etapes.length - 1 && <div style={{ flex: 1, height: 2, background: i < etape ? "#30D158" : "#F2F2F7", margin: "0 4px", marginBottom: 20 }} />}
        </div>
      ))}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3C3C43", marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #E5E5EA", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}

function UploadZone({ label, info, icon, docType }) {
  const [uploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `temp/${docType}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: true });
      if (error) throw error;
      setUploaded(true);
      setFileName(file.name);
    } catch (err) {
      alert("Erreur upload : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3C3C43", marginBottom: 8 }}>{label}</label>
      <label style={{ display: "block", border: `2px dashed ${uploaded ? "#30D158" : "#D1D1D6"}`, borderRadius: 10, padding: "24px", textAlign: "center", cursor: "pointer", background: uploaded ? "#F0FFF4" : "#FAFAFA" }}>
        <input type="file" onChange={handleFile} style={{ display: "none" }} accept=".pdf,.jpg,.jpeg,.png" />
        <div style={{ fontSize: 28, marginBottom: 8 }}>{loading ? "⏳" : uploaded ? "✅" : icon}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: uploaded ? "#1A7A4A" : "#1C1C1E" }}>
          {loading ? "Upload en cours..." : uploaded ? fileName : "Cliquer pour uploader"}
        </div>
        <div style={{ fontSize: 11, color: "#8E8E93", marginTop: 4 }}>{info}</div>
      </label>
    </div>
  );
}