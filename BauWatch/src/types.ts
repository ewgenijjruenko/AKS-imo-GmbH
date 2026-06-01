export interface DocumentItem {
  name: string;
  url: string;
  size: string;
}

export type ProjectStatus = 'planung' | 'ausschreibung' | 'bau' | 'abgeschlossen';

export interface DevelopmentArea {
  id: string;
  title: string;
  location: string;
  district: string;
  state?: string;
  areaSize: number; // in hectares (ha)
  units: number;    // Wohneinheiten (ca.)
  authority: string; // e.g. "Stadt Münster - Amt für Stadtentwicklung"
  status: ProjectStatus;
  deadline?: string;     // for 'ausschreibung'
  publishDate?: string;  // for 'planung'
  startDate?: string;    // for 'bau'
  completionDate?: string; // for 'abgeschlossen'
  center: { lat: number; lng: number };
  polygon: { lat: number; lng: number }[];
  description: string;
  documents: DocumentItem[];
  contactPerson?: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
}

export interface User {
  email: string;
  name: string;
  favorites: string[]; // Array of DevelopmentArea IDs
  watchedAreas: string[]; // Array of DevelopmentArea IDs
}

export interface FilterState {
  status: string;      // 'all' or ProjectStatus
  state: string;       // 'all' or Bundesland name
  areaSize: string;    // 'all', '< 3ha', '3-5ha', '> 5ha'
  timeframe: string;   // 'all', '2024', '2025', '2026+'
  authority: string;   // 'all' or specific authority
  search: string;      // search query
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}
