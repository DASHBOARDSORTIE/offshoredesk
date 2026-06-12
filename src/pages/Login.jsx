import { useState } from "react";
import { signIn } from "../lib/auth";

export default function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await signIn(email, password);
      onLogin();
    } catch (e) {
      setError("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "40px 36px", width: 380, border: "1px solid #E5E5EA" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#1C1C1E", marginBottom: 6 }}>OffshoreDesk</div>
        <div style={{ fontSize: 14, color: "#8E8E93", marginBottom: 28 }}>Connectez-vous à votre espace</div>
        {error && <div style={{ background: "#FFF0EE", color: "#C0392B", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3C3C43", marginBottom: 6 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com"
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #E5E5EA", fontSize: 13, boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3C3C43", marginBottom: 6 }}>Mot de passe</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #E5E5EA", fontSize: 13, boxSizing: "border-box" }} />
        </div>
        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: "12px", borderRadius: 9, background: loading ? "#AEAEB2" : "#1C1C1E", color: "#fff", border: "none", fontSize: 14, fontWeight: 500, cursor: loading ? "default" : "pointer", marginBottom: 16 }}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: 13, color: "#8E8E93" }}>Pas encore de compte ? </span>
          <button onClick={onRegister} style={{ fontSize: 13, color: "#0A84FF", background: "none", border: "none", cursor: "pointer" }}>Créer un compte</button>
        </div>
      </div>
    </div>
  );
}