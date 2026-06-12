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
        <TopBar page={page} onLogout={() => signOut()} user={session.user} />
        <main style={{ padding: "28px 32px" }}>
          {page === "dashboard" && <Dashboard navigate={navigate} />}
          {page === "clients" && <Clients navigate={navigate} />}
          {page === "client-detail" && <ClientDetail client={selectedClient} navigate={navigate} />}
          {page === "tickets" && <Tickets navigate={navigate} />}
          {page === "onboarding" && <Onboarding navigate={navigate} />}
          {page === "new-client" && <NewClient navigate={navigate} />}
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

function TopBar({ page, onLogout, user }) {
  const titles = { dashboard: "Vue globale", clients: "Clients", "client-detail": "Dossier client", tickets: "Tickets", onboarding: "Formulaire", "new-client": "Nouveau dossier" };
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #E5E5EA", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
      <h1 style={{ fontSize: 16, fontWeight: 600, color: "#1C1C1E", margin: 0 }}>{titles[page]}</h1>
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