export type Donation = {
  id: string;
  name: string;
  price: number;
  color: string;
  badge?: string;
  tagline: string;
  perks: string[];
  commands: string[];
  emoji: string;
};

export const donations: Donation[] = [
  {
    id: "ragepro",
    name: "RagePro",
    price: 10000,
    color: "from-lime-300 via-emerald-400 to-green-500",
    tagline: "Boshlang'ich paket: spawn, fly va 2 ta home imkoniyati.",
    emoji: "🟢",
    perks: [
      "RagePro rank",
      "/spawn komandasi",
      "/fly komandasi",
      "/home 2 imkoniyati",
      "/kitplls to'plami",
    ],
    commands: ["/spawn", "/fly", "/sethome 2", "/kitplls"],
  },
  {
    id: "rageplus",
    name: "Rage+",
    price: 30000,
    color: "from-indigo-400 via-sky-500 to-cyan-400",
    badge: "Mashhur",
    tagline: "RagePro imkoniyatlari bilan birga: 3 ta home, kitpro va ptime.",
    emoji: "🔵",
    perks: [
      "RagePro paketidagi barcha imkoniyatlar",
      "/spawn komandasi",
      "/fly komandasi",
      "/home 2 imkoniyati",
      "/kitplls to'plami",
      "/home 3 imkoniyati",
      "/kitpro to'plami",
      "/ptime komandasi",
      "30 kunlik premium imkoniyatlar",
    ],
    commands: ["/sethome 3", "/kitpro", "/ptime"],
  },
  {
    id: "smpelite",
    name: "SMP Elite",
    price: 50000,
    color: "from-purple-500 via-fuchsia-500 to-violet-700",
    badge: "VIP",
    tagline: "RagePro va Rage+ imkoniyatlari bilan eng yuqori paket.",
    emoji: "🟣",
    perks: [
      "RagePro paketidagi barcha imkoniyatlar",
      "Rage+ paketidagi barcha imkoniyatlar",
      "/spawn komandasi",
      "/fly komandasi",
      "/home 2 va /home 3 imkoniyatlari",
      "/kitplls va /kitpro to'plamlari",
      "/ptime komandasi",
      "/home 5 imkoniyati",
      "/kitelite to'plami",
      "Donniy shards",
      "30 kunlik premium imkoniyatlar",
    ],
    commands: ["/sethome 5", "/kitelite", "/shards"],
  },
];

export const recentPurchases = [
  { player: "ShohruhPro", pkg: "SMP Elite", time: "5 daqiqa oldin", price: 50000 },
  { player: "AzizbekMC", pkg: "Rage+", time: "12 daqiqa oldin", price: 30000 },
  { player: "OlimjonUZ", pkg: "RagePro", time: "27 daqiqa oldin", price: 10000 },
  { player: "DonerKing", pkg: "RagePro", time: "1 soat oldin", price: 10000 },
  { player: "RageHunter", pkg: "SMP Elite", time: "1 soat oldin", price: 50000 },
  { player: "NightCraft", pkg: "Rage+", time: "2 soat oldin", price: 30000 },
  { player: "PixelWizard", pkg: "Rage+", time: "3 soat oldin", price: 30000 },
  { player: "MrSamarqand", pkg: "RagePro", time: "4 soat oldin", price: 10000 },
];

export const topDonators = [
  { player: "ShohruhPro", total: 250000, packages: 5 },
  { player: "RageHunter", total: 190000, packages: 5 },
  { player: "ToshkentBoy", total: 150000, packages: 4 },
  { player: "AzizbekMC", total: 120000, packages: 4 },
  { player: "NightCraft", total: 90000, packages: 3 },
];

export const fmtUZS = (n: number) =>
  new Intl.NumberFormat("uz-UZ").format(n) + " so'm";
