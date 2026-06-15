import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

export default function FloatingChat({ isAdmin, userId, clientId, clientNom }) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [totalNonLus, setTotalNonLus] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isAdmin) {
      loadClients();
      const channel = supabase
        .channel("floating-chat-admin")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
          loadClients();
          if (selectedClient) loadMessages(selectedClient.id);
        })
        .subscribe();
      return () => supabase.removeChannel(channel);
    } else {
      if (clientId) loadMessages(clientId);
      const channel = supabase
        .channel(`floating-chat-${clientId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `client_id=eq.${clientId}` },
          payload => setMessages(prev => [...prev, payload.new]))
        .subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, [clientId, selectedClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadClients() {
    const { data } = await supabase
      .from("clients")
      .select("id, nom, prenom, profil_id")
      .order("created_at", { ascending: false });

    if (data) {
      const clientsAvecNonLus = await Promise.all(data.map(async (c) => {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("client_id", c.id)
          .eq("auteur", "client")
          .eq("lu", false);
        return { ...c, nonLus: count || 0 };
      }));
      setClients(clientsAvecNonLus);
      setTotalNonLus(clientsAvecNonLus.reduce((sum, c) => sum + c.nonLus, 0));
    }
  }

  async function loadMessages(cId) {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("client_id", cId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    await supabase.from("messages").update({ lu: true })
      .eq("client_id", cId)
      .eq("auteur", isAdmin ? "client" : "admin");
    if (isAdmin) loadClients();
  }

  async function envoyerMessage() {
    if (!newMsg.trim()) return;
    const cId = isAdmin ? selectedClient?.id : clientId;
    if (!cId) return;
    const contenu = newMsg.trim();
    setNewMsg("");
    await supabase.from("messages").insert([{
      client_id: cId,
      auteur: isAdmin ? "admin" : "client",
      contenu,
      lu: false
    }]);
    if (!isAdmin) setMessages(prev => [...prev, { contenu, auteur: "client", created_at: new Date().toISOString() }]);
  }

  const formatHeure = (d) => new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const COULEURS = ["#0A84FF", "#30D158", "#FF9F0A", "#BF5AF2", "#FF453A"];

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
      {/* Fenêtre chat */}
      {open && (
        <div style={{
          position: "absolute", bottom: 64, right: 0,
          width: 340, height: 480, background: "#fff",
          borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          border: "1px solid #E5E5EA"
        }}>
          {/* Header */}
          <div style={{ background: "#1C1C1E", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {isAdmin && selectedClient && (
                <button onClick={() => { setSelectedClient(null); setMessages([]); }}
                  style={{ color: "#8E8E93", background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 0 }}>
                  ←
                </button>
              )}
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>
                {isAdmin
                  ? selectedClient ? `${selectedClient.prenom} ${selectedClient.nom}` : "Messages"
                  : "Chat avec votre conseiller"
                }
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              style={{ color: "#8E8E93", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>✕</button>
          </div>

          {/* Liste clients (admin) */}
          {isAdmin && !selectedClient && (
            <div style={{ flex: 1, overflowY: "auto" }}>
              {clients.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#8E8E93", fontSize: 13 }}>
                  Aucun client
                </div>
              )}
              {clients.map((c, i) => {
                const initials = `${c.prenom[0]}${c.nom[0]}`;
                const couleur = COULEURS[i % COULEURS.length];
                return (
                  <div key={c.id} onClick={() => { setSelectedClient(c); loadMessages(c.id); }}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #F2F2F7", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F7F6F3"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: couleur + "22", color: couleur, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, position: "relative" }}>
                      {initials}
                      {c.nonLus > 0 && (
                        <div style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: "#FF453A", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                          {c.nonLus}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: c.nonLus > 0 ? 700 : 500, color: "#1C1C1E" }}>{c.prenom} {c.nom}</div>
                      <div style={{ fontSize: 11, color: "#8E8E93" }}>Cliquez pour chatter</div>
                    </div>
                    <span style={{ fontSize: 16, color: "#8E8E93" }}>→</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Messages */}
          {(!isAdmin || selectedClient) && (
            <>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 6 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "#AEAEB2", fontSize: 13 }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>💬</div>
                    Démarrez la conversation
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isMine = isAdmin ? msg.auteur === "admin" : msg.auteur === "client";
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "80%", padding: "8px 12px",
                        borderRadius: isMine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                        background: isMine ? "#1C1C1E" : "#F2F2F7",
                        color: isMine ? "#fff" : "#1C1C1E", fontSize: 13
                      }}>
                        {msg.contenu}
                        <div style={{ fontSize: 10, color: isMine ? "rgba(255,255,255,0.5)" : "#AEAEB2", marginTop: 3, textAlign: "right" }}>
                          {formatHeure(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "10px 12px", borderTop: "1px solid #F2F2F7", display: "flex", gap: 8 }}>
                <input
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && envoyerMessage()}
                  placeholder="Message..."
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 20, border: "1px solid #E5E5EA", fontSize: 13, outline: "none" }}
                />
                <button onClick={envoyerMessage} disabled={!newMsg.trim()}
                  style={{ width: 36, height: 36, borderRadius: "50%", background: newMsg.trim() ? "#1C1C1E" : "#E5E5EA", border: "none", cursor: newMsg.trim() ? "pointer" : "default", fontSize: 14, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  ➤
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Bulle flottante */}
      <button onClick={() => setOpen(!open)}
        style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg, #0A84FF, #BF5AF2)",
          border: "none", cursor: "pointer", fontSize: 22,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(10, 132, 255, 0.4)",
          position: "relative", transition: "transform 0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        {open ? "✕" : "💬"}
        {!open && totalNonLus > 0 && (
          <div style={{ position: "absolute", top: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: "#FF453A", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
            {totalNonLus}
          </div>
        )}
      </button>
    </div>
  );
}