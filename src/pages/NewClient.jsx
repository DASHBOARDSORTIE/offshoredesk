export default function NewClient({ navigate }) {
  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#1C1C1E", marginBottom: 4 }}>Nouveau dossier client</div>
        <div style={{ fontSize: 14, color: "#8E8E93" }}>Créez un dossier d'ouverture de compte pour un client</div>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        <button onClick={() => navigate("onboarding")}
          style={{ padding: "22px 24px", borderRadius: 12, border: "1.5px solid #E5E5EA", background: "#fff", cursor: "pointer", textAlign: "left" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#0A84FF"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E5EA"}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ fontSize: 28, lineHeight: 1 }}>📋</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1C1C1E", marginBottom: 4 }}>Formulaire guidé</div>
              <div style={{ fontSize: 13, color: "#8E8E93", lineHeight: 1.5 }}>Remplissez vous-même le dossier client étape par étape — type de compte, pays, identité, documents.</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {["Type de compte", "Pays", "Identité", "Documents", "Selfie"].map((tag, i) => (
                  <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#F2F2F7", color: "#3C3C43", fontWeight: 500 }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </button>

        <button disabled style={{ padding: "22px 24px", borderRadius: 12, border: "1.5px solid #E5E5EA", background: "#FAFAFA", cursor: "not-allowed", textAlign: "left", opacity: 0.6 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ fontSize: 28, lineHeight: 1 }}>🔗</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1C1C1E" }}>Lien client</div>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: "#E5E5EA", color: "#8E8E93", fontWeight: 600 }}>BIENTÔT</span>
              </div>
              <div style={{ fontSize: 13, color: "#8E8E93", lineHeight: 1.5 }}>Envoyez un lien sécurisé au client pour qu'il remplisse lui-même son dossier.</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}