export interface ThemeDefinition {
  id: string;
  name: string;
  primaryColor: string;
  themeMode: "light" | "dark";
  fontFamily: string;
  borderRadius: number;
  spacing: number;
}

export const CURATED_THEMES: ThemeDefinition[] = [
  {
    id: "indigo-modern",
    name: "Indigo Modern",
    primaryColor: "#4f46e5",
    themeMode: "dark",
    fontFamily: "'Outfit', sans-serif",
    borderRadius: 16,
    spacing: 5,
  },
  {
    id: "midnight-pro",
    name: "Midnight Pro",
    primaryColor: "#0ea5e9",
    themeMode: "dark",
    fontFamily: "'Inter', sans-serif",
    borderRadius: 8,
    spacing: 6,
  },
  {
    id: "ruby-clean",
    name: "Ruby Clean",
    primaryColor: "#e11d48",
    themeMode: "light",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: 24,
    spacing: 4,
  },
  {
    id: "forest-minimal",
    name: "Forest Minimal",
    primaryColor: "#10b981",
    themeMode: "dark",
    fontFamily: "'Cabinet Grotesk', sans-serif",
    borderRadius: 0,
    spacing: 7,
  },
  {
    id: "sunset-vibrant",
    name: "Sunset Vibrant",
    primaryColor: "#f59e0b",
    themeMode: "light",
    fontFamily: "'Instrument Sans', sans-serif",
    borderRadius: 32,
    spacing: 5,
  },
  {
    id: "slate-corporate",
    name: "Slate Corporate",
    primaryColor: "#334155",
    themeMode: "light",
    fontFamily: "'Roboto', sans-serif",
    borderRadius: 4,
    spacing: 4,
  },
  {
    id: "violet-luxury",
    name: "Violet Luxury",
    primaryColor: "#8b5cf6",
    themeMode: "dark",
    fontFamily: "'Playfair Display', serif",
    borderRadius: 20,
    spacing: 6,
  },
];
