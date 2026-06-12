export const CLIENTS = [
  {
    id: 1,
    nom: "Pinheiro",
    prenom: "Antonio",
    email: "a.pinheiro@proton.me",
    tel: "+33 6 12 34 56 78",
    adresse: "10 Chemin des Bouchets, 03410 Domérat",
    type_compte: "Nominatif",
    pays: "Estonie",
    statut: "doc_manquant",
    progression: 60,
    date_creation: "2026-05-03",
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
    pays: "Géorgie",
    statut: "complet",
    progression: 100,
    date_creation: "2026-04-20",
    docs: {
      cni: { statut: "ok", nom: "CNI_beaudoin.pdf", date: "2026-04-20" },
      justif_dom: { statut: "ok", nom: "JustifDom_beaudoin.pdf", date: "2026-04-20" },
      releve_banque: { statut: "ok", nom: "Releve_beaudoin.pdf", date: "2026-04-21" },
      selfie: { statut: "ok", nom: "Selfie_beaudoin.jpg", date: "2026-04-21" },
      avis_impot: { statut: "ok", nom: "AvisImpot_beaudoin.pdf", date: "2026-04-22" },
    },
    tickets: [
      { id: 102, titre: "Confirmation ouverture compte", statut: "resolu", priorite: "normal", auteur: "client", date: "2026-05-10", message: "Mon compte a-t-il bien été ouvert ?" }
    ]
  },
  {
    id: 3,
    nom: "Le Tuan",
    prenom: "Kieu",
    email: "letuan.kieu@outlook.com",
    tel: "+33 7 11 22 33 44",
    adresse: "8 Avenue Jean Jaurès, 69007 Lyon",
    type_compte: "Nominatif",
    pays: "EME (Emirats)",
    statut: "en_attente",
    progression: 80,
    date_creation: "2026-05-15",
    docs: {
      cni: { statut: "ok", nom: "CNI_letuan.pdf", date: "2026-05-15" },
      justif_dom: { statut: "ok", nom: "JustifDom_letuan.pdf", date: "2026-05-15" },
      releve_banque: { statut: "ok", nom: "Releve_letuan.pdf", date: "2026-05-16" },
      selfie: { statut: "ok", nom: "Selfie_letuan.jpg", date: "2026-05-17" },
      avis_impot: { statut: "expire", nom: "AvisImpot_letuan.pdf", date: "2025-04-10" },
    },
    tickets: [
      { id: 103, titre: "Document expiré — avis d'impôt", statut: "ouvert", priorite: "normal", auteur: "admin", date: "2026-06-11", message: "Votre avis d'imposition est expiré (2025). Merci de fournir celui de 2026." }
    ]
  },
  {
    id: 4,
    nom: "Darda",
    prenom: "Nicolas",
    email: "n.darda@icloud.com",
    tel: "+33 6 55 44 33 22",
    adresse: "22 Rue du Faubourg, 67000 Strasbourg",
    type_compte: "Anonyme",
    pays: "Seychelles",
    statut: "complet",
    progression: 100,
    date_creation: "2026-04-05",
    docs: {
      cni: { statut: "ok", nom: "CNI_darda.pdf", date: "2026-04-05" },
      justif_dom: { statut: "ok", nom: "JustifDom_darda.pdf", date: "2026-04-05" },
      releve_banque: { statut: "ok", nom: "Releve_darda.pdf", date: "2026-04-06" },
      selfie: { statut: "ok", nom: "Selfie_darda.jpg", date: "2026-04-06" },
      avis_impot: { statut: "ok", nom: "AvisImpot_darda.pdf", date: "2026-04-07" },
    },
    tickets: []
  },
  {
    id: 5,
    nom: "Roy",
    prenom: "Sandrine",
    email: "s.roy@yahoo.fr",
    tel: "+33 6 78 90 12 34",
    adresse: "5 Place Bellecour, 69002 Lyon",
    type_compte: "Nominatif",
    pays: "Malte",
    statut: "doc_manquant",
    progression: 40,
    date_creation: "2026-06-01",
    docs: {
      cni: { statut: "ok", nom: "CNI_roy.pdf", date: "2026-06-01" },
      justif_dom: { statut: "manquant", nom: null, date: null },
      releve_banque: { statut: "manquant", nom: null, date: null },
      selfie: { statut: "manquant", nom: null, date: null },
      avis_impot: { statut: "manquant", nom: null, date: null },
    },
    tickets: []
  }
];

export const PAYS_DISPONIBLES = [
  { nom: "Belgique", type: ["Nominatif", "Anonyme"], delai: "15mn-2 jours" },
  { nom: "Malte", type: ["Nominatif"], delai: "30mn-2jours" },
  { nom: "Hollande", type: ["Nominatif", "Anonyme"], delai: "30mn-2jours" },
  { nom: "Estonie", type: ["Nominatif", "Anonyme"], delai: "30mn-2jours" }
];

export const DOCS_LABELS = {
  cni: "CNI / Passeport",
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
