import { useState } from "react";
import { supabase } from "../lib/supabase";

const passwordStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const strengthLabel = (score) => {
  if (score <= 1) return { label: "Très faible", color: "#FF3B30" };
  if (score === 2) return { label: "Faible", color: "#FF9500" };
  if (score === 3) return { label: "Moyen", color: "#FFCC00" };
  if (score === 4) return { label: "Fort", color: "#30D158" };
  return { label: "Très fort", color: "#30D158" };
};

export default function Register({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [telegram, setTelegram] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const score = passwordStrength(password);
  const strength = strengthLabel(score);

  const handleSubmit = async () => {
    setError("");
    if (!email || !password || !confirm || !telegram)
      return setError("Veuillez remplir tous les champs obligatoires");
    const cleanTelegram = telegram.startsWith("@") ? telegram : "@" + telegram;
    const telegramRegex = /^@[a-zA-Z0-9_]{5,32}$/;
    if (!telegramRegex.test(cleanTelegram))
      return setError("Le pseudo Telegram doit faire entre 5 et 32 caractères (lettres, chiffres, _)");
    if (password !== confirm)
      return setError("Les mots de passe ne correspondent pas");
    if (score < 3)
      return setError("Le mot de passe est trop faible. Ajoutez des majuscules, chiffres ou caractères spéciaux.");
    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { telegram: telegram.startsWith("@") ? telegram : "@" + telegram }
        }
      });
      if (signUpError) throw signUpError;
      setSuccess(true);
    } catch (e) {
      setError("Erreur : " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={{ minHeight: "100vh", background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "40px 36px", width: 420, border: "1px solid #E5E5EA", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1C1C1E", marginBottom: 8 }}>Compte créé !</div>
        <div style={{ fontSize: 14, color: "#8E8E93", marginBottom: 24 }}>Bienvenue ! Vous pouvez maintenant vous connecter.</div>
        <button onClick={onRegister} style={{ padding: "10px 24px", borderRadius: 9, background: "#1C1C1E", color: "#fff", border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          Se connecter
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "40px 36px", width: 420, border: "1px solid #E5E5EA" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#1C1C1E", marginBottom: 6 }}>Créer un compte</div>
        <div style={{ fontSize: 14, color: "#8E8E93", marginBottom: 28 }}>Accédez à votre espace OffshoreDesk</div>

        {error && (
          <div style={{ background: "#FFF0EE", color: "#C0392B", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3C3C43", marginBottom: 6 }}>Pseudo Telegram *</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#8E8E93", pointerEvents: "none" }}>@</span>
            <input value={telegram.startsWith("@") ? telegram.slice(1) : telegram} onChange={e => setTelegram(e.target.value)} placeholder="votre_pseudo"
              style={{ width: "100%", padding: "10px 14px 10px 28px", borderRadius: 8, border: "1px solid #E5E5EA", fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div style={{ fontSize: 11, color: "#AEAEB2", marginTop: 4 }}>Votre identifiant Telegram pour être contacté</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3C3C43", marginBottom: 6 }}>Email *</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com"
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #E5E5EA", fontSize: 13, boxSizing: "border-box" }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3C3C43", marginBottom: 6 }}>Mot de passe *</label>
          <div style={{ position: "relative" }}>
            <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              style={{ width: "100%", padding: "10px 40px 10px 14px", borderRadius: 8, border: "1px solid #E5E5EA", fontSize: 13, boxSizing: "border-box" }} />
            <button onClick={() => setShowPassword(v => !v)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "#8E8E93" }}>
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {password.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= score ? strength.color : "#E5E5EA", transition: "background 0.2s" }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: strength.color, fontWeight: 500 }}>{strength.label}</div>
            <div style={{ fontSize: 11, color: "#AEAEB2", marginTop: 2 }}>Utilisez majuscules, chiffres et caractères spéciaux</div>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3C3C43", marginBottom: 6 }}>Confirmer le mot de passe *</label>
          <div style={{ position: "relative" }}>
            <input type={showConfirm ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ width: "100%", padding: "10px 40px 10px 14px", borderRadius: 8, fontSize: 13, boxSizing: "border-box", border: `1px solid ${confirm && confirm !== password ? "#FF3B30" : "#E5E5EA"}` }} />
            <button onClick={() => setShowConfirm(v => !v)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "#8E8E93" }}>
              {showConfirm ? "🙈" : "👁️"}
            </button>
          </div>
          {confirm && confirm !== password && (
            <div style={{ fontSize: 11, color: "#FF3B30", marginTop: 4 }}>Les mots de passe ne correspondent pas</div>
          )}
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: "12px", borderRadius: 9, background: loading ? "#AEAEB2" : "#1C1C1E", color: "#fff", border: "none", fontSize: 14, fontWeight: 500, cursor: loading ? "default" : "pointer", marginBottom: 16 }}>
          {loading ? "Création en cours..." : "Créer mon compte"}
        </button>

        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: 13, color: "#8E8E93" }}>Déjà un compte ? </span>
          <button onClick={onRegister} style={{ fontSize: 13, color: "#0A84FF", background: "none", border: "none", cursor: "pointer" }}>Se connecter</button>
        </div>
      </div>
    </div>
  );
}