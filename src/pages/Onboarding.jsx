import { useState } from "react";
import { supabase } from "../lib/supabase";

const PAYS_NOMINATIF = [
  { nom: "France",   flag: "🇫🇷", delai: "3-4 semaines", frais: "Dès 500€" },
  { nom: "Belgique", flag: "🇧🇪", delai: "2-3 semaines", frais: "Dès 400€" },
  { nom: "Hollande", flag: "🇳🇱", delai: "3-4 semaines", frais: "Dès 450€" },
];

const PAYS_ANONYME = [
  { nom: "Angleterre", flag: "🇬🇧", delai: "2-3 semaines", frais: "Dès 600€" },
  { nom: "Malte",      flag: "🇲🇹", delai: "3-5 semaines", frais: "Dès 700€" },
  { nom: "France",     flag: "🇫🇷", delai: "3-4 semaines", frais: "Dès 500€" },
  { nom: "Belgique",   flag: "🇧🇪", delai: "2-3 semaines", frais: "Dès 400€" },
  { nom: "Hollande",   flag: "🇳🇱", delai: "3-4 semaines", frais: "Dès 450€" },
  { nom: "Espagne",    flag: "🇪🇸", delai: "4-6 semaines", frais: "Dès 550€" },
];

const ETAPES = [
  "Type de compte",
  "Pays / Juridiction",
  "Informations client",
  "Documents d'identité",
  "Documents financiers",
  "Selfie & finalisation",
];

const TIPS = [
  { icon: "💡", color: "#EFF6FF", border: "#BFDBFE", textColor: "#1D4ED8", title: "Quel type de compte choisir ?", content: "Le compte nominatif est lié à l'identité du client (plus simple, recommandé pour la plupart des cas). Le compte anonyme offre plus de confidentialité mais nécessite une structure juridique dédiée." },
  { icon: "🌍", color: "#F0FDF4", border: "#BBF7D0", textColor: "#15803D", title: "Choisissez selon vos besoins", content: "Chaque juridiction a ses avantages fiscaux et réglementaires. Malte et Angleterre offrent plus de confidentialité. France, Belgique et Hollande sont plus adaptées aux résidents européens." },
  { icon: "📋", color: "#FFF7ED", border: "#FED7AA", textColor: "#C2410C", title: "Informations exactes requises", content: "Les informations doivent correspondre exactement aux documents d'identité du client. Une adresse complète et valide est obligatoire pour la banque." },
  { icon: "🪪", color: "#FFF7ED", border: "#FED7AA", textColor: "#C2410C", title: "Documents acceptés", content: "CNI (recto + verso) ou Passeport en cours de validité. Le justificatif de domicile doit dater de moins de 3 mois (facture EDF, eau, gaz, bail, relevé bancaire avec adresse)." },
  { icon: "🏦", color: "#EFF6FF", border: "#BFDBFE", textColor: "#1D4ED8", title: "Ces documents sont envoyés après réception du compte", content: "La banque demande ces justificatifs pour valider l'origine des fonds. Ils ne sont pas requis à l'ouverture mais doivent être fournis dans les 30 jours suivant l'activation du compte." },
  { icon: "📸", color: "#FFF8EC", border: "#FDECC8", textColor: "#B7660A", title: "Instructions pour le selfie", content: "Le selfie doit montrer le client tenant sa CNI ou passeport à côté de son visage, avec une feuille indiquant la date du jour écrite à la main et sa signature. Bonne lumière, pas de filtre." },
];

function TipBox({ tip }) {
  return (
    <div style={{ background: tip.color, border: `1px solid ${tip.border}`, borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: tip.textColor, marginBottom: 4 }}>{tip.icon} {tip.title}</div>
      <div style={{ fontSize: 12, color: tip.textColor, opacity: 0.85, lineHeight: 1.7 }}>{tip.content}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", required }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3C3C43", marginBottom: 6 }}>
        {label} {required && <span style={{ color: "#FF3B30" }}>*</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #E5E5EA", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}

function UploadField({ label, info, icon, docType }) {
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
      <label style={{ display: "block", border: `2px dashed ${uploaded ? "#30D158" : "#D1D1D6"}`, borderRadius: 10, padding: "20px", textAlign: "center", cursor: "pointer", background: uploaded ? "#F0FFF4" : "#FAFAFA" }}>
        <input type="file" onChange={handleFile} style={{ display: "none" }} accept=".pdf,.jpg,.jpeg,.png" />
        <div style={{ fontSize: 26, marginBottom: 6 }}>{loading ? "⏳" : uploaded ? "✅" : icon}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: uploaded ? "#1A7A4A" : "#1C1C1E" }}>
          {loading ? "Upload en cours..." : uploaded ? fileName : "Cliquer pour uploader"}
        </div>
        <div style={{ fontSize: 11, color: "#8E8E93", marginTop: 3 }}>{info}</div>
      </label>
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

