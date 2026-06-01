import React, { useState, useEffect, useMemo } from 'react';
import { SidebarComponent } from './SidebarComponent';
import { HeaderComponent } from './HeaderComponent';
import { FilterBar } from './FilterBar';
import { MapView } from './MapView';
import { TenderSidebar } from './TenderSidebar';
import { TenderDetailDrawer } from './TenderDetailDrawer';
import { mockAreas, mockNotifications } from '../mockData';
import type { DevelopmentArea, FilterState, NotificationItem } from '../types';
import {
  Star, Eye, Download, FileText, ChevronLeft,
  TrendingUp, TrendingDown, MapPin, Building2, Landmark,
  BarChart3, Zap, AlertTriangle, CheckCircle2, Clock,
  ArrowRight, Brain, Globe, Users, Activity
} from 'lucide-react';

/* ── AI mock data ───────────────────────────────────────────── */
const aiProjects = [
  { title: 'Regensburg Nord', state: 'Bayern', potenzial: 'Hoch' as const, status: 'ausschreibung' as const, score: 94 },
  { title: 'München Ost', state: 'Bayern', potenzial: 'Mittel' as const, status: 'planung' as const, score: 82 },
  { title: 'Nürnberg Süd', state: 'Bayern', potenzial: 'Hoch' as const, status: 'bau' as const, score: 91 },
  { title: 'Hamburg Harburg', state: 'Hamburg', potenzial: 'Mittel' as const, status: 'planung' as const, score: 78 },
  { title: 'Stuttgart Westbahnhof', state: 'Baden-Württemberg', potenzial: 'Hoch' as const, status: 'ausschreibung' as const, score: 88 },
  { title: 'Köln Deutz Nord', state: 'Nordrhein-Westfalen', potenzial: 'Niedrig' as const, status: 'planung' as const, score: 65 },
];

/* ── Settings API Key Input ──────────────────────────────────── */
const SettingsApiKeyInput: React.FC = () => {
  const [value, setValue] = React.useState(() => localStorage.getItem('VITE_GOOGLE_MAPS_API_KEY') || '');
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <input
        type="password"
        className="settings-input"
        placeholder="AIzaSy..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ flex: 1 }}
      />
      <button
        className="settings-btn"
        onClick={() => {
          localStorage.setItem('VITE_GOOGLE_MAPS_API_KEY', value);
          alert('Schlüssel gespeichert. Die Anwendung wird neu geladen.');
          window.location.reload();
        }}
      >
        Speichern
      </button>
    </div>
  );
};

