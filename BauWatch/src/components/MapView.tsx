/// <reference types="google.maps" />
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Navigation, Plus, Minus, Layers, Globe, Map, Sun, Moon,
  Locate, Maximize, Minimize, Search, X, Car, PenTool, Trash2
} from 'lucide-react';
import L from 'leaflet';
import type { DevelopmentArea, FilterState } from '../types';
import { mockAreas } from '../mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapViewProps {
  areas: DevelopmentArea[];
  selectedAreaId: string | null;
  setSelectedAreaId: (id: string | null) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  theme: 'light' | 'dark';
}

interface CustomWindow extends Window {
  google?: typeof google;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
}

interface CustomPin {
  id: string;
  lat: number;
  lng: number;
  label: string;
}

type DevelopmentAreaWithDisplay = DevelopmentArea & { displayCenter: { lat: number; lng: number } };
type MapStyleKey = 'street' | 'satellite' | 'light' | 'dark';

// ─── Constants ────────────────────────────────────────────────────────────────

const GERMANY_BOUNDS = { south: 47.27, west: 5.87, north: 55.06, east: 15.04 };
const GERMANY_CENTER = { lat: 51.1657, lng: 10.4515 };
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// ─── Pure helpers (defined outside component = no re-creation per render) ─────

const getProjectCountByState = (areas: DevelopmentArea[], name: string) =>
  areas.filter(a => a.state === name).length;

const getStateColor = (count: number, maxCount: number) => {
  if (count <= 0) return 'transparent';
  const opacity = 0.35 + (maxCount > 0 ? count / maxCount : 0) * 0.55;
  return `rgba(37, 99, 235, ${opacity.toFixed(3)})`;
};

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const p = Math.PI / 180;
  const a =
    0.5 - Math.cos((lat2 - lat1) * p) / 2 +
    Math.cos(lat1 * p) * Math.cos(lat2 * p) * (1 - Math.cos((lon2 - lon1) * p)) / 2;
  return 12742 * Math.asin(Math.sqrt(a));
};

const adjustMarkerPositions = (areas: DevelopmentArea[], zoom: number): DevelopmentAreaWithDisplay[] => {
  const adjusted: DevelopmentAreaWithDisplay[] = areas.map(a => ({ ...a, displayCenter: { ...a.center } }));
  if (zoom > 11 || adjusted.length < 2) return adjusted;

  const threshold = Math.max(1.2, 28 / Math.pow(2, zoom - 7));
  const n = adjusted.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x: number): number => {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  };
  const union = (a: number, b: number) => { const ra = find(a); const rb = find(b); if (ra !== rb) parent[ra] = rb; };

  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (haversine(adjusted[i].center.lat, adjusted[i].center.lng, adjusted[j].center.lat, adjusted[j].center.lng) < threshold)
        union(i, j);

  const groups: Record<number, number[]> = {};
  for (let i = 0; i < n; i++) {
    const r = find(i);
    groups[r] ? groups[r].push(i) : (groups[r] = [i]);
  }

  const offsetRadius = 0.018 * Math.pow(2, 8 - zoom);
  Object.values(groups).forEach(indices => {
    if (indices.length < 2) return;
    const cLat = indices.reduce((s, i) => s + adjusted[i].center.lat, 0) / indices.length;
    const cLng = indices.reduce((s, i) => s + adjusted[i].center.lng, 0) / indices.length;
    const lngFix = 1 / Math.max(0.2, Math.cos(cLat * Math.PI / 180));
    indices.forEach((idx, k) => {
      const angle = (k * 2 * Math.PI) / indices.length - Math.PI / 2;
      adjusted[idx].displayCenter = {
        lat: cLat + Math.sin(angle) * offsetRadius,
        lng: cLng + Math.cos(angle) * offsetRadius * lngFix,
      };
    });
  });
  return adjusted;
};

// Status palette — single source of truth
const STATUS_COLORS: Record<DevelopmentArea['status'], string> = {
  planung:      '#2563EB',
  ausschreibung:'#0D9488',
  bau:          '#D97706',
  abgeschlossen:'#6B7280',
};
const getStatusColor = (s: DevelopmentArea['status']) => STATUS_COLORS[s] ?? '#9CA3AF';
const getMapBgColor  = (s: MapStyleKey) =>
  ({ dark: '#0D0D14', light: '#F9FAFB', satellite: '#0b0f19', street: '#f4f3f0' })[s];

