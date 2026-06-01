import type { DevelopmentArea, NotificationItem } from './types';

export const mockAreas: DevelopmentArea[] = [
  {
    id: 'nord-ost-kinderhaus',
    title: 'Wohngebiet Nord-Ost',
    location: 'Münster, Kinderhaus',
    district: 'Kinderhaus',
    state: 'Nordrhein-Westfalen',
    areaSize: 4.2,
    units: 120,
    authority: 'Stadt Münster – Amt für Stadtentwicklung',
    status: 'ausschreibung',
    deadline: '14.06.2024',
    center: { lat: 51.9920, lng: 7.6180 },
    polygon: [
      { lat: 51.9960, lng: 7.6100 },
      { lat: 52.0000, lng: 7.6250 },
      { lat: 51.9950, lng: 7.6350 },
      { lat: 51.9880, lng: 7.6200 }
    ],
    description: 'Ausschreibung für die schrittweise Erschließung eines neuen Wohngebietes im Nord-Osten des Stadtteils Kinderhaus. Vorgesehen ist ein Mix aus mehrgeschossigen Mietwohnungen und energieeffizienten Reihenhäusern. Ein besonderer Fokus liegt auf sozial gefördertem Wohnraum sowie einer autofreien Quartiersgestaltung mit integrierten Grünanlagen.',
    documents: [
      { name: 'Ausschreibungsdokument_Gesamt.pdf', url: '#', size: '4.8 MB' },
      { name: 'Bebauungsplan_Nr_542_Entwurf.pdf', url: '#', size: '12.4 MB' },
      { name: 'Bodengutachten_Nord_Ost.pdf', url: '#', size: '2.1 MB' }
    ],
    contactPerson: {
      name: 'Dr. Manfred Schulte',
      role: 'Projektleiter Stadtentwicklung',
      email: 'm.schulte@stadt-muenster.de',
      phone: '+49 251 492-6124'
    }
  },
  {
    id: 'gievenbeck-erweiterung',
    title: 'Erweiterung Gievenbeck',
    location: 'Münster, Gievenbeck',
    district: 'Gievenbeck',
    state: 'Nordrhein-Westfalen',
    areaSize: 6.8,
    units: 200,
    authority: 'Stadt Münster – Amt für Stadtentwicklung',
    status: 'planung',
    publishDate: '20.05.2024',
    center: { lat: 51.9620, lng: 7.5720 },
    polygon: [
      { lat: 51.9680, lng: 7.5600 },
      { lat: 51.9690, lng: 7.5800 },
      { lat: 51.9580, lng: 7.5850 },
      { lat: 51.9540, lng: 7.5700 }
    ],
    description: 'Das Planungsverfahren zur westlichen Erweiterung des Stadtteils Gievenbeck wurde eingeleitet. Ziel ist die Schaffung von dringend benötigtem Wohnraum für Studierende, Familien und Singles. Geplant sind neben Wohnhäusern eine neue dreizügige Kindertagesstätte sowie ein Nahversorgungszentrum mit Supermarkt und Apotheke.',
    documents: [
      { name: 'Aufstellungsbeschluss_Gievenbeck_West.pdf', url: '#', size: '1.2 MB' },
      { name: 'Visualisierungskonzept_Quartier.pdf', url: '#', size: '8.7 MB' }
    ],
    contactPerson: {
      name: 'Sabine Jansen',
      role: 'Planungsamt Münster',
      email: 's.jansen@stadt-muenster.de',
      phone: '+49 251 492-6139'
    }
  },
  {
    id: 'hiltrup-west-suedlich',
    title: 'Südlich Hiltrup-West',
    location: 'Münster, Hiltrup',
    district: 'Hiltrup',
    state: 'Nordrhein-Westfalen',
    areaSize: 3.1,
    units: 90,
    authority: 'Stadt Münster – Tiefbauamt',
    status: 'bau',
    startDate: 'Q2 / 2024',
    center: { lat: 51.9020, lng: 7.6320 },
    polygon: [
      { lat: 51.9080, lng: 7.6250 },
      { lat: 51.9090, lng: 7.6400 },
      { lat: 51.8980, lng: 7.6450 },
      { lat: 51.8950, lng: 7.6300 }
    ],
    description: 'Erschließungsarbeiten und Straßenbauarbeiten im südlichen Hiltrup-West haben begonnen. Das Baugebiet wird an das bestehende Fernwärmenetz angeschlossen und erhält eine moderne Glasfaserinfrastruktur. Die Hochbauarbeiten für die ersten Mehrfamilienhäuser starten voraussichtlich ab Herbst 2024.',
    documents: [
      { name: 'Erschliessungsplan_Kanalisation.pdf', url: '#', size: '5.2 MB' },
      { name: 'Verkehrsgutachten_Hiltrup_Sued.pdf', url: '#', size: '3.6 MB' },
      { name: 'Bauzeitenplan_Stufe_1.pdf', url: '#', size: '890 KB' }
    ],
    contactPerson: {
      name: 'Thomas Meier',
      role: 'Bauleiter Infrastruktur',
      email: 't.meier@stadt-muenster.de',
      phone: '+49 251 492-6681'
    }
  },
  {
    id: 'albachten-wohnpark',
    title: 'Wohnpark Tempelhof',
    location: 'Berlin, Tempelhof',
    district: 'Tempelhof',
    state: 'Berlin',
    areaSize: 2.7,
    units: 80,
    authority: 'Bezirksamt Tempelhof-Schöneberg',
    status: 'abgeschlossen',
    completionDate: 'Q1 / 2024',
    center: { lat: 52.4820, lng: 13.4050 },
    polygon: [
      { lat: 52.4860, lng: 13.3950 },
      { lat: 52.4900, lng: 13.4150 },
      { lat: 52.4800, lng: 13.4200 },
      { lat: 52.4760, lng: 13.4000 }
    ],
    description: 'Das Wohngebiet "Wohnpark Tempelhof" wurde im ersten Quartal 2024 erfolgreich fertiggestellt und vollständig an die Eigentümer und Mieter übergeben. Die öffentlichen Spielplätze sowie der zentrale Quartiersplatz wurden im Mai bepflanzt und zur Nutzung freigegeben.',
    documents: [
      { name: 'Protokoll_Endabnahme_Infrastruktur.pdf', url: '#', size: '1.4 MB' },
      { name: 'Ueberlassungsvertrag_Gruenflächen.pdf', url: '#', size: '2.3 MB' }
    ],
    contactPerson: {
      name: 'Julia Becker',
      role: 'Referentin für Stadtteileentwicklung',
      email: 'j.becker@stadt-berlin.de',
      phone: '+49 30 90277-0'
    }
  },
  {
    id: 'loddenheide-gewerbe',
    title: 'Gewerbepark Freimann',
    location: 'München, Freimann',
    district: 'Freimann',
    state: 'Bayern',
    areaSize: 12.5,
    units: 0,
    authority: 'Referat für Stadtplanung München',
    status: 'bau',
    startDate: 'Q3 / 2023',
    center: { lat: 48.1920, lng: 11.6180 },
    polygon: [
      { lat: 48.1980, lng: 11.6050 },
      { lat: 48.2000, lng: 11.6300 },
      { lat: 48.1880, lng: 11.6350 },
      { lat: 48.1850, lng: 11.6100 }
    ],
    description: 'Erweiterung des Gewerbeparks Freimann für innovative Technologieunternehmen und forschungsnahe Betriebe. Das Areal zeichnet sich durch hohe ökologische Standards aus, darunter begrünte Dachflächen und eine eigene Regenwasser-Rückhalteanlage.',
    documents: [
      { name: 'Bebauungsplan_Gewerbepark.pdf', url: '#', size: '6.4 MB' },
      { name: 'Kriterienkatalog_Nachhaltigkeit.pdf', url: '#', size: '1.9 MB' }
    ],
    contactPerson: {
      name: 'Dieter Voss',
      role: 'Wirtschaftsförderung München',
      email: 'voss@muenchen.de',
      phone: '+49 89 233-00'
    }
  },
  {
    id: 'oxford-kaserne',
    title: 'Altona Wohnquartier',
    location: 'Hamburg, Altona',
    district: 'Altona',
    state: 'Hamburg',
    areaSize: 26.0,
    units: 1200,
    authority: 'Bezirksamt Altona',
    status: 'planung',
    publishDate: '15.04.2024',
    center: { lat: 53.5580, lng: 9.9320 },
    polygon: [
      { lat: 53.5640, lng: 9.9200 },
      { lat: 53.5660, lng: 9.9500 },
      { lat: 53.5520, lng: 9.9550 },
      { lat: 53.5500, lng: 9.9250 }
    ],
    description: 'Konversion des ehemaligen Kasernenareals in Altona zu einem lebendigen Wohnquartier. Die historischen Backsteingebäude werden denkmalgerecht saniert und durch moderne Neubauten ergänzt. Geplant sind Wohnungen für ca. 3.000 Menschen, zwei Kitas, eine Grundschule und großzügige Kulturflächen.',
    documents: [
      { name: 'Masterplan_Altona_Quartier.pdf', url: '#', size: '24.5 MB' },
      { name: 'Kulturkonzept_Buergerbeteiligung.pdf', url: '#', size: '3.1 MB' }
    ],
    contactPerson: {
      name: 'Arndt Korte',
      role: 'Projektleiter Konversion',
      email: 'a.korte@hamburg.de',
      phone: '+49 40 42811-0'
    }
  },
  {
    id: 'york-kaserne',
    title: 'Vaihingen Quartier',
    location: 'Stuttgart, Vaihingen',
    district: 'Vaihingen',
    state: 'Baden-Württemberg',
    areaSize: 50.0,
    units: 1800,
    authority: 'Stadt Stuttgart - Baurechtsamt',
    status: 'ausschreibung',
    deadline: '31.08.2024',
    center: { lat: 48.7280, lng: 9.1120 },
    polygon: [
      { lat: 48.7340, lng: 9.1000 },
      { lat: 48.7360, lng: 9.1300 },
      { lat: 48.7220, lng: 9.1350 },
      { lat: 48.7200, lng: 9.1050 }
    ],
    description: 'Großflächiges Ausschreibungsverfahren für Baufelder in Stuttgart-Vaihingen. Vergeben werden Grundstücke für Mehrfamilienhäuser, Baugruppenprojekte sowie genossenschaftliches Wohnen. Das Quartier wird als klima- und mobilitätsbewusstes Vorzeigeprojekt entwickelt.',
    documents: [
      { name: 'Vergabebedingungen_Vaihingen.pdf', url: '#', size: '9.3 MB' },
      { name: 'Energiekonzept_Quartiersnetz.pdf', url: '#', size: '7.2 MB' },
      { name: 'Geltungsbereich_Planung.png', url: '#', size: '3.4 MB' }
    ],
    contactPerson: {
      name: 'Elke Brandt',
      role: 'Vergabestelle Stadt Stuttgart',
      email: 'e.brandt@stuttgart.de',
      phone: '+49 711 216-0'
    }
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Neue Ausschreibung veröffentlicht',
    message: 'Die Ausschreibung für das "Wohngebiet Nord-Ost" in Kinderhaus wurde freigeschaltet. Frist bis zum 14.06.2024.',
    time: 'Vor 10 Min.',
    read: false,
    type: 'success'
  },
  {
    id: 'notif-2',
    title: 'Planungsänderung',
    message: 'Neue Dokumente zum "Wohnquartier Oxford-Kaserne" wurden hochgeladen.',
    time: 'Vor 2 Std.',
    read: false,
    type: 'info'
  },
  {
    id: 'notif-3',
    title: 'Frist läuft ab',
    message: 'Die Abgabefrist für das Projekt "Wohngebiet Nord-Ost" endet in 14 Tagen.',
    time: 'Vor 1 Tag',
    read: true,
    type: 'warning'
  }
];