export default function Onboarding({ navigate }) {
  const [etape, setEtape] = useState(0);
  const [form, setForm] = useState({ type_compte: "", pays: "", nom: "", prenom: "", adresse: "", email: "", tel: "", type_identite: "" });
  const [submitted, setSubmitted] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const paysDisponibles = form.type_compte === "Nominatif" ? PAYS_NOMINATIF : PAYS_ANONYME;

  const stepValid = () => {
    if (etape === 0) return form.type_compte !== "";
    if (etape === 1) return form.pays !== "";
    if (etape === 2) return form.nom && form.prenom && form.adresse && form.email && form.tel;
    if (etape === 3) return form.type_identite !== "";
    return true;
  };

  const creerDossier = async () => {
    try {
      const { error } = await supabase.from("clients").insert([{
        nom: form.nom, prenom: form.prenom, email: form.email, tel: form.tel,
        adresse: form.adresse, type_compte: form.type_compte, pays: form.pays,
        statut: "doc_manquant", progression: 0,
      }]);
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  if (submitted) return (
    <div style={{ maxWidth: 520, margin: "60px auto", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#1C1C1E", marginBottom: 8 }}>Dossier créé avec succès</div>
      <div style={{ fontSize: 14, color: "#8E8E93", marginBottom: 32 }}>{form.prenom} {form.nom} a été ajouté. Les documents financiers seront à envoyer après réception du compte.</div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button onClick={() => navigate("clients")} style={{ padding: "10px 20px", borderRadius: 9, background: "#1C1C1E", color: "#fff", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Voir les clients</button>
        <button onClick={() => { setSubmitted(false); setEtape(0); setForm({ type_compte: "", pays: "", nom: "", prenom: "", adresse: "", email: "", tel: "", type_identite: "" }); }}
          style={{ padding: "10px 20px", borderRadius: 9, background: "#fff", color: "#1C1C1E", border: "1px solid #E5E5EA", fontSize: 13, cursor: "pointer" }}>Nouveau dossier</button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <StepIndicator etape={etape} etapes={ETAPES} />
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E5EA", padding: "28px 32px", marginTop: 24 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#1C1C1E", marginBottom: 2 }}>{ETAPES[etape]}</div>
        <div style={{ fontSize: 13, color: "#8E8E93", marginBottom: 20 }}>Étape {etape + 1} sur {ETAPES.length}</div>
        <TipBox tip={TIPS[etape]} />

        {etape === 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {["Nominatif", "Anonyme"].map(type => (
              <button key={type} onClick={() => { update("type_compte", type); update("pays", ""); }}
                style={{ padding: "20px", borderRadius: 10, cursor: "pointer", textAlign: "left", border: `2px solid ${form.type_compte === type ? "#0A84FF" : "#E5E5EA"}`, background: form.type_compte === type ? "#F0F7FF" : "#fff" }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{type === "Nominatif" ? "🪪" : "🔒"}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E" }}>{type}</div>
                <div style={{ fontSize: 12, color: "#8E8E93", marginTop: 4 }}>{type === "Nominatif" ? "Compte au nom du client" : "Compte sans identification nominale"}</div>
              </button>
            ))}
          </div>
        )}

        {etape === 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {paysDisponibles.map(pays => (
              <button key={pays.nom} onClick={() => update("pays", pays.nom)}
                style={{ padding: "20px 16px", borderRadius: 10, cursor: "pointer", textAlign: "center", border: `2px solid ${form.pays === pays.nom ? "#0A84FF" : "#E5E5EA"}`, background: form.pays === pays.nom ? "#F0F7FF" : "#fff" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{pays.flag}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E", marginBottom: 4 }}>{pays.nom}</div>
                <div style={{ fontSize: 11, color: "#8E8E93" }}>Délai : {pays.delai}</div>
                <div style={{ fontSize: 11, color: "#8E8E93" }}>{pays.frais}</div>
              </button>
            ))}
          </div>
        )}

        {etape === 2 && (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Prénom" value={form.prenom} onChange={v => update("prenom", v)} placeholder="Antoine" required />
              <Field label="Nom" value={form.nom} onChange={v => update("nom", v)} placeholder="Dupont" required />
            </div>
            <Field label="Adresse complète" value={form.adresse} onChange={v => update("adresse", v)} placeholder="12 rue de la Paix, 75001 Paris" required />
            <Field label="Email" value={form.email} onChange={v => update("email", v)} placeholder="client@email.com" type="email" required />
            <Field label="Téléphone" value={form.tel} onChange={v => update("tel", v)} placeholder="+33 6 12 34 56 78" type="tel" required />
          </div>
        )}

        {etape === 3 && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {["CNI", "Passeport"].map(type => (
                <button key={type} onClick={() => update("type_identite", type)}
                  style={{ padding: "14px", borderRadius: 10, cursor: "pointer", textAlign: "left", border: `2px solid ${form.type_identite === type ? "#0A84FF" : "#E5E5EA"}`, background: form.type_identite === type ? "#F0F7FF" : "#fff" }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{type === "CNI" ? "🪪" : "📘"}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>{type}</div>
                  <div style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}>{type === "CNI" ? "Recto + verso obligatoires" : "Page photo uniquement"}</div>
                </button>
              ))}
            </div>
            {form.type_identite === "CNI" && (
              <>
                <UploadField label="CNI — Recto *" info="Face avant de la carte d'identité" icon="🪪" docType="cni_recto" />
                <UploadField label="CNI — Verso *" info="Face arrière de la carte d'identité" icon="🔄" docType="cni_verso" />
              </>
            )}
            {form.type_identite === "Passeport" && (
              <UploadField label="Passeport — Page photo *" info="Page avec photo et données biométriques" icon="📘" docType="passeport" />
            )}
            {!form.type_identite && (
              <div style={{ textAlign: "center", padding: "20px", color: "#AEAEB2", fontSize: 13, background: "#F7F6F3", borderRadius: 10 }}>Sélectionnez un type de document ci-dessus</div>
            )}
            <UploadField label="Justificatif de domicile *" info="Moins de 3 mois — facture EDF, eau, gaz, bail ou relevé bancaire" icon="🏠" docType="justif_dom" />
          </div>
        )}

        {etape === 4 && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ background: "#F0F7FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "12px 16px", marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1D4ED8", marginBottom: 4 }}>📬 Documents à envoyer après réception du compte</div>
              <div style={{ fontSize: 12, color: "#1D4ED8", opacity: 0.85, lineHeight: 1.7 }}>Ces documents justifient l'origine des fonds. Ils seront demandés par la banque dans les 30 jours suivant l'activation du compte.</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#3C3C43", marginBottom: 4 }}>Justificatif d'origine des fonds — choisissez un ou plusieurs :</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <UploadField label="Avis d'imposition" info="Dernier avis disponible" icon="📑" docType="avis_impot" />
              <UploadField label="Relevés bancaires" info="3 derniers mois" icon="🏦" docType="releve_banque" />
              <UploadField label="Vente immobilière / SCPI" info="Acte ou attestation de vente" icon="🏠" docType="vente_immo" />
              <UploadField label="Assurance vie" info="Relevé ou certificat de rachat" icon="📋" docType="assurance_vie" />
            </div>
          </div>
        )}

        {etape === 5 && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ background: "#FFF8EC", border: "1px solid #FDECC8", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#B7660A", marginBottom: 8 }}>📸 Ce que doit montrer le selfie</div>
              {["🪪 CNI ou passeport tenu à côté du visage", "📅 Feuille avec la date du jour écrite à la main", "✍️ Signature manuscrite sur la feuille", "💡 Bonne lumière — visage et document clairement lisibles", "🚫 Pas de filtre, pas de retouche, pas de lunettes de soleil"].map((item, i) => (
                <div key={i} style={{ fontSize: 12, color: "#7A4A0A", marginBottom: 4 }}>{item}</div>
              ))}
            </div>
            <UploadField label="Selfie de vérification *" info="CNI / Passeport + date du jour manuscrite + signature" icon="🤳" docType="selfie" />
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