/* ── Dashboard Props ─────────────────────────────────────────── */
interface DashboardProps {
  userName: string;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userName, onLogout, theme, toggleTheme }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleActiveTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'ausschreibungen') {
      setFilters(prev => ({ ...prev, status: 'ausschreibung' }));
    } else if (tab === 'karte' || tab === 'neubaugebiete') {
      setFilters(prev => ({ ...prev, status: 'all' }));
    }
  };

  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    state: 'all',
    areaSize: 'all',
    timeframe: 'all',
    authority: 'all',
    search: ''
  });

  const setSearchQuery = (query: string) => setFilters(prev => ({ ...prev, search: query }));

  const [areas] = useState<DevelopmentArea[]>(mockAreas);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [activeDetailArea, setActiveDetailArea] = useState<DevelopmentArea | null>(null);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('bauwatch_favorites');
    return saved ? JSON.parse(saved) : ['nord-ost-kinderhaus', 'hiltrup-west-suedlich'];
  });
  const [watchedAreas, setWatchedAreas] = useState<string[]>(() => {
    const saved = localStorage.getItem('bauwatch_watched');
    return saved ? JSON.parse(saved) : ['gievenbeck-erweiterung'];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);

  useEffect(() => { localStorage.setItem('bauwatch_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('bauwatch_watched', JSON.stringify(watchedAreas)); }, [watchedAreas]);

  const toggleFavorite = (id: string) =>
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleWatchlist = (id: string) =>
    setWatchedAreas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const markAllNotificationsRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const authorities = useMemo(
    () => Array.from(new Set(mockAreas.map(a => a.authority))),
    []
  );

  const states = useMemo(
    () => Array.from(new Set(mockAreas.map(a => a.state).filter(Boolean))) as string[],
    []
  );

  const filteredAreas = useMemo(() => areas.filter((area) => {
    if (filters.status !== 'all' && area.status !== filters.status) return false;
    if (filters.state !== 'all' && area.state !== filters.state) return false;
    if (filters.areaSize !== 'all') {
      if (filters.areaSize === 'small' && area.areaSize >= 3.0) return false;
      if (filters.areaSize === 'medium' && (area.areaSize < 3.0 || area.areaSize > 5.0)) return false;
      if (filters.areaSize === 'large' && area.areaSize <= 5.0) return false;
    }
    if (filters.timeframe !== 'all') {
      const year = filters.timeframe;
      if (area.status === 'planung' && !area.publishDate?.includes(year)) return false;
      if (area.status === 'ausschreibung' && !area.deadline?.includes(year)) return false;
      if (area.status === 'bau' && !area.startDate?.includes(year)) return false;
      if (area.status === 'abgeschlossen' && !area.completionDate?.includes(year)) return false;
    }
    if (filters.authority !== 'all' && area.authority !== filters.authority) return false;
    if (filters.search.trim() !== '') {
      const q = filters.search.toLowerCase();
      if (!area.title.toLowerCase().includes(q) &&
          !area.location.toLowerCase().includes(q) &&
          !area.authority.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [areas, filters]);

  const analytics = useMemo(() => {
    const totalArea = mockAreas.reduce((sum, a) => sum + a.areaSize, 0);
    const totalUnits = mockAreas.reduce((sum, a) => sum + a.units, 0);
    const activeAusschreibungen = mockAreas.filter(a => a.status === 'ausschreibung').length;
    const unitsInPlanung = mockAreas.filter(a => a.status === 'planung').reduce((sum, a) => sum + a.units, 0);
    const completedUnits = mockAreas.filter(a => a.status === 'abgeschlossen').reduce((sum, a) => sum + a.units, 0);
    const statusCounts = {
      planung: mockAreas.filter(a => a.status === 'planung').length,
      ausschreibung: mockAreas.filter(a => a.status === 'ausschreibung').length,
      bau: mockAreas.filter(a => a.status === 'bau').length,
      abgeschlossen: mockAreas.filter(a => a.status === 'abgeschlossen').length,
    };
    const byState: Record<string, number> = {};
    mockAreas.forEach(a => { if (a.state) byState[a.state] = (byState[a.state] || 0) + a.areaSize; });
    const stateData = Object.entries(byState).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const maxStatusCount = Math.max(...Object.values(statusCounts), 1);
    const maxStateArea = Math.max(...stateData.map(([, v]) => v), 1);
    const stateAbbr: Record<string, string> = {
      'Nordrhein-Westfalen': 'NRW', 'Bayern': 'BY', 'Baden-Württemberg': 'BW',
      'Hamburg': 'HH', 'Berlin': 'BE', 'Brandenburg': 'BB', 'Hessen': 'HE',
    };
    return { totalArea, totalUnits, activeAusschreibungen, unitsInPlanung, completedUnits, statusCounts, stateData, maxStatusCount, maxStateArea, stateAbbr };
  }, []);

  const getStatusLabel = (status: DevelopmentArea['status']) => {
    const labels = { planung: 'In Planung', ausschreibung: 'Ausschreibung', bau: 'Im Bau', abgeschlossen: 'Abgeschlossen' };
    return labels[status] ?? status;
  };

  const getStatusBadgeClass = (status: DevelopmentArea['status']) => {
    const classes = { planung: 'badge-planung', ausschreibung: 'badge-ausschreibung', bau: 'badge-bau', abgeschlossen: 'badge-abgeschlossen' };
    return classes[status] ?? '';
  };

  /* ── Upcoming deadlines ─────────────────────────────────────── */
  const upcomingDeadlines = mockAreas
    .filter(a => a.status === 'ausschreibung' && a.deadline)
    .slice(0, 3);

  /* ── Behörden data ──────────────────────────────────────────── */
  const behoerdenData = useMemo(() => {
    const map = new Map<string, { count: number; state: string; statuses: string[] }>();
    mockAreas.forEach(a => {
      if (!map.has(a.authority)) {
        map.set(a.authority, { count: 0, state: a.state ?? '–', statuses: [] });
      }
      const entry = map.get(a.authority)!;
      entry.count += 1;
      if (!entry.statuses.includes(a.status)) entry.statuses.push(a.status);
    });
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.count - a.count);
  }, []);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="app-grid">
      <SidebarComponent
        activeTab={activeTab}
        setActiveTab={handleActiveTabChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="main-container">
        <HeaderComponent
          searchQuery={filters.search}
          setSearchQuery={setSearchQuery}
          notifications={notifications}
          markAllNotificationsRead={markAllNotificationsRead}
          userName={userName}
          onLogout={onLogout}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {/* ── MAP / AUSSCHREIBUNGEN VIEW ─────────────────────────── */}
        {(activeTab === 'karte' || activeTab === 'ausschreibungen') && (
          <>
            {/* Compact KPI strip */}
            <div className="kpi-stats-strip">
              <div className="kpi-stat-chip">
                <span className="kpi-chip-icon kpi-chip-icon-blue"><Building2 size={13} /></span>
                <span className="kpi-chip-value">{mockAreas.length}</span>
                <span className="kpi-chip-label">Erkannte Gebiete</span>
              </div>
              <div className="kpi-stat-chip">
                <span className="kpi-chip-icon kpi-chip-icon-teal"><FileText size={13} /></span>
                <span className="kpi-chip-value">{analytics.activeAusschreibungen}</span>
                <span className="kpi-chip-label">Ausschreibungen</span>
              </div>
              <div className="kpi-stat-chip">
                <span className="kpi-chip-icon kpi-chip-icon-amber"><Zap size={13} /></span>
                <span className="kpi-chip-value">{analytics.totalUnits.toLocaleString('de-DE')}</span>
                <span className="kpi-chip-label">Pot. Wohneinheiten</span>
              </div>
              <div className="kpi-stat-chip">
                <span className="kpi-chip-icon kpi-chip-icon-violet"><Activity size={13} /></span>
                <span className="kpi-chip-value">{filteredAreas.length}</span>
                <span className="kpi-chip-label">Gefilterte Projekte</span>
              </div>
            </div>

            <FilterBar
              filters={filters}
              setFilters={setFilters}
              authorities={authorities}
              states={states}
            />

            <div className="dashboard-content-split">
              <MapView
                areas={filteredAreas}
                selectedAreaId={selectedAreaId}
                setSelectedAreaId={setSelectedAreaId}
                filters={filters}
                setFilters={setFilters}
                theme={theme}
              />
              <TenderSidebar
                areas={filteredAreas}
                selectedAreaId={selectedAreaId}
                setSelectedAreaId={setSelectedAreaId}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                watchedAreas={watchedAreas}
                toggleWatchlist={toggleWatchlist}
                onOpenDetails={setActiveDetailArea}
                isCollapsed={isRightSidebarCollapsed}
                onToggleCollapse={() => setIsRightSidebarCollapsed(true)}
              />
              {isRightSidebarCollapsed && (
                <button
                  className="btn-expand-sidebar"
                  onClick={() => setIsRightSidebarCollapsed(false)}
                  title="Liste einblenden"
                >
                  <ChevronLeft size={18} />
                  <span style={{ marginLeft: '4px' }}>Liste einblenden</span>
                </button>
              )}
            </div>
          </>
        )}

        {/* ── DASHBOARD LANDING PAGE ─────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-page">
            {/* Welcome */}
            <div className="dashboard-welcome">
              <div>
                <h1 className="dashboard-welcome-title">Guten Tag, {userName.split(' ')[0]}!</h1>
                <p className="dashboard-welcome-sub">
                  Hier ist Ihre Übersicht für {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.
                </p>
              </div>
              <button
                className="btn-goto-map"
                onClick={() => handleActiveTabChange('karte')}
              >
                <MapPin size={15} /> Zur Kartenansicht <ArrowRight size={14} />
              </button>
            </div>

            {/* KPI Cards */}
            <div className="dashboard-kpi-grid">
              <div className="kpi-card kpi-card-blue">
                <div className="kpi-card-icon-wrap">
                  <Building2 size={22} />
                </div>
                <div className="kpi-card-body">
                  <span className="kpi-card-label">Neubaugebiete erkannt</span>
                  <span className="kpi-card-value">1.245</span>
                  <span className="kpi-card-trend trend-up">
                    <TrendingUp size={12} /> +48 diese Woche
                  </span>
                </div>
              </div>

              <div className="kpi-card kpi-card-teal">
                <div className="kpi-card-icon-wrap">
                  <FileText size={22} />
                </div>
                <div className="kpi-card-body">
                  <span className="kpi-card-label">Neue Ausschreibungen</span>
                  <span className="kpi-card-value">387</span>
                  <span className="kpi-card-trend trend-up">
                    <TrendingUp size={12} /> +12 heute
                  </span>
                </div>
              </div>

              <div className="kpi-card kpi-card-amber">
                <div className="kpi-card-icon-wrap">
                  <Users size={22} />
                </div>
                <div className="kpi-card-body">
                  <span className="kpi-card-label">Potenzielle Wohneinheiten</span>
                  <span className="kpi-card-value">82.400</span>
                  <span className="kpi-card-trend trend-up">
                    <TrendingUp size={12} /> +2.100 diesen Monat
                  </span>
                </div>
              </div>

              <div className="kpi-card kpi-card-violet">
                <div className="kpi-card-icon-wrap">
                  <Globe size={22} />
                </div>
                <div className="kpi-card-body">
                  <span className="kpi-card-label">Beobachtete Kommunen</span>
                  <span className="kpi-card-value">612</span>
                  <span className="kpi-card-trend trend-neutral">
                    <TrendingDown size={12} /> Bundesweit erfasst
                  </span>
                </div>
              </div>
            </div>

            {/* Two-column: Recent + Deadlines */}
            <div className="dashboard-two-col">
              {/* Recent Projects */}
              <div className="dashboard-section-card">
                <div className="dashboard-section-header">
                  <h3 className="dashboard-section-title">
                    <Activity size={16} /> Aktuelle Projekte
                  </h3>
                  <button
                    className="btn-section-more"
                    onClick={() => handleActiveTabChange('neubaugebiete')}
                  >
                    Alle anzeigen <ArrowRight size={13} />
                  </button>
                </div>
                <div className="dashboard-project-list">
                  {mockAreas.slice(0, 5).map(area => (
                    <div
                      key={area.id}
                      className="dashboard-project-row"
                      onClick={() => { setActiveDetailArea(area); }}
                    >
                      <div className={`dashboard-project-dot dot-${area.status}`} />
                      <div className="dashboard-project-info">
                        <span className="dashboard-project-name">{area.title}</span>
                        <span className="dashboard-project-location">
                          <MapPin size={10} /> {area.location}
                        </span>
                      </div>
                      <span className={`tender-card-badge ${getStatusBadgeClass(area.status)}`}>
                        {getStatusLabel(area.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="dashboard-section-card">
                <div className="dashboard-section-header">
                  <h3 className="dashboard-section-title">
                    <AlertTriangle size={16} /> Ablaufende Fristen
                  </h3>
                  <button
                    className="btn-section-more"
                    onClick={() => handleActiveTabChange('ausschreibungen')}
                  >
                    Alle Ausschreibungen <ArrowRight size={13} />
                  </button>
                </div>
                <div className="dashboard-deadline-list">
                  {upcomingDeadlines.length === 0 ? (
                    <div className="dashboard-empty">Keine anstehenden Fristen.</div>
                  ) : upcomingDeadlines.map(area => (
                    <div key={area.id} className="dashboard-deadline-row" onClick={() => setActiveDetailArea(area)}>
                      <div className="deadline-icon-wrap">
                        <Clock size={14} />
                      </div>
                      <div className="deadline-info">
                        <span className="deadline-title">{area.title}</span>
                        <span className="deadline-date">Frist: {area.deadline}</span>
                      </div>
                      <span className="deadline-badge badge-ausschreibung">Ausschreibung</span>
                    </div>
                  ))}

                  {/* AI Insight teaser */}
                  <div className="ai-insight-teaser">
                    <div className="ai-teaser-icon">
                      <Brain size={16} />
                    </div>
                    <div>
                      <div className="ai-teaser-title">KI-Analyse verfügbar</div>
                      <div className="ai-teaser-desc">
                        6 Projekte mit hohem Potenzial identifiziert — Score ≥ 88
                      </div>
                    </div>
                    <button
                      className="btn-ai-teaser"
                      onClick={() => handleActiveTabChange('analytics')}
                    >
                      Analysen <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access */}
            <div className="dashboard-quick-access">
              {[
                { id: 'karte', label: 'Kartenansicht', icon: MapPin, desc: 'Alle Projekte auf der Karte' },
                { id: 'ausschreibungen', label: 'Ausschreibungen', icon: FileText, desc: `${analytics.activeAusschreibungen} aktive Vergaben` },
                { id: 'neubaugebiete', label: 'Neubaugebiete', icon: Building2, desc: `${mockAreas.length} erfasste Gebiete` },
                { id: 'analytics', label: 'KI-Analysen', icon: Brain, desc: 'Potenzialscoring & Trends' },
              ].map(item => (
                <button
                  key={item.id}
                  className="quick-access-card"
                  onClick={() => handleActiveTabChange(item.id)}
                >
                  <div className="quick-access-icon">
                    <item.icon size={20} />
                  </div>
                  <div className="quick-access-body">
                    <span className="quick-access-label">{item.label}</span>
                    <span className="quick-access-desc">{item.desc}</span>
                  </div>
                  <ArrowRight size={16} className="quick-access-arrow" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── NEUBAUGEBIETE TAB ─────────────────────────────────── */}
        {activeTab === 'neubaugebiete' && (
          <div className="tab-page">
            <div className="tab-page-header">
              <h2>Neubaugebiete</h2>
              <p>Alle erfassten Entwicklungsgebiete — sortiert nach aktueller Aktivität.</p>
            </div>

            <div className="filter-bar" style={{ marginBottom: '20px' }}>
              {(['all', 'planung', 'ausschreibung', 'bau', 'abgeschlossen'] as const).map(s => (
                <button
                  key={s}
                  className={`filter-tag-btn ${filters.status === s ? 'active' : ''}`}
                  onClick={() => setFilters(prev => ({ ...prev, status: s }))}
                >
                  {s === 'all' ? 'Alle' : getStatusLabel(s)}
                </button>
              ))}
            </div>

            <div className="tab-cards-grid">
              {filteredAreas.map(area => (
                <div key={area.id} className="neubau-card" onClick={() => setActiveDetailArea(area)}>
                  <div className="neubau-card-top">
                    <span className={`tender-card-badge ${getStatusBadgeClass(area.status)}`}>
                      {getStatusLabel(area.status)}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className={`btn-watchlist ${watchedAreas.includes(area.id) ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleWatchlist(area.id); }}
                        title="Beobachten"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className={`btn-bookmark ${favorites.includes(area.id) ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(area.id); }}
                        title="Favorit"
                      >
                        <Star size={14} fill={favorites.includes(area.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>

                  <h4 className="neubau-card-title">{area.title}</h4>

                  <div className="neubau-card-location">
                    <MapPin size={12} />
                    <span>{area.location}</span>
                    {area.state && <span className="neubau-state-chip">{area.state}</span>}
                  </div>

                  <div className="neubau-card-stats">
                    <div className="neubau-stat">
                      <span className="neubau-stat-value">{area.areaSize.toLocaleString('de-DE', { minimumFractionDigits: 1 })} ha</span>
                      <span className="neubau-stat-label">Fläche</span>
                    </div>
                    <div className="neubau-stat">
                      <span className="neubau-stat-value">{area.units > 0 ? `~${area.units}` : '–'}</span>
                      <span className="neubau-stat-label">Wohneinheiten</span>
                    </div>
                  </div>

                  <div className="neubau-card-authority">
                    <Landmark size={11} />
                    <span>{area.authority}</span>
                  </div>

                  <button className="btn-card-details" style={{ marginTop: '12px', width: '100%' }}>
                    Details anzeigen
                  </button>
                </div>
              ))}
              {filteredAreas.length === 0 && (
                <div className="tab-empty-state">Keine Projekte für diese Auswahl gefunden.</div>
              )}
            </div>
          </div>
        )}

        {/* ── BEHÖRDEN TAB ─────────────────────────────────────── */}
        {activeTab === 'behoerden' && (
          <div className="tab-page">
            <div className="tab-page-header">
              <h2>Behörden & Ämter</h2>
              <p>Übersicht aller zuständigen Behörden mit ihren aktiven Projekten.</p>
            </div>

            <div className="behoerden-grid">
              {behoerdenData.map(({ name, count, state, statuses }) => (
                <div key={name} className="behoerden-card">
                  <div className="behoerden-card-icon">
                    <Landmark size={20} />
                  </div>
                  <div className="behoerden-card-body">
                    <h4 className="behoerden-card-name">{name}</h4>
                    <div className="behoerden-card-state">
                      <MapPin size={11} /> {state}
                    </div>
                    <div className="behoerden-card-statuses">
                      {statuses.map(s => (
                        <span key={s} className={`tender-card-badge ${getStatusBadgeClass(s as DevelopmentArea['status'])}`} style={{ fontSize: '10px' }}>
                          {getStatusLabel(s as DevelopmentArea['status'])}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="behoerden-card-count">
                    <span className="behoerden-count-value">{count}</span>
                    <span className="behoerden-count-label">Projekte</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BEOBACHTET ───────────────────────────────────────── */}
        {activeTab === 'beobachtet' && (
          <div className="tab-page">
            <div className="tab-page-header">
              <h2>Beobachtete Gebiete</h2>
              <p>Gebiete, für die Sie Benachrichtigungen bei Statusänderungen aktiviert haben.</p>
            </div>
            <div className="tab-cards-grid">
              {areas.filter(a => watchedAreas.includes(a.id)).map(area => (
                <div key={area.id} className="tender-card" onClick={() => setActiveDetailArea(area)}>
                  <div className="tender-card-header">
                    <span className="tender-card-badge badge-beobachtet" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={12} /> Beobachtet
                    </span>
                    <button
                      className="btn-watchlist active"
                      onClick={(e) => { e.stopPropagation(); toggleWatchlist(area.id); }}
                      title="Beobachten beenden"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                  <h4 className="tender-card-title">{area.title}</h4>
                  <div className="tender-card-location">{area.location}</div>
                  <div className="tender-card-details">
                    <div className="tender-detail-row">
                      <span className="tender-detail-label">Fläche</span>
                      <span className="tender-detail-value">{area.areaSize} ha</span>
                    </div>
                    <div className="tender-detail-row">
                      <span className="tender-detail-label">Status</span>
                      <span className="tender-detail-value">{getStatusLabel(area.status)}</span>
                    </div>
                  </div>
                  <button className="btn-card-details" style={{ marginTop: '8px' }}>Details anzeigen</button>
                </div>
              ))}
              {watchedAreas.length === 0 && (
                <div className="tab-empty-state">Sie beobachten aktuell keine Gebiete.</div>
              )}
            </div>
          </div>
        )}

        {/* ── FAVORITEN ─────────────────────────────────────────── */}
        {activeTab === 'favoriten' && (
          <div className="tab-page">
            <div className="tab-page-header">
              <h2>Favoriten</h2>
              <p>Ihre gemerkten Bauprojekte und Ausschreibungs-Favoriten.</p>
            </div>
            <div className="tab-cards-grid">
              {areas.filter(a => favorites.includes(a.id)).map(area => (
                <div key={area.id} className="tender-card" onClick={() => setActiveDetailArea(area)}>
                  <div className="tender-card-header">
                    <span className="tender-card-badge badge-favorit" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={12} fill="currentColor" /> Favorit
                    </span>
                    <button
                      className="btn-bookmark active"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(area.id); }}
                      title="Aus Favoriten entfernen"
                    >
                      <Star size={16} fill="currentColor" />
                    </button>
                  </div>
                  <h4 className="tender-card-title">{area.title}</h4>
                  <div className="tender-card-location">{area.location}</div>
                  <div className="tender-card-details">
                    <div className="tender-detail-row">
                      <span className="tender-detail-label">Fläche</span>
                      <span className="tender-detail-value">{area.areaSize} ha</span>
                    </div>
                    <div className="tender-detail-row">
                      <span className="tender-detail-label">Status</span>
                      <span className="tender-detail-value">{getStatusLabel(area.status)}</span>
                    </div>
                  </div>
                  <button className="btn-card-details" style={{ marginTop: '8px' }}>Details anzeigen</button>
                </div>
              ))}
              {favorites.length === 0 && (
                <div className="tab-empty-state">Sie haben noch keine Favoriten markiert.</div>
              )}
            </div>
          </div>
        )}

        {/* ── ANALYTICS ────────────────────────────────────────── */}
        {activeTab === 'analytics' && (
          <div className="analytics-container">
            <div className="tab-page-header">
              <h2>Marktanalyse & KI-Insights</h2>
              <p>Statistische Auswertungen und KI-gestütztes Potenzialscoring für Bauprojekte in Deutschland.</p>
            </div>

            <div className="analytics-grid">
              <div className="analytics-stat-card">
                <span className="analytics-stat-label">Gesamtfläche</span>
                <span className="analytics-stat-value">{analytics.totalArea.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ha</span>
                <span className="analytics-stat-change up">Alle erfassten Projekte</span>
              </div>
              <div className="analytics-stat-card">
                <span className="analytics-stat-label">Aktive Ausschreibungen</span>
                <span className="analytics-stat-value">{analytics.activeAusschreibungen}</span>
                <span className="analytics-stat-change up">Laufende Vergabeverfahren</span>
              </div>
              <div className="analytics-stat-card">
                <span className="analytics-stat-label">Einheiten in Planung</span>
                <span className="analytics-stat-value">{analytics.unitsInPlanung.toLocaleString('de-DE')}</span>
                <span className="analytics-stat-change up">Geplante Wohneinheiten</span>
              </div>
              <div className="analytics-stat-card">
                <span className="analytics-stat-label">Fertiggestellt (YTD)</span>
                <span className="analytics-stat-value">{analytics.completedUnits.toLocaleString('de-DE')} WE</span>
                <span className="analytics-stat-change up">Abgeschlossene Projekte</span>
              </div>
            </div>

            <div className="analytics-charts-grid">
              <div className="analytics-chart-card">
                <h4 className="chart-header">Projekte nach Entwicklungsstatus</h4>
                <div className="chart-body">
                  {([
                    { label: 'Planung', key: 'planung', color: '#4f46e5' },
                    { label: 'Ausschreib.', key: 'ausschreibung', color: '#0d9488' },
                    { label: 'Im Bau', key: 'bau', color: '#f59e0b' },
                    { label: 'Fertig', key: 'abgeschlossen', color: '#64748b' },
                  ] as const).map(({ label, key, color }) => {
                    const count = analytics.statusCounts[key];
                    const h = Math.max(12, Math.round((count / analytics.maxStatusCount) * 160));
                    return (
                      <div key={key} className="chart-bar-container">
                        <div className="chart-bar" style={{ height: `${h}px`, backgroundColor: color }}>
                          <span className="chart-bar-value">{count}</span>
                        </div>
                        <span className="chart-bar-label">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="analytics-chart-card">
                <h4 className="chart-header">Hektar-Auslastung je Bundesland</h4>
                <div className="chart-body">
                  {analytics.stateData.map(([state, area]) => {
                    const h = Math.max(12, Math.round((area / analytics.maxStateArea) * 160));
                    const label = analytics.stateAbbr[state] || state.substring(0, 3);
                    return (
                      <div key={state} className="chart-bar-container">
                        <div className="chart-bar" style={{ height: `${h}px` }}>
                          <span className="chart-bar-value">{area.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                        </div>
                        <span className="chart-bar-label">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI Potenzialanalyse */}
            <div className="ai-analysis-section">
              <div className="ai-analysis-header">
                <div className="ai-analysis-title-row">
                  <Brain size={18} />
                  <h3>KI-Potenzialanalyse</h3>
                  <span className="ai-badge">Beta</span>
                </div>
                <p className="ai-analysis-desc">
                  Automatisches Scoring auf Basis von Satellitenbildern, Ausschreibungsdaten und Flächennutzungsplänen.
                </p>
              </div>

              <div className="ai-table-wrap">
                <table className="ai-table">
                  <thead>
                    <tr>
                      <th>Gebiet</th>
                      <th>Bundesland</th>
                      <th>Status</th>
                      <th>Potenzial</th>
                      <th>KI-Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiProjects.map((p, i) => (
                      <tr key={i}>
                        <td className="ai-table-title">{p.title}</td>
                        <td className="ai-table-state">{p.state}</td>
                        <td>
                          <span className={`tender-card-badge ${getStatusBadgeClass(p.status)}`}>
                            {getStatusLabel(p.status)}
                          </span>
                        </td>
                        <td>
                          <span className={`potenzial-chip potenzial-${p.potenzial.toLowerCase()}`}>
                            {p.potenzial}
                          </span>
                        </td>
                        <td>
                          <div className="score-cell">
                            <div className="score-bar-wrap">
                              <div
                                className="score-bar-fill"
                                style={{ width: `${p.score}%`, background: p.score >= 90 ? '#10B981' : p.score >= 75 ? '#F59E0B' : '#6B7280' }}
                              />
                            </div>
                            <span className="score-number">{p.score}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Premium Features */}
              <div className="premium-features-grid">
                <div className="premium-feature-card">
                  <div className="premium-feature-icon">
                    <Zap size={18} />
                  </div>
                  <div>
                    <div className="premium-feature-title">Satellitenbildanalyse</div>
                    <div className="premium-feature-desc">Erkennung von Rodungsflächen und Erschließungsmaßnahmen</div>
                  </div>
                </div>
                <div className="premium-feature-card">
                  <div className="premium-feature-icon">
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <div className="premium-feature-title">Flächennutzungsplan-Auswertung</div>
                    <div className="premium-feature-desc">Automatische Auswertung kommunaler Bebauungspläne</div>
                  </div>
                </div>
                <div className="premium-feature-card">
                  <div className="premium-feature-icon">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div className="premium-feature-title">Lead-Scoring für Investoren</div>
                    <div className="premium-feature-desc">Priorisierung nach Rendite- und Entwicklungspotenzial</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BERICHTE ─────────────────────────────────────────── */}
        {activeTab === 'berichte' && (
          <div className="tab-page">
            <div className="tab-page-header">
              <h2>PDF Berichte & Exporte</h2>
              <p>Generieren Sie strukturierte Auswertungen über Neubaugebiete zur Weitergabe an Investoren und Kommunen.</p>
            </div>
            <div className="berichte-list">
              {[
                { title: 'Quartalsbericht Q2/2024 – Stadtentwicklung', desc: 'Zusammenfassender Bericht aller aktiven Vorhaben, Fristen und Ausschreibungen.', type: 'PDF' },
                { title: 'Bebauungspläne & Katasterübersichten (Gesamt)', desc: 'Zusammenstellung aller offiziellen Bebauungspläne inklusive GeoJSON-Koordinaten.', type: 'ZIP' },
                { title: 'KI-Potenzialanalyse Bericht', desc: 'Automatisch generierter Score-Report für alle analysierten Gebiete.', type: 'PDF' },
              ].map(({ title, desc, type }) => (
                <div key={title} className="document-item-row">
                  <div className="document-info">
                    <FileText size={24} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    <div className="document-meta">
                      <span className="document-name">{title}</span>
                      <span className="document-size">{desc}</span>
                    </div>
                  </div>
                  <button className="btn-report-download">
                    <Download size={14} /> Download {type}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EINSTELLUNGEN ─────────────────────────────────────── */}
        {activeTab === 'einstellungen' && (
          <div className="settings-container">
            <div className="tab-page-header">
              <h2>Einstellungen</h2>
            </div>
            <div className="settings-card">
              <h3 className="settings-section-title">Benutzerprofil</h3>
              <div className="settings-form-row">
                <label>Name</label>
                <input type="text" className="settings-input" defaultValue={userName} />
              </div>
              <div className="settings-form-row">
                <label>E-Mail-Adresse</label>
                <input type="email" className="settings-input" defaultValue="admin@bauscout.de" disabled />
              </div>
              <button className="settings-btn" onClick={() => alert('Profil gespeichert')}>Änderungen speichern</button>
            </div>
            <div className="settings-card">
              <h3 className="settings-section-title">Google Maps Schnittstelle</h3>
              <p className="settings-hint">
                Tragen Sie hier Ihren Google Maps API-Schlüssel ein, um die Live-Kartenansichten zu aktivieren.
                Ohne Schlüssel wird die interne OpenStreetMap-Karte verwendet.
              </p>
              <div className="settings-form-row">
                <label>VITE_GOOGLE_MAPS_API_KEY</label>
                <SettingsApiKeyInput />
              </div>
            </div>
          </div>
        )}

        {/* Detail Drawer */}
        <TenderDetailDrawer
          area={activeDetailArea}
          onClose={() => setActiveDetailArea(null)}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      </div>
    </div>
  );
};
