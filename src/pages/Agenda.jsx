import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const HEURES = [];
for (let h = 9; h < 20; h++) {
  HEURES.push(`${h.toString().padStart(2, "0")}:00`);
  HEURES.push(`${h.toString().padStart(2, "0")}:30`);
}

const COULEURS_CLIENT = [
  "#0A84FF", "#30D158", "#FF9F0A", "#FF453A", "#BF5AF2",
  "#FF2D55", "#5AC8FA", "#34C759", "#FF6B00", "#00C7BE"
];

function getCouleurClient(clientId, allClientIds) {
  const index = allClientIds.indexOf(clientId);
  return COULEURS_CLIENT[index % COULEURS_CLIENT.length];
}

function getLundiSemaine(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default function Agenda({ user, isAdmin }) {
  const [semaine, setSemaine] = useState(getLundiSemaine(new Date()));
  const [reservations, setReservations] = useState([]);
  const [clientIds, setClientIds] = useState([]);
  const [clientInfo, setClientInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalCreneau, setModalCreneau] = useState(null);
  const [myClientId, setMyClientId] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const jours = Array.from({ length: 7 }, (_, i) => addDays(semaine, i));

  useEffect(() => {
    loadData();
  }, [semaine]);

  async function loadData() {
    setLoading(true);
    const debut = formatDate(semaine);
    const fin = formatDate(addDays(semaine, 6));

    const { data: resData } = await supabase
      .from("reservations")
      .select("*")
      .gte("date", debut)
      .lte("date", fin)
      .eq("statut", "confirme");

    if (resData) {
      setReservations(resData);
      const ids = [...new Set(resData.map(r => r.client_id))];
      setClientIds(ids);

      if (isAdmin && ids.length > 0) {
        const { data: clients } = await supabase
          .from("clients")
          .select("id, nom, prenom")
          .in("id", ids);
        if (clients) {
          const map = {};
          clients.forEach(c => { map[c.id] = c; });
          setClientInfo(map);
        }
      }
    }

    if (!isAdmin) {
      const { data: myClient } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (myClient) setMyClientId(myClient.id);
    }

    setLoading(false);
  }

  async function reserver() {
    if (!modalCreneau || !myClientId) return;
    setSaving(true);
    try {
      const heureFin = modalCreneau.heure.split(":");
      const minutes = parseInt(heureFin[1]) + 30;
      const heures = parseInt(heureFin[0]) + Math.floor(minutes / 60);
      const fin = `${heures.toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`;

      const { error } = await supabase.from("reservations").insert([{
        client_id: myClientId,
        user_id: user.id,
        date: modalCreneau.date,
        heure_debut: modalCreneau.heure,
        heure_fin: fin,
        note: note,
        statut: "confirme"
      }]);

      if (error) throw error;
      setModalCreneau(null);
      setNote("");
      loadData();
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function annuler(reservationId) {
    await supabase.from("reservations").update({ statut: "annule" }).eq("id", reservationId);
    loadData();
  }

  const getReservation = (date, heure) => {
    return reservations.find(r => r.date === formatDate(date) && r.heure_debut === heure + ":00");
  };

  const joursLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const moisLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setSemaine(addDays(semaine, -7))}
            style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #E5E5EA", background: "#fff", cursor: "pointer", fontSize: 14 }}>←</button>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1C1C1E" }}>
            {semaine.getDate()} {moisLabels[semaine.getMonth()]} — {addDays(semaine, 6).getDate()} {moisLabels[addDays(semaine, 6).getMonth()]} {semaine.getFullYear()}
          </div>
          <button onClick={() => setSemaine(addDays(semaine, 7))}
            style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #E5E5EA", background: "#fff", cursor: "pointer", fontSize: 14 }}>→</button>
        </div>
        <button onClick={() => setSemaine(getLundiSemaine(new Date()))}
          style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #E5E5EA", background: "#fff", cursor: "pointer", fontSize: 13, color: "#8E8E93" }}>
          Aujourd'hui
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E5EA", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", borderBottom: "1px solid #F2F2F7" }}>
          <div style={{ padding: "10px 0" }} />
          {jours.map((jour, i) => {
            const isToday = formatDate(jour) === formatDate(new Date());
            return (
              <div key={i} style={{ padding: "10px 8px", textAlign: "center", borderLeft: "1px solid #F2F2F7" }}>
                <div style={{ fontSize: 11, color: "#8E8E93", marginBottom: 4 }}>{joursLabels[i]}</div>
                <div style={{
                  fontSize: 16, fontWeight: 600,
                  color: isToday ? "#fff" : "#1C1C1E",
                  background: isToday ? "#0A84FF" : "transparent",
                  width: 30, height: 30, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto"
                }}>{jour.getDate()}</div>
              </div>
            );
          })}
        </div>

        <div style={{ maxHeight: 600, overflowY: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#8E8E93", fontSize: 13 }}>Chargement...</div>
          ) : (
            HEURES.map(heure => (
              <div key={heure} style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", borderBottom: "1px solid #F2F2F7", minHeight: 44 }}>
                <div style={{ padding: "12px 8px", fontSize: 11, color: "#AEAEB2", textAlign: "right", paddingRight: 10 }}>{heure}</div>
                {jours.map((jour, i) => {
                  const res = getReservation(jour, heure);
                  const isMyRes = res && res.client_id === myClientId;
                  const isPast = new Date(`${formatDate(jour)}T${heure}`) < new Date();
                  const couleur = res ? getCouleurClient(res.client_id, clientIds) : null;

                  return (
                    <div key={i} onClick={() => {
                      if (!res && !isPast && !isAdmin && myClientId) {
                        setModalCreneau({ date: formatDate(jour), heure });
                      }
                    }}
                      style={{
                        borderLeft: "1px solid #F2F2F7",
                        padding: "2px 4px",
                        cursor: !res && !isPast && !isAdmin && myClientId ? "pointer" : "default",
                        background: !res && !isPast && !isAdmin && myClientId ? "transparent" : "transparent",
                        transition: "background 0.1s",
                        position: "relative"
                      }}
                      onMouseEnter={e => { if (!res && !isPast && !isAdmin && myClientId) e.currentTarget.style.background = "#F0F7FF"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      {res && (
                        <div style={{
                          background: isAdmin || isMyRes ? couleur : "#E5E5EA",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 11,
                          color: isAdmin || isMyRes ? "#fff" : "#8E8E93",
                          fontWeight: 500,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 4
                        }}>
                          <span>
                            {isAdmin
                              ? `${clientInfo[res.client_id]?.prenom || ""} ${clientInfo[res.client_id]?.nom || ""}`
                              : isMyRes ? "Vous" : "Réservé"
                            }
                          </span>
                          {(isAdmin || isMyRes) && (
                            <button onClick={(e) => { e.stopPropagation(); annuler(res.id); }}
                              style={{ fontSize: 10, background: "rgba(255,255,255,0.3)", border: "none", borderRadius: 4, color: "#fff", cursor: "pointer", padding: "1px 5px" }}>
                              ✕
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {!isAdmin && (
        <div style={{ marginTop: 12, fontSize: 12, color: "#8E8E93", textAlign: "center" }}>
          Cliquez sur un créneau disponible pour réserver · Les créneaux gris sont pris par d'autres clients
        </div>
      )}

      {modalCreneau && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#1C1C1E", marginBottom: 4 }}>Confirmer la réservation</div>
            <div style={{ fontSize: 13, color: "#8E8E93", marginBottom: 20 }}>
              {modalCreneau.date} à {modalCreneau.heure} — {modalCreneau.heure.split(":")[0]}:{parseInt(modalCreneau.heure.split(":")[1]) + 30 === 60 ? "00" : (parseInt(modalCreneau.heure.split(":")[1]) + 30).toString().padStart(2, "0")}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3C3C43", marginBottom: 6 }}>Note (optionnel)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Ex: ouverture compte Malte..." rows={3}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E5EA", fontSize: 13, resize: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={reserver} disabled={saving}
                style={{ flex: 1, padding: "11px", borderRadius: 9, background: saving ? "#AEAEB2" : "#0A84FF", color: "#fff", border: "none", fontSize: 14, fontWeight: 500, cursor: saving ? "default" : "pointer" }}>
                {saving ? "Réservation..." : "Confirmer"}
              </button>
              <button onClick={() => setModalCreneau(null)}
                style={{ flex: 1, padding: "11px", borderRadius: 9, background: "#fff", color: "#1C1C1E", border: "1px solid #E5E5EA", fontSize: 14, cursor: "pointer" }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}