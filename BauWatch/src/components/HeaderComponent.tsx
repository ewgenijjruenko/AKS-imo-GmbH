import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, Bell, User as UserIcon, LogOut, Shield, MapPin, Menu, Sun, Moon, Download } from 'lucide-react';
import type { NotificationItem } from '../types';

interface HeaderComponentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notifications: NotificationItem[];
  markAllNotificationsRead: () => void;
  userName: string;
  onLogout: () => void;
  onToggleSidebar: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const HeaderComponent: React.FC<HeaderComponentProps> = ({
  searchQuery,
  setSearchQuery,
  notifications,
  markAllNotificationsRead,
  userName,
  onLogout,
  onToggleSidebar,
  theme,
  toggleTheme
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const initials = userName.substring(0, 2).toUpperCase();

  const handleExport = () => {
    alert('Export als CSV/PDF wird vorbereitet...');
  };

  return (
    <header className="header">
      <button className="mobile-menu-toggle" onClick={onToggleSidebar} aria-label="Menü öffnen">
        <Menu size={22} />
      </button>

      {/* Search */}
      <div className="header-left">
        <div className="search-bar-container">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Ort, PLZ, Landkreis oder Projekt suchen…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn-header-filter">
          <SlidersHorizontal size={15} />
          <span>Filter</span>
        </button>
        <button className="btn-header-export" onClick={handleExport}>
          <Download size={15} />
          <span>Export</span>
        </button>
      </div>

      {/* Actions */}
      <div className="header-right">
        {/* Theme Toggle */}
        <button
          className="btn-theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Helles Design' : 'Dunkles Design'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div className="user-profile-menu" ref={notificationsRef}>
          <button
            className="notification-bell-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) markAllNotificationsRead();
            }}
            aria-label="Benachrichtigungen"
          >
            <Bell size={19} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notifications-overlay">
              <div className="notifications-header">
                <h4 className="notifications-title">Benachrichtigungen</h4>
                <button className="btn-clear-notifications" onClick={markAllNotificationsRead}>
                  Alle gelesen
                </button>
              </div>
              {notifications.length === 0 ? (
                <div className="notifications-empty">Keine neuen Benachrichtigungen.</div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''} type-${notif.type}`}>
                    <span className="notification-item-title">{notif.title}</span>
                    <span className="notification-item-msg">{notif.message}</span>
                    <span className="notification-item-time">{notif.time}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="user-profile-menu" ref={profileRef}>
          <button
            className="user-profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="avatar-placeholder">{initials}</div>
            <span className="user-profile-label">Mein Konto</span>
          </button>

          {showProfileMenu && (
            <div className="dropdown-menu">
              <div className="dropdown-user-info">
                <div className="dropdown-avatar">{initials}</div>
                <div>
                  <div className="dropdown-user-name">{userName}</div>
                  <div className="dropdown-user-role">Administrator</div>
                </div>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-item">
                <UserIcon size={15} />
                Mein Profil
              </button>
              <button className="dropdown-item">
                <Shield size={15} />
                Sicherheit
              </button>
              <button className="dropdown-item">
                <MapPin size={15} />
                Gespeicherte Suchen
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item danger" onClick={onLogout}>
                <LogOut size={15} />
                Abmelden
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
