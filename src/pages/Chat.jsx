import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

export default function Chat({ clientId, isAdmin, clientNom }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`chat-${clientId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `client_id=eq.${clientId}`
      }, payload => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [clientId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages() {
    setLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true });
    setMessages(data || []);

    // Marquer comme lu
    await supabase.from("messages")
      .update({ lu: true })
      .eq("client_id", clientId)
      .eq("auteur", isAdmin ? "client" : "admin");

    setLoading(false);
  }

  async function envoyerMessage() {
    if (!newMsg.trim()) return;
    const contenu = newMsg.trim();
    setNewMsg("");

    await supabase.from("messages").insert([{
      client_id: clientId,
      auteur: isAdmin ? "admin" : "client",
      contenu,
      lu: false
    }]);

    // Ajouter à la timeline
    await supabase.from("timeline").insert([{
      client_id: clientId,
      type: "message",
      description: `Message envoyé : "${contenu.slice(0, 50)}${contenu.length > 50 ? "..." : ""}"`,
      auteur: isAdmin ? "admin" : "client"
    }]);
  }

  const formatHeure = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  };

  let lastDate = null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 500 }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {loading && <div style={{ textAlign: "center", color: "#8E8E93", fontSize: 13 }}>Chargement...</div>}

        {!loading && messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#AEAEB2", fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
            Démarrez la conversation
          </div>
        )}

        {messages.map((msg, i) => {
          const msgDate = new Date(msg.created_at).toDateString();
          const showDate = msgDate !== lastDate;
          lastDate = msgDate;
          const isMine = isAdmin ? msg.auteur === "admin" : msg.auteur === "client";

          return (
            <div key={msg.id}>
              {showDate && (
                <div style={{ textAlign: "center", fontSize: 11, color: "#AEAEB2", margin: "8px 0" }}>
                  {formatDate(msg.created_at)}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "70%", padding: "10px 14px", borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: isMine ? "#1C1C1E" : "#F2F2F7",
                  color: isMine ? "#fff" : "#1C1C1E",
                  fontSize: 13, lineHeight: 1.5
                }}>
                  {!isMine && (
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#8E8E93", marginBottom: 4 }}>
                      {msg.auteur === "admin" ? "Conseiller" : clientNom}
                    </div>
                  )}
                  {msg.contenu}
                  <div style={{ fontSize: 10, color: isMine ? "rgba(255,255,255,0.5)" : "#AEAEB2", marginTop: 4, textAlign: "right" }}>
                    {formatHeure(msg.created_at)}
                    {isMine && <span style={{ marginLeft: 4 }}>{msg.lu ? "✓✓" : "✓"}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid #F2F2F7", display: "flex", gap: 10, alignItems: "flex-end" }}>
        <textarea
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); envoyerMessage(); } }}
          placeholder="Écrivez un message... (Entrée pour envoyer)"
          rows={1}
          style={{ flex: 1, padding: "10px 14px", borderRadius: 20, border: "1px solid #E5E5EA", fontSize: 13, resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5 }}
        />
        <button onClick={envoyerMessage} disabled={!newMsg.trim()}
          style={{ width: 40, height: 40, borderRadius: "50%", background: newMsg.trim() ? "#1C1C1E" : "#E5E5EA", border: "none", cursor: newMsg.trim() ? "pointer" : "default", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          ➤
        </button>
      </div>
    </div>
  );
}