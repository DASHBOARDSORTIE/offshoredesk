import React, { useState, useEffect, createContext } from "react";
import { supabase } from "./lib/supabase";
import { signOut } from "./lib/auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClientPortal from "./pages/ClientPortal";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Tickets from "./pages/Tickets";
import Onboarding from "./pages/Onboarding";
import NewClient from "./pages/NewClient";
import Agenda from "./pages/Agenda";

const ADMIN_EMAIL = "stevemachado33@gmail.com";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState(null);
  const [dark, setDark] = useState(false);

  const t = {
    bg: dark ? "#0D0D0F" : "#F7F6F3",
    card: dark ? "#1C1C1E" : "#fff",
    border: dark ? "#2C2C2E" : "#E5E5EA",
    text: dark ? "#fff" : "#1C1C1E",
    textSub: dark ? "#8E8E93" : "#8E8E93",
    bgSub: dark ? "#2C2C2E" : "#F7F6F3",
    sidebar: dark ? "#000" : "#1C1C1E",
    sidebarActive: dark ? "#1C1C1E" : "#2C2C2E",
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const navigate = (target, data = null) => {
    if (data) setSelectedClient(data);
    setPage(target);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0D0D0F" }}>
      <div style={{ fontSize: 14, color: "#8E8E93" }}>Chargement...</div>
    </div>
  );

  if (!session) {
    if (showRegister) return <Register onRegister={() => setShowRegister(false)} />;
    return <Login onLogin={() => {}} onRegister={() => setShowRegister(true)} />;
  }

  const isAdmin = session.user.email === ADMIN_EMAIL;
  if (!isAdmin) return <ClientPortal user={session.user} onLogout={() => signOut()} />;

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'Inter', system-ui, sans-serif", transition: "background 0.2s" }}>
      <Sidebar page={page} navigate={navigate} t={t} dark={dark} />
      <div style={{ marginLeft: 220, minHeight: "100vh" }}>
        <TopBar page={page} onLogout={() => signOut()} user={session.user} navigate={navigate} t={t} dark={dark} setDark={setDark} />
        <main style={{ padding: "28px 32px" }}>
          {page === "dashboard" && <Dashboard navigate={navigate} t={t} dark={dark} />}
          {page === "clients" && <Clients navigate={navigate} t={t} />}
          {page === "client-detail" && <ClientDetail client={selectedClient} navigate={navigate} />}
          {page === "tickets" && <Tickets navigate={navigate} t={t} />}
          {page === "onboarding" && <Onboarding navigate={navigate} />}
          {page === "new-client" && <NewClient navigate={navigate} />}
          {page === "agenda" && <Agenda user={session.user} isAdmin={true} />}
        </main>
      </div>
    </div>
  );
}

function Sidebar({ page, navigate, t, dark }) {
  const items = [
    { id: "dashboard", label: "Vue globale", emoji: "⬛" },
    { id: "clients", label: "Clients", emoji: "👥" },
    { id: "tickets", label: "Tickets", emoji: "🎫" },
    { id: "agenda", label: "Agenda", emoji: "📅" },
    { id: "onboarding", label: "Formulaire", emoji: "📋" },
  ];

  return (
    <div style={{
      position: "fixed", left: 0, top: 0, bottom: 0, width: 220,
      background: t.sidebar, display: "flex", flexDirection: "column",
      padding: "0 0 20px", zIndex: 100, transition: "background 0.2s",
      borderRight: `1px solid ${dark ? "#1C1C1E" : "#2C2C2E"}`
    }}>
      <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${dark ? "#1C1C1E" : "#2C2C2E"}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #0A84FF, #BF5AF2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
            🏦
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>OffshoreDesk</div>
            <div style={{ color: "#6E6E73", fontSize: 10, marginTop: 1 }}>Admin</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {items.map(item => (
          <button key={item.id} onClick={() => navigate(item.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: page === item.id ? t.sidebarActive : "transparent",
              color: page === item.id ? "#fff" : "#8E8E93",
              fontSize: 13, fontWeight: page === item.id ? 500 : 400,
              marginBottom: 2, textAlign: "left"
            }}>
            <span>{item.emoji}</span>
            {item.label}
            {page === item.id && <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: "#0A84FF" }} />}
          </button>
        ))}
      </nav>

      <div style={{ padding: "0 10px" }}>
        <button onClick={() => navigate("new-client")}
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 8,
            background: "linear-gradient(135deg, #0A84FF, #BF5AF2)",
            border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}>
          + Nouveau client
        </button>
      </div>
    </div>
  );
}

function TopBar({ page, onLogout, user, navigate, t, dark, setDark }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const titles = {
    dashboard: "Vue globale", clients: "Clients", "client-detail": "Dossier client",
    tickets: "Tickets", onboarding: "Formulaire", "new-client": "Nouveau dossier", agenda: "Agenda"
  };

  useEffect(() => {
    if (search.length < 2) { setResults([]); setShowResults(false); return; }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("clients")
        .select("id, nom, prenom, email, pays, type_compte")
        .or(`nom.ilike.%${search}%,prenom.ilike.%${search}%,email.ilike.%${search}%`)
        .limit(5);
      setResults(data || []);
      setShowResults(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div style={{
      background: t.card, borderBottom: `1px solid ${t.border}`,
      padding: "0 32px", height: 56, display: "flex", alignItems: "center",
      justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
      transition: "all 0.2s"
    }}>
      <h1 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: 0 }}>{titles[page]}</h1>

      <div style={{ position: "relative", flex: 1, maxWidth: 320, margin: "0 24px" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          onFocus={() => search.length >= 2 && setShowResults(true)}
          placeholder="🔍 Rechercher un client..."
          style={{
            width: "100%", padding: "8px 14px", borderRadius: 20,
            border: `1px solid ${t.border}`, fontSize: 13, boxSizing: "border-box",
            background: t.bgSub, outline: "none", color: t.text
          }}
        />
        {showResults && results.length > 0 && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: t.card, borderRadius: 10, border: `1px solid ${t.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", zIndex: 200, overflow: "hidden", marginTop: 4 }}>
            {results.map(client => (
              <div key={client.id}
                onMouseDown={() => { navigate("client-detail", client); setSearch(""); setShowResults(false); }}
                style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10 }}
                onMouseEnter={e => e.currentTarget.style.background = t.bgSub}
                onMouseLeave={e => e.currentTarget.style.background = t.card}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#0A84FF22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#0A84FF", flexShrink: 0 }}>
                  {client.prenom[0]}{client.nom[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{client.prenom} {client.nom}</div>
                  <div style={{ fontSize: 11, color: t.textSub }}>{client.email} · {client.pays}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setDark(!dark)}
          style={{ fontSize: 18, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8 }}>
          {dark ? "☀️" : "🌙"}
        </button>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #0A84FF, #BF5AF2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
          {user.email[0].toUpperCase()}
        </div>
        <button onClick={onLogout}
          style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: "none", border: `1px solid ${t.border}`, cursor: "pointer", color: t.textSub }}>
          Déconnexion
        </button>
      </div>
    </div>
  );
}