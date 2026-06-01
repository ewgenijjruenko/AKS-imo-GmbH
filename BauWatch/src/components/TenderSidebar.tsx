import React from 'react';
import { Bookmark, Eye, ChevronRight, ChevronLeft, MapPin } from 'lucide-react';
import type { DevelopmentArea } from '../types';

interface TenderSidebarProps {
  areas: DevelopmentArea[];
  selectedAreaId: string | null;
  setSelectedAreaId: (id: string | null) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  watchedAreas: string[];
  toggleWatchlist: (id: string) => void;
  onOpenDetails: (area: DevelopmentArea) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const TenderSidebar: React.FC<TenderSidebarProps> = ({
  areas,
  selectedAreaId,
  setSelectedAreaId,
  favorites,
  toggleFavorite,
  watchedAreas,
  toggleWatchlist,
  onOpenDetails,
  isCollapsed = false,
  onToggleCollapse
}) => {

  const getStatusBadgeClass = (status: DevelopmentArea['status']) => {
    const map: Record<string, string> = {
      planung: 'badge-planung',
      ausschreibung: 'badge-ausschreibung',
      bau: 'badge-bau',
      abgeschlossen: 'badge-abgeschlossen',
    };
    return map[status] ?? '';
  };

  const getStatusLabel = (status: DevelopmentArea['status']) => {
    const map: Record<string, string> = {
      planung: 'In Planung',
      ausschreibung: 'Ausschreibung',
      bau: 'Im Bau',
      abgeschlossen: 'Abgeschlossen',
    };
    return map[status] ?? status;
  };

  const getTimelineText = (area: DevelopmentArea) => {
    if (area.status === 'planung') return `Veröffentlicht: ${area.publishDate ?? '–'}`;
    if (area.status === 'ausschreibung') return `Frist endet: ${area.deadline ?? '–'}`;
    if (area.status === 'bau') return `Baubeginn: ${area.startDate ?? '–'}`;
    if (area.status === 'abgeschlossen') return `Abgeschlossen: ${area.completionDate ?? '–'}`;
    return '';
  };

  if (isCollapsed) {
    return (
      <div className="tender-panel collapsed">
        <button
          className="tender-panel-toggle collapsed"
          onClick={onToggleCollapse}
          title="Liste einblenden"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="tender-panel-collapsed-label">
          Ausschreibungen ({areas.length})
        </span>
      </div>
    );
  }

  return (
    <div className="tender-panel">
      {/* Panel Header */}
      <div className="tender-panel-header">
        <div>
          <h3 className="tender-panel-title">Ausschreibungen & Neubaugebiete</h3>
          <span className="tender-panel-subtitle">{areas.length} Ergebnisse · Aktualisiert: gerade eben</span>
        </div>
        {onToggleCollapse && (
          <button onClick={onToggleCollapse} className="btn-collapse-sidebar" title="Liste ausblenden">
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Cards List */}
      <div className="tender-cards-list">
        {areas.length === 0 ? (
          <div className="tender-empty-state">
            Keine Projekte entsprechen Ihren Filterkriterien.
          </div>
        ) : (
          areas.map((area) => {
            const isFav = favorites.includes(area.id);
            const isWatched = watchedAreas.includes(area.id);
            const isSelected = selectedAreaId === area.id;

            return (
              <div
                key={area.id}
                className={`tender-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedAreaId(area.id)}
              >
                {/* Card Top */}
                <div className="tender-card-header">
                  <span className={`tender-card-badge ${getStatusBadgeClass(area.status)}`}>
                    {getStatusLabel(area.status)}
                  </span>
                  <div className="tender-card-actions">
                    <button
                      className={`btn-watchlist ${isWatched ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleWatchlist(area.id); }}
                      title={isWatched ? 'Beobachtung beenden' : 'Beobachten'}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className={`btn-bookmark ${isFav ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(area.id); }}
                      title={isFav ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                    >
                      <Bookmark size={15} fill={isFav ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>

                {/* Title & Location */}
                <h4 className="tender-card-title">{area.title}</h4>
                <div className="tender-card-location">
                  <MapPin size={11} style={{ flexShrink: 0 }} />
                  {area.location}
                </div>

                {/* Detail Grid */}
                <div className="tender-card-details">
                  <div className="tender-detail-row">
                    <span className="tender-detail-label">Fläche</span>
                    <span className="tender-detail-value">
                      {area.areaSize.toLocaleString('de-DE', { minimumFractionDigits: 1 })} ha
                    </span>
                  </div>
                  <div className="tender-detail-row">
                    <span className="tender-detail-label">Wohneinheiten</span>
                    <span className="tender-detail-value">
                      {area.units > 0 ? `ca. ${area.units}` : 'Gewerbe'}
                    </span>
                  </div>
                </div>

                <div className="tender-detail-authority">
                  <strong>Behörde:</strong> {area.authority}
                </div>

                {/* Card Footer */}
                <div className="tender-card-footer">
                  <span className="tender-timeline-info">{getTimelineText(area)}</span>
                  <button
                    className="btn-card-details"
                    onClick={(e) => { e.stopPropagation(); onOpenDetails(area); }}
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="tender-panel-footer">
        <button className="btn-all-tenders">
          Alle Ausschreibungen anzeigen
        </button>
      </div>
    </div>
  );
};