const buildMarkerHtml = (color: string, selected = false) => {
  const size = selected ? 32 : 24;
  return `
    <div style="color:${color};filter:drop-shadow(0 ${selected ? '4px 8px' : '2px 4px'} rgba(0,0,0,0.3));transform:translate(-50%,-100%);transition:all 0.2s">
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="#fff" stroke-width="1.5">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3" fill="#fff"/>
      </svg>
    </div>`;
};

const buildCustomPinHtml = (label: string) => `
  <div style="transform:translate(-50%,-100%);text-align:center">
    <div style="background:#EF4444;color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;white-space:nowrap;box-shadow:0 2px 8px rgba(239,68,68,0.4);border:1.5px solid #fff">${label}</div>
    <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #EF4444;margin:0 auto"></div>
  </div>`;

// Google Maps styles
const googleDarkStyle: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0D0D14' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0D0D14' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9CA3AF' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#252535' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#D1D5DB' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6B7280' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0A0A10' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#16161F' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#4B5563' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1E1E2C' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#07070F' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#374151' }] },
];

const googleLightStyle: google.maps.MapTypeStyle[] = [
  { stylers: [{ saturation: -80 }] },
  { elementType: 'geometry', stylers: [{ color: '#F9FAFB' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6B7280' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#F3F4F6' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#DBEAFE' }] },
];

const googleStreetStyle: google.maps.MapTypeStyle[] = [
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#BFDBFE' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#F5F5F5' }] },
];

// ─── Geocode with Nominatim ───────────────────────────────────────────────────

const geocode = async (query: string): Promise<NominatimResult[]> => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=de&limit=6&addressdetails=0`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'de' } });
  return res.json();
};

// ─── Component ────────────────────────────────────────────────────────────────

export const MapView: React.FC<MapViewProps> = ({
  areas, selectedAreaId, setSelectedAreaId, filters, setFilters, theme,
}) => {
  const [useGoogleMaps, setUseGoogleMaps] = useState(() => !!(API_KEY && API_KEY !== 'DEIN_API_KEY_HIER'));
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef       = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Derived counts ──────────────────────────────────────────────────────────
  const statusCounts = useMemo(() => ({
    planung:       mockAreas.filter(a => a.status === 'planung').length,
    ausschreibung: mockAreas.filter(a => a.status === 'ausschreibung').length,
    bau:           mockAreas.filter(a => a.status === 'bau').length,
    abgeschlossen: mockAreas.filter(a => a.status === 'abgeschlossen').length,
  }), []);

  const stateCounts = useMemo(() =>
    areas.reduce<Record<string, number>>((acc, a) => {
      if (a.state) acc[a.state] = (acc[a.state] || 0) + 1;
      return acc;
    }, {}), [areas]);

  const maxStateCount = useMemo(() => Math.max(1, ...Object.values(stateCounts)), [stateCounts]);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [mapStyle, setMapStyle] = useState<MapStyleKey>(() => theme === 'dark' ? 'dark' : 'light');
  const [zoom, setZoom] = useState(6);
  const zoomRef = useRef(zoom);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // Auto-sync theme → map style when theme changes
  const [prevTheme, setPrevTheme] = useState(theme);
  if (theme !== prevTheme) {
    setPrevTheme(theme);
    setMapStyle(theme === 'dark' ? 'dark' : 'light');
  }

  const [geoJsonData,    setGeoJsonData]    = useState<unknown>(null);
  const [showLayerMenu,  setShowLayerMenu]  = useState(false);
  const [isFullscreen,   setIsFullscreen]   = useState(false);
  const [showTraffic,    setShowTraffic]    = useState(false);
  const [pinMode,        setPinMode]        = useState(false);
  const [customPins,     setCustomPins]     = useState<CustomPin[]>([]);

  // ── Search state ────────────────────────────────────────────────────────────
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching,   setIsSearching]   = useState(false);
  const [showResults,   setShowResults]   = useState(false);
  const searchRef   = useRef<HTMLDivElement>(null);
  const layerMenuRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOverview = zoom <= 7;

  // ── Google Maps instance refs ────────────────────────────────────────────────
  const googleMapInstance  = useRef<google.maps.Map | null>(null);
  const googlePolygons     = useRef<Record<string, google.maps.Polygon>>({});
  const googleMarkers      = useRef<Record<string, google.maps.Marker>>({});
  const googleStateLabels  = useRef<google.maps.Marker[]>([]);
  const googleCustomPins   = useRef<google.maps.Marker[]>([]);
  const googleTrafficLayer = useRef<google.maps.TrafficLayer | null>(null);
  const googleDidFit       = useRef(false);
  const googleSearchMarker = useRef<google.maps.Marker | null>(null);

  // ── Leaflet instance refs ────────────────────────────────────────────────────
  const leafletMap          = useRef<L.Map | null>(null);
  const leafletTileLayer    = useRef<L.TileLayer | null>(null);
  const leafletCurrentStyle = useRef<string | null>(null);
  const leafletGeoJson      = useRef<L.GeoJSON | null>(null);
  const leafletPolygons     = useRef<Record<string, L.Polygon>>({});
  const leafletMarkers      = useRef<Record<string, L.Marker>>({});
  const leafletStateLabels  = useRef<L.LayerGroup | null>(null);
  const leafletCustomPins   = useRef<L.Marker[]>([]);
  const leafletSearchMarker = useRef<L.Marker | null>(null);

  // ── Geolocation auto-center on open ─────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      if (useGoogleMaps) {
        if (googleMapInstance.current) {
          googleMapInstance.current.panTo({ lat, lng });
          googleMapInstance.current.setZoom(11);
        }
      } else {
        if (leafletMap.current) {
          leafletMap.current.setView([lat, lng], 11);
        }
      }
    }, undefined, { timeout: 5000 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded]);

  // ── Fullscreen change listener ───────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Close menus clicking outside ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (layerMenuRef.current && !layerMenuRef.current.contains(e.target as Node))
        setShowLayerMenu(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowResults(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── GeoJSON fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/main/2_bundeslaender/4_niedrig.geo.json')
      .then(r => r.json())
      .then(setGeoJsonData)
      .catch(console.error);
  }, []);

  // ── Search with debounce ─────────────────────────────────────────────────────
  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!val.trim()) { setSearchResults([]); setShowResults(false); return; }
    searchTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await geocode(val);
        setSearchResults(results);
        setShowResults(true);
      } catch { /* silent */ }
      setIsSearching(false);
    }, 400);
  };

  const selectSearchResult = useCallback((r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setShowResults(false);
    setSearchQuery(r.display_name.split(',').slice(0, 2).join(', '));

    if (useGoogleMaps && googleMapInstance.current) {
      const win = window as unknown as CustomWindow;
      const google = win.google;
      if (!google) return;
      googleMapInstance.current.panTo({ lat, lng });
      googleMapInstance.current.setZoom(13);
      if (googleSearchMarker.current) googleSearchMarker.current.setMap(null);
      googleSearchMarker.current = new google.maps.Marker({
        position: { lat, lng }, map: googleMapInstance.current,
        animation: google.maps.Animation.DROP,
      });
    } else if (leafletMap.current) {
      leafletMap.current.setView([lat, lng], 13);
      if (leafletSearchMarker.current) leafletSearchMarker.current.remove();
      leafletSearchMarker.current = L.marker([lat, lng]).addTo(leafletMap.current);
    }
  }, [useGoogleMaps]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleZoomIn = () => {
    if (useGoogleMaps) googleMapInstance.current?.setZoom((googleMapInstance.current.getZoom() || 12) + 1);
    else leafletMap.current?.zoomIn();
  };
  const handleZoomOut = () => {
    if (useGoogleMaps) googleMapInstance.current?.setZoom((googleMapInstance.current.getZoom() || 12) - 1);
    else leafletMap.current?.zoomOut();
  };
  const handleRecenter = () => {
    if (useGoogleMaps && googleMapInstance.current) {
      const win = window as unknown as CustomWindow;
      const google = win.google;
      if (google) {
        googleMapInstance.current.fitBounds(new google.maps.LatLngBounds(
          { lat: GERMANY_BOUNDS.south, lng: GERMANY_BOUNDS.west },
          { lat: GERMANY_BOUNDS.north, lng: GERMANY_BOUNDS.east }
        ));
      }
    } else {
      leafletMap.current?.fitBounds(
        [[GERMANY_BOUNDS.south, GERMANY_BOUNDS.west], [GERMANY_BOUNDS.north, GERMANY_BOUNDS.east]],
        { padding: [20, 20] }
      );
    }
  };
  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      if (useGoogleMaps && googleMapInstance.current) {
        googleMapInstance.current.panTo({ lat, lng });
        googleMapInstance.current.setZoom(13);
      } else {
        leafletMap.current?.setView([lat, lng], 13);
      }
    });
  };
  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current.requestFullscreen();
  };
  const toggleTraffic = () => {
    if (!useGoogleMaps) return;
    const win = window as unknown as CustomWindow;
    const google = win.google;
    if (!google || !googleMapInstance.current) return;
    if (showTraffic) {
      googleTrafficLayer.current?.setMap(null);
      googleTrafficLayer.current = null;
    } else {
      if (!googleTrafficLayer.current) {
        googleTrafficLayer.current = new google.maps.TrafficLayer();
      }
      googleTrafficLayer.current.setMap(googleMapInstance.current);
    }
    setShowTraffic(v => !v);
  };

  // ── Custom pin placement ──────────────────────────────────────────────────────
  const addCustomPin = useCallback((lat: number, lng: number) => {
    const id = `pin-${Date.now()}`;
    const pin: CustomPin = { id, lat, lng, label: 'Neubau' };
    setCustomPins(prev => [...prev, pin]);

    if (useGoogleMaps && googleMapInstance.current) {
      const win = window as unknown as CustomWindow;
      const google = win.google;
      if (!google) return;
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: googleMapInstance.current,
        title: 'Neubau',
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#EF4444', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 },
      });
      googleCustomPins.current.push(marker);
    } else if (leafletMap.current) {
      const icon = L.divIcon({ html: buildCustomPinHtml('Neubau'), className: '', iconSize: [0, 0], iconAnchor: [0, 0] });
      const marker = L.marker([lat, lng], { icon }).addTo(leafletMap.current);
      leafletCustomPins.current.push(marker);
    }
  }, [useGoogleMaps]);

  const clearCustomPins = () => {
    setCustomPins([]);
    googleCustomPins.current.forEach(m => m.setMap(null));
    googleCustomPins.current = [];
    leafletCustomPins.current.forEach(m => m.remove());
    leafletCustomPins.current = [];
  };

  // ── Load Google Maps script ──────────────────────────────────────────────────
  useEffect(() => {
    const win = window as unknown as CustomWindow;
    if (!useGoogleMaps || mapLoaded || win.google) return;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload  = () => setMapLoaded(true);
    script.onerror = () => { console.warn('Google Maps failed — falling back to Leaflet'); setUseGoogleMaps(false); };
    document.head.appendChild(script);
  }, [useGoogleMaps, mapLoaded]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => () => {
    leafletMap.current?.remove();
    leafletMap.current = null;
    googleMapInstance.current = null;
  }, []);

  // ── ResizeObserver ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    const ro = new ResizeObserver(() => {
      leafletMap.current?.invalidateSize();
      if (googleMapInstance.current) {
        const win = window as unknown as CustomWindow;
        win.google?.maps.event.trigger(googleMapInstance.current, 'resize');
      }
    });
    ro.observe(mapRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Effect A: Google Maps init + update ──────────────────────────────────────
  useEffect(() => {
    const win = window as unknown as CustomWindow;
    if (!useGoogleMaps || !mapRef.current || (!win.google && !mapLoaded)) return;
    const google = win.google;
    if (!google) return;

    if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; leafletTileLayer.current = null; }

    if (!googleMapInstance.current) {
      mapRef.current.innerHTML = '';
      const map = new google.maps.Map(mapRef.current, {
        center: GERMANY_CENTER, zoom: 6,
        disableDefaultUI: true, gestureHandling: 'greedy', maxZoom: 18, minZoom: 5,
      });
      googleMapInstance.current = map;

      if (!googleDidFit.current) {
        setTimeout(() => {
          googleMapInstance.current?.fitBounds(new google.maps.LatLngBounds(
            { lat: GERMANY_BOUNDS.south, lng: GERMANY_BOUNDS.west },
            { lat: GERMANY_BOUNDS.north, lng: GERMANY_BOUNDS.east }
          ));
        }, 100);
        googleDidFit.current = true;
      }

      map.addListener('zoom_changed', () => setZoom(googleMapInstance.current?.getZoom() || 6));

      // Pin mode click
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!pinMode || !e.latLng) return;
        addCustomPin(e.latLng.lat(), e.latLng.lng());
      });
    }

    const map = googleMapInstance.current;
    map.setOptions({
      mapTypeId: mapStyle === 'satellite' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP,
      styles: mapStyle === 'dark' ? googleDarkStyle : mapStyle === 'light' ? googleLightStyle : mapStyle === 'street' ? googleStreetStyle : [],
    });

    if (isOverview) {
      Object.values(googlePolygons.current).forEach(p => p.setMap(null));
      Object.values(googleMarkers.current).forEach(m => m.setMap(null));
      googlePolygons.current = {}; googleMarkers.current = {};
      googleStateLabels.current.forEach(m => m.setMap(null)); googleStateLabels.current = [];
      map.data.forEach((f: google.maps.Data.Feature) => map.data.remove(f));

      if (geoJsonData) {
        map.data.addGeoJson(geoJsonData as object);
        map.data.setStyle((f: google.maps.Data.Feature) => {
          const name = (f.getProperty('name') || f.getProperty('NAME_1') || '') as string;
          const count = getProjectCountByState(areas, name);
          const has = count > 0;
          return {
            fillColor: getStateColor(count, maxStateCount), fillOpacity: has ? 1 : 0,
            strokeColor: has ? (theme === 'dark' || mapStyle === 'dark' ? '#252535' : '#fff') : 'transparent',
            strokeWeight: has ? 1.5 : 0,
          };
        });

        map.data.forEach((f: google.maps.Data.Feature) => {
          const name = (f.getProperty('name') || f.getProperty('NAME_1') || '') as string;
          const count = getProjectCountByState(areas, name);
          if (!count) return;
          const bounds = new google.maps.LatLngBounds();
          f.getGeometry()?.forEachLatLng((ll: google.maps.LatLng) => bounds.extend(ll));
          const lbl = new google.maps.Marker({
            position: bounds.getCenter(), map, clickable: false,
            icon: { path: google.maps.SymbolPath.CIRCLE, scale: 13, fillColor: '#2563EB', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 },
            label: { text: String(count), color: '#fff', fontSize: '12px', fontWeight: '700' },
          });
          googleStateLabels.current.push(lbl);
        });

        map.data.addListener('mouseover', (e: google.maps.Data.MouseEvent) => {
          map.data.revertStyle(); map.data.overrideStyle(e.feature, { strokeColor: '#2563EB', strokeWeight: 2.5, fillOpacity: 0.9 });
        });
        map.data.addListener('mouseout', () => map.data.revertStyle());
        map.data.addListener('click', (e: google.maps.Data.MouseEvent) => {
          const bounds = new google.maps.LatLngBounds();
          e.feature.getGeometry()?.forEachLatLng((ll: google.maps.LatLng) => bounds.extend(ll));
          map.fitBounds(bounds);
        });
      }
    } else {
      map.data.forEach((f: google.maps.Data.Feature) => map.data.remove(f));
      googleStateLabels.current.forEach(m => m.setMap(null)); googleStateLabels.current = [];
      Object.values(googlePolygons.current).forEach(p => p.setMap(null));
      Object.values(googleMarkers.current).forEach(m => m.setMap(null));
      googlePolygons.current = {}; googleMarkers.current = {};

      const adjusted = adjustMarkerPositions(areas, zoomRef.current);
      adjusted.forEach(area => {
        const color = getStatusColor(area.status);
        const poly = new google.maps.Polygon({
          paths: area.polygon, strokeColor: color, strokeOpacity: 0.9, strokeWeight: 1.5,
          fillColor: color, fillOpacity: 0.15, map,
        });
        poly.addListener('click', () => setSelectedAreaId(area.id));
        googlePolygons.current[area.id] = poly;

        const mkr = new google.maps.Marker({
          position: area.displayCenter, title: area.title, map,
          icon: { path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, fillColor: color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 1.5, scale: 6 },
        });
        mkr.addListener('click', () => setSelectedAreaId(area.id));
        googleMarkers.current[area.id] = mkr;
      });
    }
  }, [useGoogleMaps, mapLoaded, areas, mapStyle, isOverview, geoJsonData, theme, setSelectedAreaId, maxStateCount, pinMode, addCustomPin]);

  // ── Effect B: Leaflet init + update ──────────────────────────────────────────
  useEffect(() => {
    if (useGoogleMaps || !mapRef.current) return;
    if (googleMapInstance.current) googleMapInstance.current = null;

    if (!leafletMap.current) {
      mapRef.current.innerHTML = '';
      const map = L.map(mapRef.current, {
        center: [GERMANY_CENTER.lat, GERMANY_CENTER.lng], zoom: 6,
        zoomControl: false, minZoom: 5, maxZoom: 18, zoomSnap: 0.25,
      });
      leafletMap.current = map;
      setTimeout(() => {
        if (!leafletMap.current) return;
        try {
          map.invalidateSize();
          map.fitBounds([[GERMANY_BOUNDS.south, GERMANY_BOUNDS.west], [GERMANY_BOUNDS.north, GERMANY_BOUNDS.east]], { padding: [20, 20] });
        } catch { /* map was removed before timer fired */ }
      }, 100);
      map.on('zoomend', () => setZoom(map.getZoom() || 6));
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (!pinMode) return;
        addCustomPin(e.latlng.lat, e.latlng.lng);
      });
    }

    const map = leafletMap.current;

    if (leafletCurrentStyle.current !== mapStyle) {
      leafletCurrentStyle.current = mapStyle;
      leafletTileLayer.current?.remove();
      const scale = L.Browser.retina ? '@2x' : '';
      const tileUrls: Record<MapStyleKey, string> = {
        street:    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        light:     `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}${scale}.png`,
        dark:      `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}${scale}.png`,
      };
      const attrs: Record<MapStyleKey, string> = {
        street:    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        satellite: 'Tiles &copy; Esri',
        light:     '&copy; <a href="https://carto.com">CARTO</a>',
        dark:      '&copy; <a href="https://carto.com">CARTO</a>',
      };
      leafletTileLayer.current = L.tileLayer(tileUrls[mapStyle], { attribution: attrs[mapStyle], maxZoom: 20 }).addTo(map);
    }

    if (isOverview) {
      Object.values(leafletPolygons.current).forEach(p => p.remove());
      Object.values(leafletMarkers.current).forEach(m => m.remove());
      leafletPolygons.current = {}; leafletMarkers.current = {};
      leafletStateLabels.current?.remove();
      leafletStateLabels.current = L.layerGroup().addTo(map);

      if (geoJsonData) {
        leafletGeoJson.current?.remove();
        leafletGeoJson.current = L.geoJSON(geoJsonData as GeoJSON.GeoJsonObject, {
          style: feature => {
            const name = ((feature as GeoJSON.Feature).properties?.name || '') as string;
            const count = getProjectCountByState(areas, name);
            const has = count > 0;
            return {
              fillColor: getStateColor(count, maxStateCount), fillOpacity: has ? 1 : 0,
              color: has ? (mapStyle === 'dark' || theme === 'dark' ? '#252535' : '#fff') : 'transparent',
              weight: has ? 1.5 : 0, opacity: has ? 0.9 : 0,
            };
          },
          onEachFeature: (feature, layer) => {
            const name = ((feature as GeoJSON.Feature).properties?.name || '') as string;
            const count = getProjectCountByState(areas, name);
            layer.bindTooltip(`<strong>${name}</strong><br/>${count} Projekte`, { sticky: true, className: 'state-tooltip' });

            if (count > 0 && leafletStateLabels.current) {
              const center = (layer as L.Polygon).getBounds().getCenter();
              const badge = L.divIcon({ html: `<div class="state-count-badge">${count}</div>`, className: 'state-count-badge-wrapper', iconSize: [26, 26], iconAnchor: [13, 13] });
              L.marker(center, { icon: badge, interactive: false }).addTo(leafletStateLabels.current);
            }

            (layer as L.Path).on({
              mouseover: e => { (e.target as L.Path).setStyle({ weight: 2.5, color: '#2563EB', fillOpacity: 0.92 }); (e.target as L.Path).bringToFront(); },
              mouseout:  e => leafletGeoJson.current?.resetStyle(e.target as L.Path),
              click:     e => map.fitBounds((e.target as L.Polygon).getBounds(), { maxZoom: 10 }),
            });
          },
        }).addTo(map);
      }
    } else {
      leafletGeoJson.current?.remove(); leafletGeoJson.current = null;
      leafletStateLabels.current?.remove(); leafletStateLabels.current = null;
      Object.values(leafletPolygons.current).forEach(p => p.remove());
      Object.values(leafletMarkers.current).forEach(m => m.remove());
      leafletPolygons.current = {}; leafletMarkers.current = {};

      const adjusted = adjustMarkerPositions(areas, zoomRef.current);
      adjusted.forEach(area => {
        const color = getStatusColor(area.status);
        const poly = L.polygon(area.polygon.map(c => [c.lat, c.lng] as [number, number]), { color, weight: 2, opacity: 0.85, fillColor: color, fillOpacity: 0.15 }).addTo(map);
        poly.on('click', () => setSelectedAreaId(area.id));
        leafletPolygons.current[area.id] = poly;

        const icon = L.divIcon({ html: buildMarkerHtml(color), className: 'custom-leaflet-marker-wrapper', iconSize: [0, 0], iconAnchor: [0, 0] });
        const mkr = L.marker([area.displayCenter.lat, area.displayCenter.lng], { icon }).addTo(map);
        mkr.bindTooltip(area.title, { sticky: true });
        mkr.on('click', () => setSelectedAreaId(area.id));
        leafletMarkers.current[area.id] = mkr;
      });
    }
  }, [useGoogleMaps, areas, mapStyle, isOverview, geoJsonData, theme, setSelectedAreaId, maxStateCount, pinMode, addCustomPin]);

  // ── Effect C: Selection highlight (no layer rebuild) ─────────────────────────
  useEffect(() => {
    if (isOverview) return;
    if (useGoogleMaps) {
      const win = window as unknown as CustomWindow;
      const google = win.google;
      if (!google || !googleMapInstance.current) return;
      areas.forEach(area => {
        const poly = googlePolygons.current[area.id];
        const mkr  = googleMarkers.current[area.id];
        const sel  = selectedAreaId === area.id;
        const col  = getStatusColor(area.status);
        poly?.setOptions({ strokeWeight: sel ? 3.5 : 1.5, fillOpacity: sel ? 0.35 : 0.15 });
        if (mkr) {
          mkr.setIcon({ path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, fillColor: col, fillOpacity: 1, strokeColor: '#fff', strokeWeight: sel ? 2 : 1.5, scale: sel ? 8 : 6 });
          mkr.setZIndex(sel ? google.maps.Marker.MAX_ZINDEX + 1 : null);
        }
      });
      if (selectedAreaId) {
        const sel = areas.find(a => a.id === selectedAreaId);
        if (sel) googleMapInstance.current.panTo(sel.center);
      }
    } else {
      if (!leafletMap.current) return;
      areas.forEach(area => {
        const poly = leafletPolygons.current[area.id];
        const mkr  = leafletMarkers.current[area.id];
        const sel  = selectedAreaId === area.id;
        const col  = getStatusColor(area.status);
        poly?.setStyle({ weight: sel ? 4 : 2, fillOpacity: sel ? 0.35 : 0.15 });
        if (sel) poly?.bringToFront();
        if (mkr) {
          mkr.setIcon(L.divIcon({ html: buildMarkerHtml(col, sel), className: 'custom-leaflet-marker-wrapper', iconSize: [0, 0], iconAnchor: [0, 0] }));
          mkr.setZIndexOffset(sel ? 1000 : 0);
        }
      });
      if (selectedAreaId) {
        const sel = areas.find(a => a.id === selectedAreaId);
        if (sel) leafletMap.current.panTo([sel.center.lat, sel.center.lng]);
      }
    }
  }, [useGoogleMaps, selectedAreaId, areas, isOverview]);

  // ── Effect D: Zoom-only marker repositioning ─────────────────────────────────
  useEffect(() => {
    if (isOverview) return;
    const adjusted = adjustMarkerPositions(areas, zoomRef.current);
    if (useGoogleMaps) {
      adjusted.forEach(a => googleMarkers.current[a.id]?.setPosition(a.displayCenter));
    } else {
      adjusted.forEach(a => leafletMarkers.current[a.id]?.setLatLng([a.displayCenter.lat, a.displayCenter.lng]));
    }
  }, [zoom, useGoogleMaps, areas, isOverview]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="map-section" data-map-style={mapStyle}>
      <div ref={mapRef} className="map-element" style={{ width: '100%', height: '100%', backgroundColor: getMapBgColor(mapStyle) }} />

      {/* Address Search Bar */}
      <div className="map-search-bar" ref={searchRef}>
        <div className="map-search-input-wrap">
          <Search size={14} className="map-search-icon" />
          <input
            className="map-search-input"
            type="text"
            placeholder="Ort oder Adresse suchen…"
            value={searchQuery}
            onChange={e => handleSearchInput(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
          />
          {searchQuery && (
            <button className="map-search-clear" onClick={() => { setSearchQuery(''); setSearchResults([]); setShowResults(false); }}>
              <X size={12} />
            </button>
          )}
          {isSearching && <div className="map-search-spinner" />}
        </div>
        {showResults && searchResults.length > 0 && (
          <div className="map-search-results">
            {searchResults.map((r, i) => (
              <button key={i} className="map-search-result-item" onClick={() => selectSearchResult(r)}>
                <Search size={12} className="map-search-result-icon" />
                <span>{r.display_name.split(',').slice(0, 3).join(', ')}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Layer Selector */}
      <div className="map-layer-selector" ref={layerMenuRef}>
        <button className="map-layer-btn-trigger" onClick={() => setShowLayerMenu(!showLayerMenu)} title="Kartenstil">
          <Layers size={15} />
        </button>
        {showLayerMenu && (
          <div className="map-layer-dropdown">
            {([
              { key: 'street',    icon: <Map size={13} />,    label: 'Straße' },
              { key: 'satellite', icon: <Globe size={13} />,  label: 'Satellit' },
              { key: 'light',     icon: <Sun size={13} />,    label: 'Hell' },
              { key: 'dark',      icon: <Moon size={13} />,   label: 'Dunkel' },
            ] as const).map(({ key, icon, label }) => (
              <button key={key} className={`map-layer-option ${mapStyle === key ? 'active' : ''}`}
                onClick={() => { setMapStyle(key); setShowLayerMenu(false); }}>
                {icon}<span>{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status Overview Card */}
      <div className="map-overview-card">
        <h3 className="map-overview-title">Übersicht</h3>
        <div className="map-overview-list">
          {([
            { key: 'planung',       label: 'In Planung',    color: '#2563EB' },
            { key: 'ausschreibung', label: 'Ausschreibung', color: '#0D9488' },
            { key: 'bau',           label: 'Im Bau',        color: '#D97706' },
            { key: 'abgeschlossen', label: 'Abgeschlossen', color: '#6B7280' },
          ] as const).map(({ key, label, color }) => (
            <div key={key}
              className={`map-overview-item ${filters.status === key ? 'active' : ''}`}
              onClick={() => setFilters(p => ({ ...p, status: p.status === key ? 'all' : key }))}>
              <span className="map-overview-label">
                <span className="map-overview-dot" style={{ backgroundColor: color }} />
                {label}
              </span>
              <span className="map-overview-count">{statusCounts[key]}</span>
            </div>
          ))}
        </div>
        <div className="map-overview-divider" />
        <button className="map-overview-all-link" onClick={() => setFilters(p => ({ ...p, status: 'all' }))}>
          Alle anzeigen
        </button>
      </div>

      {/* Choropleth Legend */}
      {isOverview && (
        <div className="map-choropleth-legend">
          <span className="map-choropleth-title">Bauprojekte je Bundesland</span>
          <div className="map-choropleth-scale" />
          <div className="map-choropleth-labels"><span>0</span><span>{maxStateCount} max</span></div>
        </div>
      )}

      {/* Controls */}
      <div className="map-controls-right">
        <button className="map-control-btn" title="Vergrößern"  onClick={handleZoomIn}><Plus size={15} /></button>
        <button className="map-control-btn" title="Verkleinern" onClick={handleZoomOut}><Minus size={15} /></button>
        <button className="map-control-btn" title="Deutschland zentrieren" onClick={handleRecenter}><Navigation size={15} /></button>
        <button className="map-control-btn" title="Mein Standort" onClick={handleLocate}><Locate size={15} /></button>
        <button
          className={`map-control-btn ${showTraffic ? 'active' : ''}`}
          title={useGoogleMaps ? 'Verkehr ein/aus' : 'Verkehr (Google Maps erforderlich)'}
          onClick={toggleTraffic}
          style={{ opacity: useGoogleMaps ? 1 : 0.4 }}
        >
          <Car size={15} />
        </button>
        <button
          className={`map-control-btn ${pinMode ? 'active' : ''}`}
          title={pinMode ? 'Markierungsmodus beenden' : 'Neubau-Markierung setzen'}
          onClick={() => setPinMode(v => !v)}
        >
          <PenTool size={15} />
        </button>
        {customPins.length > 0 && (
          <button className="map-control-btn" title="Alle Markierungen entfernen" onClick={clearCustomPins}>
            <Trash2 size={15} />
          </button>
        )}
        <button className="map-control-btn" title={isFullscreen ? 'Vollbild beenden' : 'Vollbild'} onClick={handleFullscreen}>
          {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
        </button>
      </div>

      {/* Pin mode indicator */}
      {pinMode && (
        <div className="map-pin-mode-banner">
          <PenTool size={14} />
          <span>Klicken Sie auf die Karte, um eine Neubau-Markierung zu setzen</span>
          <button onClick={() => setPinMode(false)}><X size={14} /></button>
        </div>
      )}
    </div>
  );
};
