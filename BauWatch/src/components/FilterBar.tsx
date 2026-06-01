import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  authorities: string[];
  states: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  authorities,
  states
}) => {
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="filter-bar">
      <select
        className="filter-select"
        value={filters.status}
        onChange={(e) => handleFilterChange('status', e.target.value)}
      >
        <option value="all">Status: Alle</option>
        <option value="planung">In Planung</option>
        <option value="ausschreibung">Ausschreibung</option>
        <option value="bau">Im Bau</option>
        <option value="abgeschlossen">Abgeschlossen</option>
      </select>

      <select
        className="filter-select"
        value={filters.state}
        onChange={(e) => handleFilterChange('state', e.target.value)}
      >
        <option value="all">Bundesland: Alle</option>
        {states.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        className="filter-select"
        value={filters.areaSize}
        onChange={(e) => handleFilterChange('areaSize', e.target.value)}
      >
        <option value="all">Fläche: Alle</option>
        <option value="small">{'< 3,0 ha'}</option>
        <option value="medium">{'3,0 – 5,0 ha'}</option>
        <option value="large">{'> 5,0 ha'}</option>
      </select>

      <select
        className="filter-select"
        value={filters.timeframe}
        onChange={(e) => handleFilterChange('timeframe', e.target.value)}
      >
        <option value="all">Zeitraum: Alle</option>
        <option value="2024">2024</option>
        <option value="2025">2025</option>
        <option value="2026">2026+</option>
      </select>

      <select
        className="filter-select"
        value={filters.authority}
        onChange={(e) => handleFilterChange('authority', e.target.value)}
      >
        <option value="all">Behörde: Alle</option>
        {authorities.map((auth) => (
          <option key={auth} value={auth}>{auth}</option>
        ))}
      </select>

      <button className="btn-more-filters">
        <SlidersHorizontal size={14} />
        <span>Mehr Filter</span>
      </button>
    </div>
  );
};
