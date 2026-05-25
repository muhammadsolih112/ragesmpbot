import { useState, useEffect } from "react";
import { donations as defaultDonations, services as defaultServices, currencies as defaultCurrencies, type Donation } from "./donations";

export type SiteLinks = {
  serverIp: string;
  serverVersion: string;
  promoCode: string;
  promoBonus: string;
  telegramBot: string;
  telegramChannel: string;
  telegramAdmin: string;
  paymentCard: string;
  paymentOwner: string;
  paymentBank: string;
  botApiUrl: string; // Bot HTTP API endpoint (e.g. https://example.com/api/orders)
};

export type SiteConfig = {
  donations: Donation[];
  services: Donation[];
  currencies: Donation[];
  links: SiteLinks;
};

const DEFAULT_CONFIG: SiteConfig = {
  donations: defaultDonations,
  services: defaultServices,
  currencies: defaultCurrencies,
  links: {
    serverIp: "ragesmp.uz",
    serverVersion: "1.12.2 - 1.21.11",
    promoCode: "/promo vebuca",
    promoBonus: "+12.500$ O'yin Valyutasi",
    telegramBot: "https://t.me/RageSMP_bot",
    telegramChannel: "https://t.me/RageSMPuz",
    telegramAdmin: "https://t.me/vebuca",
    paymentCard: "9860 1201 6372 1422",
    paymentOwner: "ASILBEK BURHONOV",
    paymentBank: "HUMO",
    botApiUrl: "http://localhost:3001/api/orders",
  },
};

const STORAGE_KEY = "ragesmp_site_config";

let cachedConfig: SiteConfig | null = null;
const listeners = new Set<(c: SiteConfig) => void>();

function loadConfig(): SiteConfig {
  if (cachedConfig) return cachedConfig;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged: SiteConfig = {
        donations: Array.isArray(parsed.donations) ? parsed.donations : DEFAULT_CONFIG.donations,
        services: Array.isArray(parsed.services) ? parsed.services : DEFAULT_CONFIG.services,
        currencies: Array.isArray(parsed.currencies) ? parsed.currencies : DEFAULT_CONFIG.currencies,
        links: { ...DEFAULT_CONFIG.links, ...(parsed.links || {}) },
      };
      cachedConfig = merged;
      return merged;
    }
  } catch {}
  cachedConfig = DEFAULT_CONFIG;
  return DEFAULT_CONFIG;
}

function saveConfig(c: SiteConfig) {
  cachedConfig = c;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {}
  listeners.forEach((l) => l(c));
}

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(() => loadConfig());

  useEffect(() => {
    const listener = (c: SiteConfig) => setConfig(c);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const updateDonation = (id: string, patch: Partial<Donation>) => {
    const updated: SiteConfig = {
      ...config,
      donations: config.donations.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    };
    saveConfig(updated);
  };

  const updateService = (id: string, patch: Partial<Donation>) => {
    const updated: SiteConfig = {
      ...config,
      services: config.services.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    };
    saveConfig(updated);
  };

  const updateCurrency = (id: string, patch: Partial<Donation>) => {
    const updated: SiteConfig = {
      ...config,
      currencies: config.currencies.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    };
    saveConfig(updated);
  };

  const updateLink = (key: keyof SiteLinks, value: string) => {
    saveConfig({ ...config, links: { ...config.links, [key]: value } });
  };

  const resetConfig = () => saveConfig(DEFAULT_CONFIG);

  return { config, updateDonation, updateService, updateCurrency, updateLink, resetConfig };
}

export function getCurrencyUnitPrice(id: string): number {
  const cfg = loadConfig();
  const item = cfg.currencies.find((c) => c.id === id);
  return item?.price ?? 0;
}
