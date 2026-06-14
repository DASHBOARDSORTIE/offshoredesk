export const CLIENTS = [
  {
    id: 1,
    nom: "Pinheiro",
    prenom: "Antonio",
    email: "a.pinheiro@proton.me",
    tel: "+33 6 12 34 56 78",
    adresse: "10 Chemin des Bouchets, 03410 Domérat",
    type_compte: "Nominatif",
    pays: "Belgique",
    statut: "doc_manquant",
    progression: 60,
    date_creation: "2026-05-03",
    montant_investi: 0,
    montant_recu: 0,
    devise: "EUR",
    docs: {
      cni: { statut: "ok", nom: "CNI_pinheiro.pdf", date: "2026-05-03" },
      justif_dom: { statut: "ok", nom: "JustifDom_pinheiro.pdf", date: "2026-05-03" },
      releve_banque: { statut: "manquant", nom: null, date: null },
      selfie: { statut: "manquant", nom: null, date: null },
      avis_impot: { statut: "ok", nom: "AvisImpot_pinheiro.pdf", date: "2026-05-04" },
    },
    tickets: [
      { id: 101, titre: "Mise à jour IBAN", statut: "ouvert", priorite: "urgent", auteur: "client", date: "2026-06-12", message: "Mon IBAN a changé, pouvez-vous mettre à jour mon dossier ?" }
    ]
  },
  {
    id: 2,
    nom: "Beaudoin",
    prenom: "Kim-Anne",
    email: "k.beaudoin@gmail.com",
    tel: "+33 6 98 76 54 32",
    adresse: "14 Rue des Lilas, 75011 Paris",
    type_compte: "Anonyme",
    pays: "Malte",
    statut: "complet",
    progression: 100,
    date_creation: "2026-04-20",
    montant_investi: 0,
    montant_recu: 0,
    devise: "EUR",
    docs: {
      cni: { statut: "ok", nom: "CNI_beaudoin.pdf", date: "2026-04-20" },
      justif_dom: { statut: "ok", nom: "JustifDom_beaudoin.pdf", date: "2026-04-20" },
      releve_banque: { statut: "ok", nom: "Releve_beaudoin.pdf", date: "2026-04-21" },
      selfie: { statut: "ok", nom: "Selfie_beaudoin.jpg", date: "2026-04-21" },
      avis_impot: { statut: "ok", nom: "AvisImpot_beaudoin.pdf", date: "2026-04-22" },
    },
    tickets: []
  },
  {
    id: 3,
    nom: "Le Tuan",
    prenom: "Kieu",
    email: "letuan.kieu@outlook.com",
    tel: "+33 7 11 22 33 44",
    adresse: "8 Avenue Jean Jaurès, 69007 Lyon",
    type_compte: "Nominatif",
    pays: "Hollande",
    statut: "en_attente",
    progression: 80,
    date_creation: "2026-05-15",
    montant_investi: 0,
    montant_recu: 0,
    devise: "EUR",
    docs: {
      cni: { statut: "ok", nom: "CNI_letuan.pdf", date: "2026-05-15" },
      justif_dom: { statut: "ok", nom: "JustifDom_letuan.pdf", date: "2026-05-15" },
      releve_banque: { statut: "ok", nom: "Releve_letuan.pdf", date: "2026-05-16" },
      selfie: { statut: "ok", nom: "Selfie_letuan.jpg", date: "2026-05-17" },
      avis_impot: { statut: "expire", nom: "AvisImpot_letuan.pdf", date: "2025-04-10" },
    },
    tickets: []
  },
];

export const PAYS_DISPONIBLES = [
  { nom: "Belgique", type: ["Nominatif", "Anonyme"], delai: "5-7 jours", frais: "150€", flag: "🇧🇪" },
  { nom: "Malte", type: ["Nominatif"], delai: "7-14 jours", frais: "250€", flag: "🇲🇹" },
  { nom: "Hollande", type: ["Nominatif", "Anonyme"], delai: "5-7 jours", frais: "150€", flag: "🇳🇱" },
];

export const DOCS_LABELS = {
  cni_recto: "CNI — Recto",
  cni_verso: "CNI — Verso",
  justif_dom: "Justificatif de domicile",
  releve_banque: "Relevé bancaire (3 mois)",
  selfie: "Selfie + CNI + date du jour",
  avis_impot: "Avis d'imposition",
};

export const STATUT_CONFIG = {
  complet: { label: "Complet", bg: "#E8F9F0", color: "#1A7A4A" },
  doc_manquant: { label: "Doc manquant", bg: "#FFF0EE", color: "#C0392B" },
  en_attente: { label: "En attente", bg: "#FFF8EC", color: "#B7660A" },
  ouvert: { label: "Ouvert", bg: "#EEF4FF", color: "#1B4FD8" },
  resolu: { label: "Résolu", bg: "#E8F9F0", color: "#1A7A4A" },
  urgent: { label: "Urgent", bg: "#FFF0EE", color: "#C0392B" },
  normal: { label: "Normal", bg: "#F4F4F4", color: "#555" },
  ok: { label: "✓", bg: "#E8F9F0", color: "#1A7A4A" },
  manquant: { label: "Manquant", bg: "#FFF0EE", color: "#C0392B" },
  expire: { label: "Expiré", bg: "#FFF8EC", color: "#B7660A" },
};