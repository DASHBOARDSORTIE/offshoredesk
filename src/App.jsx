import { useState, useEffect } from "react";
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F6F3" }}>
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
    <div style={{ minHeight: "100vh", background: "#F7F6F3", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar page={page} navigate={navigate} />
      <div style={{ marginLeft: 220, minHeight: "100vh" }}>
        <TopBar page={page} onLogout={() => signOut()} user={session.user} navigate={navigate} />
        <main style={{ padding: "28px 32px" }}>
          {page === "dashboard" && <Dashboard navigate={navigate} />}
          {page === "clients" && <Clients navigate={navigate} />}
          {page === "client-detail" && <ClientDetail client={selectedClient} navigate={navigate} />}
          {page === "tickets" && <Tickets navigate={navigate} />}
          {page === "onboarding" && <Onboarding navigate={navigate} />}
          {page === "new-client" && <NewClient navigate={navigate} />}
          {page === "agenda" && <Agenda user={session.user} isAdmin={true} />}
        </main>
      </div>
    </div>
  );
}

function Sidebar({ page, navigate }) {
  const items = [
    { id: "dashboard", label: "Vue globale" },
    { id: "clients", label: "Clients" },
    { id: "tickets", label: "Tickets" },
    { id: "agenda", label: "Agenda" },
    { id: "onboarding", label: "Formulaire client" },
  ];
  return (
    <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 220, background: "#1C1C1E", display: "flex", flexDirection: "column", padding: "0 0 20px", zIndex: 100 }}>
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #2C2C2E" }}>
        <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>OffshoreDesk</div>
        <div style={{ color: "#6E6E73", fontSize: 11, marginTop: 2 }}>Gestion de comptes</div>
      </div>
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {items.map(item => (
          <button key={item.id} onClick={() => navigate(item.id)}
            style={{
              display: "flex", alignItems: "center", width: "100%", padding: "9px 12px",
              borderRadius: 8, border: "none", cursor: "pointer",
              background: page === item.id ? "#2C2C2E" : "transparent",
              color: page === item.id ? "#fff" : "#8E8E93",
              fontSize: 13, fontWeight: page === item.id ? 500 : 400,
              marginBottom: 2, textAlign: "left"
            }}>{item.label}</button>
        ))}
      </nav>
      <div style={{ padding: "0 10px" }}>
        <button onClick={() => navigate("new-client")}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#0A84FF", border: "none", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          + Nouveau client
        </button>
      </div>
    </div>
  );
}

function TopBar({ page, onLogout, user, navigate }) {
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
    <div style={{ background: "#fff", borderBottom: "1px solid #E5E5EA", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
      <h1 style={{ fontSize: 16, fontWeight: 600, color: "#1C1C1E", margin: 0 }}>{titles[page]}</h1>

      <div style={{ position: "relative", flex: 1, maxWidth: 320, margin: "0 24px" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          onFocus={() => search.length >= 2 && setShowResults(true)}
          placeholder="🔍 Rechercher un client..."
          style={{ width: "100%", padding: "8px 14px", borderRadius: 8, border: "1px solid #E5E5EA", fontSize: 13, boxSizing: "border-box", background: "#F7F6F3", outline: "none" }}
        />
        {showResults && results.length > 0 && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", borderRadius: 10, border: "1px solid #E5E5EA", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 200, overflow: "hidden", marginTop: 4 }}>
            {results.map(client => (
              <div key={client.id}
                onMouseDown={() => { navigate("client-detail", client); setSearch(""); setShowResults(false); }}
                style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #F2F2F7", display: "flex", alignItems: "center", gap: 10 }}
                onMouseEnter={e => e.currentTarget.style.background = "#F7F6F3"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#E8F0FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#1B4FD8", flexShrink: 0 }}>
                  {client.prenom[0]}{client.nom[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1C1C1E" }}>{client.prenom} {client.nom}</div>
                  <div style={{ fontSize: 11, color: "#8E8E93" }}>{client.email} · {client.pays}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {showResults && search.length >= 2 && results.length === 0 && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", borderRadius: 10, border: "1px solid #E5E5EA", padding: "12px 14px", fontSize: 13, color: "#8E8E93", marginTop: 4 }}>
            Aucun client trouvé
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 13, color: "#8E8E93" }}>{user.email}</span>
        <button onClick={onLogout}
          style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: "none", border: "1px solid #E5E5EA", cursor: "pointer", color: "#8E8E93" }}>
          Déconnexion
        </button>
      </div>
    </div>
  );
}