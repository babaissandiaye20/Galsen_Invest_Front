// Données mock pour les maquettes

export const mockInvestorProfile = {
  id: "inv-001",
  firstName: "Amadou",
  lastName: "Diallo",
  email: "amadou.diallo@email.com",
  phone: "+221771234567",
  kycLevel: "L1",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amadou",
  totalInvested: 2500000,
  investmentCount: 5,
  monthlyLimit: 500000,
  monthlyUsed: 250000,
  walletBalance: 150000
};

export const mockBusinessProfile = {
  id: "bus-001",
  companyName: "Galsen Tech SARL",
  tradeName: "GalsenTech",
  legalForm: "SARL",
  email: "contact@galsentech.sn",
  phone: "+221771234567",
  kycStatus: "APPROVED",
  logo: "https://api.dicebear.com/7.x/shapes/svg?seed=GalsenTech",
  activeCampaigns: 2,
  totalRaised: 8500000,
  investorCount: 45,
  successRate: 85
};

export const mockCampaigns = [
  {
    id: "camp-001",
    title: "Financement ferme bio au Sénégal",
    shortDescription: "Aidez-nous à développer notre ferme biologique et à créer des emplois locaux dans la région de Thiès.",
    category: "Agriculture",
    categoryColor: "#10B981",
    goalAmount: 10000000,
    raisedAmount: 7500000,
    minInvestment: 50000,
    investorCount: 35,
    daysLeft: 15,
    status: "ACTIVE",
    coverImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
    businessName: "Ferme Bio Thiès",
    businessLogo: "https://api.dicebear.com/7.x/shapes/svg?seed=FermeBio",
    startDate: "2026-01-15",
    endDate: "2026-02-20"
  },
  {
    id: "camp-002",
    title: "Expansion centre de formation digitale",
    shortDescription: "Développement de notre centre de formation aux métiers du numérique pour 200 jeunes par an.",
    category: "Éducation",
    categoryColor: "#3B82F6",
    goalAmount: 5000000,
    raisedAmount: 4200000,
    minInvestment: 25000,
    investorCount: 28,
    daysLeft: 8,
    status: "ACTIVE",
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
    businessName: "Digital Academy",
    businessLogo: "https://api.dicebear.com/7.x/shapes/svg?seed=DigitalAcademy",
    startDate: "2026-01-20",
    endDate: "2026-02-13"
  },
  {
    id: "camp-003",
    title: "Plateforme e-commerce local",
    shortDescription: "Création d'une marketplace connectant producteurs locaux et consommateurs à Dakar.",
    category: "Tech",
    categoryColor: "#8B5CF6",
    goalAmount: 15000000,
    raisedAmount: 12500000,
    minInvestment: 100000,
    investorCount: 52,
    daysLeft: 22,
    status: "ACTIVE",
    coverImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
    businessName: "Galsen Market",
    businessLogo: "https://api.dicebear.com/7.x/shapes/svg?seed=GalsenMarket",
    startDate: "2026-01-10",
    endDate: "2026-02-27"
  },
  {
    id: "camp-004",
    title: "Clinique mobile en zones rurales",
    shortDescription: "Acquisition d'un véhicule médicalisé pour soins de santé primaire en milieu rural.",
    category: "Santé",
    categoryColor: "#EF4444",
    goalAmount: 8000000,
    raisedAmount: 3200000,
    minInvestment: 50000,
    investorCount: 18,
    daysLeft: 30,
    status: "ACTIVE",
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
    businessName: "Santé Pour Tous",
    businessLogo: "https://api.dicebear.com/7.x/shapes/svg?seed=SantePourTous",
    startDate: "2026-02-01",
    endDate: "2026-03-07"
  },
  {
    id: "camp-005",
    title: "Atelier de transformation fruits locaux",
    shortDescription: "Installation d'un atelier de transformation de fruits en jus et confitures bio.",
    category: "Agroalimentaire",
    categoryColor: "#F59E0B",
    goalAmount: 6000000,
    raisedAmount: 6000000,
    minInvestment: 50000,
    investorCount: 42,
    daysLeft: 0,
    status: "CLOSED",
    coverImage: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800",
    businessName: "Fruits du Terroir",
    businessLogo: "https://api.dicebear.com/7.x/shapes/svg?seed=FruitsTerroir",
    startDate: "2025-12-01",
    endDate: "2026-01-15"
  },
  {
    id: "camp-006",
    title: "Centre de recyclage plastique",
    shortDescription: "Création d'une unité de collecte et recyclage du plastique pour l'économie circulaire.",
    category: "Environnement",
    categoryColor: "#059669",
    goalAmount: 12000000,
    raisedAmount: 1500000,
    minInvestment: 75000,
    investorCount: 12,
    daysLeft: 45,
    status: "ACTIVE",
    coverImage: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800",
    businessName: "EcoPlast Sénégal",
    businessLogo: "https://api.dicebear.com/7.x/shapes/svg?seed=EcoPlast",
    startDate: "2026-01-25",
    endDate: "2026-03-20"
  }
];

