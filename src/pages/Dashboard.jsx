import { CLIENTS, STATUT_CONFIG } from "../lib/data";

export default function Dashboard({ navigate }) {
  const total = CLIENTS.length;
  const complets = CLIENTS.filter(c => c.statut === "complet").length;
  const manquants = CLIENTS.filter(c => c.statut === "doc_manquant").length;
  const tickets = CLIENTS.flatMap(c => c.tickets).filter(t => t.statut === "ouvert").length;

  const recentClients = [...CLIENTS].sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation)).slice(0, 5);
  const allTickets = CLIENTS.flatMap(c => c.tickets.map(t => ({ ...t, client: c }))).slice(0, 5);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        <MetricCard label="Clients actifs" value={total} sub="+3 ce mois" color="#0A84FF" />
        <MetricCard label="Dossiers complets" value={complets} sub={`${total - complets} incomplets`} color="#30D158" />
        <MetricCard label="Documents manquants" value={manquants} sub="Relances à envoyer" color="#FF9F0A" />
        <MetricCard label="Tickets ouverts" value={tickets} sub="À traiter" color="#FF453A" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <Card title="Clients récents">
          {recentClients.map(client => (
            <ClientRow key={client.id} client={client} onClick={() => navigate("client-detail", client)} />
          ))}
          <button onClick={() => navigate("clients")} style={linkBtn}>Voir tous les clients →</button>
        </Card>

        <Card title="Tickets en cours">
          {allTickets.length === 0 && <Empty text="Aucun ticket ouvert" />}
          {allTickets.map(t => <TicketRow key={t.id} ticket={t} navigate={navigate} />)}
          <button onClick={() => navigate("tickets")} style={linkBtn}>Voir tous les tickets →</button>
        </Card>
      </div>

      <Card title="Avancement des dossiers">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 32px" }}>
          {CLIENTS.map(c => (
            <ProgressRow key={c.id} client={c} onClick={() => navigate("client-detail", c)} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid #E5E5EA" }}>
      <div style={{ fontSize: 12, color: "#8E8E93", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#AEAEB2" }}>{sub}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1px solid #E5E5EA" }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E", marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

function ClientRow({ client, onClick }) {
  const cfg = STATUT_CONFIG[client.statut];
  const initials = `${client.prenom[0]}${client.nom[0]}`;
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "9px 0", borderBottom: "1px solid #F2F2F7", cursor: "pointer"
    }}>
      <Avatar initials={initials} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#1C1C1E" }}>{client.prenom} {client.nom}</div>
        <div style={{ fontSize: 11, color: "#8E8E93" }}>{client.type_compte} · {client.pays}</div>
      </div>
      <Badge cfg={cfg} />
    </div>
  );
}

function TicketRow({ ticket, navigate }) {
  const prioCfg = STATUT_CONFIG[ticket.priorite] || {};
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: "1px solid #F2F2F7" }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0, background: ticket.priorite === "urgent" ? "#FF453A" : "#0A84FF" }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: "#1C1C1E" }}>{ticket.titre}</div>
        <div style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}>
          {ticket.auteur === "client" ? "Ouvert par le client" : "Votre demande"} · {ticket.client?.prenom} {ticket.client?.nom}
        </div>
      </div>
      <Badge cfg={prioCfg} />
    </div>
  );
}

function ProgressRow({ client, onClick }) {
  const pct = client.progression;
  const color = pct === 100 ? "#30D158" : pct >= 70 ? "#0A84FF" : pct >= 40 ? "#FF9F0A" : "#FF453A";
  return (
    <div onClick={onClick} style={{ cursor: "pointer", padding: "6px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: "#1C1C1E", fontWeight: 500 }}>{client.prenom} {client.nom}</span>
        <span style={{ color: "#8E8E93" }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: "#F2F2F7", borderRadius: 99 }}>
        <div style={{ height: 5, width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

export function Avatar({ initials, size = 34 }) {
  const colors = ["#E8F0FF", "#E8F9F0", "#FFF8EC", "#FEF0F0", "#F0EEFF"];
  const textColors = ["#1B4FD8", "#1A7A4A", "#B7660A", "#C0392B", "#5B21B6"];
  const idx = initials.charCodeAt(0) % 5;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: colors[idx], color: textColors[idx],
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 600, flexShrink: 0
    }}>{initials}</div>
  );
}

export function Badge({ cfg }) {
  if (!cfg) return null;
  return (
    <span style={{
      fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 500,
      background: cfg.bg, color: cfg.color, whiteSpace: "nowrap"
    }}>{cfg.label}</span>
  );
}

export function Empty({ text }) {
  return <div style={{ textAlign: "center", padding: "20px 0", color: "#AEAEB2", fontSize: 13 }}>{text}</div>;
}

const linkBtn = {
  background: "none", border: "none", color: "#0A84FF", fontSize: 12,
  cursor: "pointer", padding: "8px 0 0", display: "block"
};
