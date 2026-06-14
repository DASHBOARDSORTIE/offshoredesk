import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Timeline({ clientId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
    const channel = supabase
      .channel(`timeline-${clientId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "timeline",
        filter: `client_id=eq.${clientId}`
      }, payload => {
        setEvents(prev => [payload.new, ...prev]);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [clientId]);

  async function loadTimeline() {
    const { data } = await supabase
      .from("timeline")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    setEvents(data || []);
    setLoading(false);
  }

  const ICONS = {
    message: "💬", document: "📄", ticket: "🎫",
    statut: "🔄", creation: "✨", note: "📝",
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) +
      " à " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return <div style={{ textAlign: "center", padding: 20, color: "#8E8E93", fontSize: 13 }}>Chargement...</div>;

  if (events.length === 0) return (
    <div style={{ textAlign: "center", padding: "40px 0", color: "#AEAEB2", fontSize: 13 }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
      Aucun historique pour l'instant
    </div>
  );

  return (
    <div style={{ position: "relative", paddingLeft: 24 }}>
      <div style={{ position: "absolute", left: 11, top: 0, bottom: 0, width: 2, background: "#F2F2F7" }} />
      {events.map((event) => (
        <div key={event.id} style={{ position: "relative", marginBottom: 20 }}>
          <div style={{ position: "absolute", left: -20, width: 16, height: 16, borderRadius: "50%", background: "#fff", border: "2px solid #E5E5EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
            {ICONS[event.type] || "•"}
          </div>
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #F2F2F7", padding: "12px 14px" }}>
            <div style={{ fontSize: 13, color: "#1C1C1E", marginBottom: 4 }}>{event.description}</div>
            <div style={{ fontSize: 11, color: "#AEAEB2", display: "flex", justifyContent: "space-between" }}>
              <span>{event.auteur === "admin" ? "Conseiller" : event.auteur === "client" ? "Client" : "Système"}</span>
              <span>{formatDate(event.created_at)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}