import React from 'react';
import { X, FileText, Download, User as UserIcon, Mail, Phone, Calendar, Landmark, MapPin, Bookmark } from 'lucide-react';
import type { DevelopmentArea } from '../types';

interface TenderDetailDrawerProps {
  area: DevelopmentArea | null;
  onClose: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

export const TenderDetailDrawer: React.FC<TenderDetailDrawerProps> = ({
  area,
  onClose,
  favorites,
  toggleFavorite
}) => {
  if (!area) return null;

  const getStatusLabel = (status: DevelopmentArea['status']) => {
    const labels = { planung: 'In Planung', ausschreibung: 'Ausschreibung', bau: 'Im Bau', abgeschlossen: 'Abgeschlossen' };
    return labels[status] ?? status;
  };

  const getStatusBadgeClass = (status: DevelopmentArea['status']) => {
    const classes = { planung: 'badge-planung', ausschreibung: 'badge-ausschreibung', bau: 'badge-bau', abgeschlossen: 'badge-abgeschlossen' };
    return classes[status] ?? '';
  };

  const getTimelineText = (a: DevelopmentArea) => {
    if (a.status === 'planung') return `Planung seit ${a.publishDate ?? '–'}`;
    if (a.status === 'ausschreibung') return `Abgabe bis ${a.deadline ?? '–'}`;
    if (a.status === 'bau') return `Baubeginn ${a.startDate ?? '–'}`;
    if (a.status === 'abgeschlossen') return `Fertiggestellt ${a.completionDate ?? '–'}`;
    return '–';
  };

  const isFav = favorites.includes(area.id);

  return (
    <div className="detail-drawer-overlay" onClick={onClose}>
      <div className="detail-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-drawer-header">
          <div className="detail-drawer-title-group">
            <div className="detail-drawer-meta-row">
              <div className="detail-drawer-badges">
                <span className={`tender-card-badge ${getStatusBadgeClass(area.status)}`}>
                  {getStatusLabel(area.status)}
                </span>
                <span className="detail-drawer-location">
                  <MapPin size={12} /> {area.location}
                </span>
              </div>
              <button
                className={`btn-bookmark ${isFav ? 'active' : ''}`}
                onClick={() => toggleFavorite(area.id)}
                title={isFav ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
              >
                <Bookmark size={17} fill={isFav ? 'currentColor' : 'none'} />
              </button>
            </div>
            <h2 className="detail-drawer-title">{area.title}</h2>
          </div>
          <button className="detail-drawer-close-btn" onClick={onClose} aria-label="Schließen">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="detail-drawer-content">
          {/* Description */}
          <section>
            <h3 className="detail-drawer-section-title">Beschreibung</h3>
            <p className="detail-drawer-description">{area.description}</p>
          </section>

          {/* Eckdaten */}
          <section>
            <h3 className="detail-drawer-section-title">Eckdaten</h3>
            <div className="detail-drawer-specs">
              <div className="detail-drawer-spec-item">
                <span className="detail-drawer-spec-label">Flächengröße</span>
                <span className="detail-drawer-spec-value">
                  {area.areaSize.toLocaleString('de-DE', { minimumFractionDigits: 1 })} ha
                </span>
              </div>
              <div className="detail-drawer-spec-item">
                <span className="detail-drawer-spec-label">Wohneinheiten</span>
                <span className="detail-drawer-spec-value">
                  {area.units > 0 ? `ca. ${area.units} Einheiten` : 'Reines Gewerbegebiet'}
                </span>
              </div>
              <div className="detail-drawer-spec-item">
                <span className="detail-drawer-spec-label">Zuständige Behörde</span>
                <span className="detail-drawer-spec-value detail-drawer-spec-icon-row">
                  <Landmark size={14} className="spec-icon" />
                  {area.authority}
                </span>
              </div>
              <div className="detail-drawer-spec-item">
                <span className="detail-drawer-spec-label">Zeitlicher Status</span>
                <span className="detail-drawer-spec-value detail-drawer-spec-icon-row">
                  <Calendar size={14} className="spec-icon" />
                  {getTimelineText(area)}
                </span>
              </div>
            </div>
          </section>

          {/* Documents */}
          <section>
            <h3 className="detail-drawer-section-title">Dokumente & Bebauungspläne</h3>
            {area.documents.length === 0 ? (
              <p className="detail-drawer-empty-text">Keine Dokumente hinterlegt.</p>
            ) : (
              area.documents.map((doc, idx) => (
                <div key={idx} className="document-item-row">
                  <div className="document-info">
                    <FileText size={18} className="document-icon" />
                    <div className="document-meta">
                      <span className="document-name">{doc.name}</span>
                      <span className="document-size">{doc.size}</span>
                    </div>
                  </div>
                  <button
                    className="btn-document-download"
                    onClick={() => alert(`Download: ${doc.name}`)}
                    title="Herunterladen"
                  >
                    <Download size={15} />
                  </button>
                </div>
              ))
            )}
          </section>

          {/* Contact */}
          {area.contactPerson && (
            <section>
              <h3 className="detail-drawer-section-title">Ansprechpartner</h3>
              <div className="contact-card">
                <div className="contact-avatar">
                  <UserIcon size={18} />
                </div>
                <div className="contact-details">
                  <span className="contact-name">{area.contactPerson.name}</span>
                  <span className="contact-role">{area.contactPerson.role}</span>
                  <div className="contact-links">
                    <a href={`mailto:${area.contactPerson.email}`} className="contact-link">
                      <Mail size={12} /> E-Mail
                    </a>
                    <a href={`tel:${area.contactPerson.phone}`} className="contact-link">
                      <Phone size={12} /> Anrufen
                    </a>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