export const mockInvestments = [
  {
    id: "inv-001",
    campaignId: "camp-001",
    campaignTitle: "Financement ferme bio au Sénégal",
    amount: 500000,
    date: "2026-01-20",
    status: "COMPLETED"
  },
  {
    id: "inv-002",
    campaignId: "camp-002",
    campaignTitle: "Expansion centre de formation digitale",
    amount: 250000,
    date: "2026-01-25",
    status: "COMPLETED"
  },
  {
    id: "inv-003",
    campaignId: "camp-003",
    campaignTitle: "Plateforme e-commerce local",
    amount: 1000000,
    date: "2026-01-28",
    status: "COMPLETED"
  },
  {
    id: "inv-004",
    campaignId: "camp-004",
    campaignTitle: "Clinique mobile en zones rurales",
    amount: 500000,
    date: "2026-02-02",
    status: "PENDING"
  },
  {
    id: "inv-005",
    campaignId: "camp-006",
    campaignTitle: "Centre de recyclage plastique",
    amount: 250000,
    date: "2026-02-04",
    status: "COMPLETED"
  }
];

export const mockWalletTransactions = [
  {
    id: "tx-001",
    date: "2026-02-04 14:30",
    type: "INVESTMENT",
    amount: -250000,
    description: "Investissement - Centre de recyclage plastique",
    status: "COMPLETED"
  },
  {
    id: "tx-002",
    date: "2026-02-02 10:15",
    type: "INVESTMENT",
    amount: -500000,
    description: "Investissement - Clinique mobile en zones rurales",
    status: "PENDING"
  },
  {
    id: "tx-003",
    date: "2026-01-28 16:45",
    type: "INVESTMENT",
    amount: -1000000,
    description: "Investissement - Plateforme e-commerce local",
    status: "COMPLETED"
  },
  {
    id: "tx-004",
    date: "2026-01-25 09:20",
    type: "DEPOSIT",
    amount: 2000000,
    description: "Recharge wallet",
    status: "COMPLETED"
  },
  {
    id: "tx-005",
    date: "2026-01-20 11:30",
    type: "INVESTMENT",
    amount: -500000,
    description: "Investissement - Financement ferme bio au Sénégal",
    status: "COMPLETED"
  }
];

export const mockCategories = [
  { id: "cat-001", name: "Agriculture", color: "#10B981" },
  { id: "cat-002", name: "Éducation", color: "#3B82F6" },
  { id: "cat-003", name: "Tech", color: "#8B5CF6" },
  { id: "cat-004", name: "Santé", color: "#EF4444" },
  { id: "cat-005", name: "Agroalimentaire", color: "#F59E0B" },
  { id: "cat-006", name: "Environnement", color: "#059669" }
];

export const mockPendingCampaigns = [
  {
    id: "camp-rev-001",
    title: "Centre d'innovation textile",
    businessName: "Textile Innovation Lab",
    goalAmount: 8000000,
    submittedDate: "2026-02-03",
    category: "Industrie",
    status: "REVIEW"
  },
  {
    id: "camp-rev-002",
    title: "Application mobile de livraison",
    businessName: "QuickDeliver",
    goalAmount: 5000000,
    submittedDate: "2026-02-04",
    category: "Tech",
    status: "REVIEW"
  }
];

export const mockPendingDocuments = [
  {
    id: "doc-001",
    userName: "Fatou Sow",
    userEmail: "fatou.sow@email.com",
    documentType: "CNI",
    uploadDate: "2026-02-03",
    status: "PENDING"
  },
  {
    id: "doc-002",
    userName: "Moussa Ndiaye",
    userEmail: "moussa.ndiaye@email.com",
    documentType: "Passeport",
    uploadDate: "2026-02-04",
    status: "PENDING"
  },
  {
    id: "doc-003",
    userName: "Awa Diop",
    userEmail: "awa.diop@email.com",
    documentType: "Justificatif domicile",
    uploadDate: "2026-02-04",
    status: "PENDING"
  }
];

export const mockSectors = [
  { id: "sec-001", name: "Agriculture" },
  { id: "sec-002", name: "Technologies de l'information" },
  { id: "sec-003", name: "Commerce" },
  { id: "sec-004", name: "Santé" },
  { id: "sec-005", name: "Éducation" }
];

export const mockCountries = [
  { code: "SN", name: "Sénégal" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "ML", name: "Mali" },
  { code: "BF", name: "Burkina Faso" }
];
