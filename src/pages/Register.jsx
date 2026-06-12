import { useState } from "react";
import { signUp } from "../lib/auth";

export default function Register({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email || !password || !confirm) return setError("Veuillez remplir tous les champs");
    if (password !== confirm) return setError("Les mots de passe ne correspondent pas");
    if (password.length < 6) return setError("Le mot de passe doit faire au moins 6 caractères");
    setLoading(true);
    try {
      await signUp(email, password);
      setSuccess(true);
    } catch (e) {
      setError("Erreur : " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={{ minHeight: "100vh", background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "40px 36px", width: 380, border: "1px solid #E5E5EA", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📧</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1C1C1E", marginBottom: 8 }}>Vérifiez votre email</div>
        <div style={{ fontSize: 14, color: "#8E8E93", marginBottom: 24 }}>
          Un email de confirmation a été envoyé à <strong>{email}</strong>.
        </div>
        <button onClick={onRegister} style={{ fontSize: 13, color: "#0A84FF", background: "none", border: "none", cursor: "pointer" }}>
          Retour à la connexion
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "40px 36px", width: 380, border: "1px solid #E5E5EA" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#1C1C1E", marginBottom: 6 }}>Créer un compte</div>
        <div style={{ fontSize: 14, color: "#8E8E93", marginBottom: 28 }}>Accédez à votre espace client</div>
        {error && <div style={{ background: "#FFF0EE", color: "#C0392B", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3C3C43", marginBottom: 6 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com"
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #E5E5EA", fontSize: 13, boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3C3C43", marginBottom: 6 }}>Mot de passe</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #E5E5EA", fontSize: 13, boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3C3C43", marginBottom: 6 }}>Confirmer le mot de passe</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #E5E5EA", fontSize: 13, boxSizing: "border-box" }} />
        </div>
        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: "12px", borderRadius: 9, background: loading ? "#AEAEB2" : "#1C1C1E", color: "#fff", border: "none", fontSize: 14, fontWeight: 500, cursor: loading ? "default" : "pointer", marginBottom: 16 }}>
          {loading ? "Inscription..." : "Créer mon compte"}
        </button>
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: 13, color: "#8E8E93" }}>Déjà un compte ? </span>
          <button onClick={onRegister} style={{ fontSize: 13, color: "#0A84FF", background: "none", border: "none", cursor: "pointer" }}>Se connecter</button>
        </div>
      </div>
    </div>
  );
}