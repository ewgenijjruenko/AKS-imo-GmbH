import React from 'react';
import {
  LayoutDashboard, Map, FileText, Building2, Landmark,
  Eye, Star, BarChart3, FileSpreadsheet, Settings,
  RefreshCw, X, Satellite, Globe, Newspaper, Building
} from 'lucide-react';

interface SidebarComponentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navSections = [
  {
    items: [
      { id: 'dashboard',      label: 'Dashboard',       icon: LayoutDashboard },
      { id: 'karte',          label: 'Kartenansicht',   icon: Map },
      { id: 'ausschreibungen',label: 'Ausschreibungen', icon: FileText },
      { id: 'neubaugebiete',  label: 'Neubaugebiete',  icon: Building2 },
      { id: 'behoerden',      label: 'Behörden',        icon: Landmark },
    ],
  },
  {
    label: 'Merklisten',
    items: [
      { id: 'beobachtet', label: 'Beobachtete Gebiete', icon: Eye },
      { id: 'favoriten',  label: 'Favoriten',           icon: Star },
    ],
  },
  {
    label: 'Auswertung',
    items: [
      { id: 'analytics', label: 'Analysen', icon: BarChart3 },
      { id: 'berichte',  label: 'Reports',  icon: FileSpreadsheet },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'einstellungen', label: 'Einstellungen', icon: Settings },
    ],
  },
];

const dataSources = [
  { icon: Map,       label: 'Google Maps API' },
  { icon: Satellite, label: 'Google Satellite' },
  { icon: Globe,     label: 'OpenStreetMap' },
  { icon: FileText,  label: 'Ausschreibungen.de' },
  { icon: Newspaper, label: 'Bundesanzeiger' },
  { icon: Building,  label: 'Kommunale Bauämter' },
];

export const SidebarComponent: React.FC<SidebarComponentProps> = ({
  activeTab, setActiveTab, isOpen, onClose,
}) => {
  const handleNav = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* ── Logo ─────────────────────────────────────── */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="1" width="30" height="30" rx="4" stroke="var(--color-primary)" strokeWidth="0.8" strokeDasharray="2.5 2.5" opacity="0.25" />
              <line x1="11" y1="1" x2="11" y2="31" stroke="var(--color-primary)" strokeWidth="0.8" strokeDasharray="2.5 2.5" opacity="0.15" />
              <line x1="21" y1="1" x2="21" y2="31" stroke="var(--color-primary)" strokeWidth="0.8" strokeDasharray="2.5 2.5" opacity="0.15" />
              <path d="M4 26 L4 15 L16 6 L28 15 L28 26" stroke="var(--color-text-muted)" strokeWidth="1.2" opacity="0.4" fill="none" />
              <line x1="4" y1="26" x2="28" y2="26" stroke="var(--color-text-main)" strokeWidth="2" />
              <circle cx="19.5" cy="16" r="5.5" stroke="var(--color-primary)" strokeWidth="1.8" fill="var(--color-primary)" fillOpacity="0.10" />
              <line x1="23.5" y1="20" x2="27" y2="23.5" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M19.5 12.5 L20.8 15.5 L19.5 14.5 L18.2 15.5 Z" fill="var(--color-primary)" />
            </svg>
          </div>
          <div className="sidebar-title-container">
            <h2 className="sidebar-title">BauScout</h2>
            <span className="sidebar-subtitle">A member of AKS-imo GmbH</span>
          </div>
          {isOpen && (
            <button onClick={onClose} className="sidebar-close-btn" aria-label="Menü schließen">
              <X size={18} />
            </button>
          )}
        </div>

        {/* ── Navigation ───────────────────────────────── */}
        <nav className="sidebar-nav">
          {navSections.map((section, si) => (
            <div key={si} className="sidebar-section">
              {si > 0 && section.label && (
                <span className="sidebar-section-label">{section.label}</span>
              )}
              {section.items.map(({ id, label, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`sidebar-link ${activeTab === id ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); handleNav(id); }}
                  title={label}
                >
                  <Icon size={16} />
                  <span className="sidebar-link-label">{label}</span>
                </a>
              ))}
            </div>
          ))}
        </nav>

        {/* ── Footer ───────────────────────────────────── */}
        <div className="sidebar-footer">
          <div className="data-sources-card">
            <h4 className="data-sources-title">Datenquellen</h4>
            <div className="data-sources-list">
              {dataSources.map(({ icon: Icon, label }) => (
                <div key={label} className="data-source-item">
                  <Icon size={11} className="data-source-icon" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="sidebar-update-info">
            <RefreshCw size={11} />
            <span>Aktualisiert: 22.05.2024, 10:30</span>
          </div>
        </div>
      </div>
    </>
  );
};
