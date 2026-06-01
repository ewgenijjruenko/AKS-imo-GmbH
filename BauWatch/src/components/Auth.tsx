import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, MapPin, Bell, BarChart3, FileSearch } from 'lucide-react';

interface AuthProps {
  onLogin: (name: string, email: string) => void;
}

const BrandLogo: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="44" height="44" fill="none">
    <rect x="1" y="1" width="38" height="38" rx="5" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3 3" />
    <path d="M5 30 L5 18 L20 7 L35 18 L35 30" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <line x1="5" y1="30" x2="35" y2="30" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="24" cy="19" r="6.5" stroke="#ffffff" strokeWidth="2" fill="rgba(255,255,255,0.15)" />
    <line x1="29" y1="24" x2="33" y2="28" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M24 14.5 L25.5 18 L24 17 L22.5 18 Z" fill="#ffffff" />
  </svg>
);

const features = [
  { icon: MapPin, label: 'Interaktive Kartenansicht', desc: 'Alle Neubaugebiete auf einen Blick' },
  { icon: Bell, label: 'Echtzeit-Benachrichtigungen', desc: 'Sofort informiert bei Statusänderungen' },
  { icon: BarChart3, label: 'Markt-Analytics', desc: 'Datengestützte Entscheidungen treffen' },
  { icon: FileSearch, label: 'Ausschreibungs-Monitor', desc: 'Fristen und Vergaben nie verpassen' },
];

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || (!isLogin && !name)) {
      setError('Bitte füllen Sie alle Felder aus.');
      return;
    }
    onLogin(isLogin ? (name || 'Demo-Nutzer') : name, email);
  };

  return (
    <div className="auth-container">
      {/* Brand Panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-glow auth-brand-glow-1" />
        <div className="auth-brand-glow auth-brand-glow-2" />
        <div className="auth-brand-content">
          <div className="auth-brand-logo-row">
            <BrandLogo />
            <div>
              <div className="auth-brand-name">BauScout</div>
              <div className="auth-brand-tag-line">A member of AKS-imo GmbH</div>
            </div>
          </div>
          <h2 className="auth-brand-headline">
            Bauprojekte in Deutschland.<br />
            <span className="auth-brand-headline-accent">Alles auf einen Blick.</span>
          </h2>
          <p className="auth-brand-desc">
            Die professionelle Plattform für Stadtentwickler, Investoren und Kommunen —
            für vollständige Transparenz über Neubaugebiete und Ausschreibungen.
          </p>
          <div className="auth-features-list">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="auth-feature-item">
                <div className="auth-feature-icon">
                  <Icon size={16} />
                </div>
                <div>
                  <div className="auth-feature-label">{label}</div>
                  <div className="auth-feature-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">{isLogin ? 'Willkommen zurück' : 'Konto erstellen'}</h1>
            <p className="auth-subtitle">
              {isLogin
                ? 'Melden Sie sich bei Ihrem BauScout-Konto an.'
                : 'Registrieren Sie sich kostenlos für BauScout.'}
            </p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="name">Vollständiger Name</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><User size={16} /></span>
                  <input
                    type="text"
                    id="name"
                    className="auth-input"
                    placeholder="Max Mustermann"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="email">E-Mail-Adresse</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Mail size={16} /></span>
                <input
                  type="email"
                  id="email"
                  className="auth-input"
                  placeholder="name@organisation.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-form-group">
              <div className="auth-label-row">
                <label className="auth-label" htmlFor="password">Passwort</label>
                {isLogin && (
                  <a href="#" className="auth-forgot-link" onClick={(e) => e.preventDefault()}>
                    Vergessen?
                  </a>
                )}
              </div>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Lock size={16} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn">
              {isLogin ? 'Anmelden' : 'Konto erstellen'}
            </button>
          </form>

          <div className="auth-footer">
            {isLogin ? (
              <>
                Noch kein Konto?{' '}
                <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setIsLogin(false); setError(''); }}>
                  Jetzt registrieren
                </a>
              </>
            ) : (
              <>
                Bereits registriert?{' '}
                <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setIsLogin(true); setError(''); }}>
                  Hier einloggen
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
