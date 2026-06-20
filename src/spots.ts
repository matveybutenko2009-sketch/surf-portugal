import type { Spot } from './types';
import { ALGARVE_BEACHES } from './data/algarveBeaches';

// Hand-curated surf spots (north → south) + full OSM beach list for Algarve
const SURF_SPOTS: Spot[] = [
  // ── Lisboa / Cascais ────────────────────────────────────────────────────────
  {
    id: 'carcavelos',
    name: 'Carcavelos',
    region: 'Lisboa',
    lat: 38.68,
    lng: -9.34,
    offshoreWindDir: 90,
    cameraUrl: 'https://www.beachcam.pt/camsite/carcavelos/',
  },
  {
    id: 'caparica',
    name: 'Costa da Caparica',
    region: 'Lisboa',
    lat: 38.64,
    lng: -9.23,
    offshoreWindDir: 90,
    cameraUrl: 'https://www.beachcam.pt/camsite/costa-da-caparica/',
  },
  {
    id: 'guincho',
    name: 'Guincho',
    region: 'Cascais',
    lat: 38.73,
    lng: -9.47,
    offshoreWindDir: 90,
  },
  // ── Ericeira / Peniche / Nazaré ─────────────────────────────────────────────
  {
    id: 'ribeira-ilhas',
    name: "Ribeira d'Ilhas",
    region: 'Ericeira',
    lat: 38.99,
    lng: -9.42,
    offshoreWindDir: 90,
    cameraUrl: 'https://www.beachcam.pt/camsite/ribeira-dilhas/',
  },
  {
    id: 'supertubos',
    name: 'Supertubos',
    region: 'Peniche',
    lat: 39.34,
    lng: -9.36,
    offshoreWindDir: 90,
    cameraUrl: 'https://www.beachcam.pt/camsite/supertubos/',
  },
  {
    id: 'praia-do-norte',
    name: 'Praia do Norte',
    region: 'Nazaré',
    lat: 39.61,
    lng: -9.09,
    offshoreWindDir: 90,
  },
  // ── Algarve – Costa Vicentina ───────────────────────────────────────────────
  { id: 'odeceixe',      name: 'Praia de Odeceixe',    region: 'Algarve', subregion: 'Aljezur',      lat: 37.43, lng: -8.77, offshoreWindDir: 90 },
  { id: 'monte-clerigo', name: 'Praia de Monte Clérigo', region: 'Algarve', subregion: 'Aljezur',    lat: 37.32, lng: -8.88, offshoreWindDir: 90 },
  { id: 'arrifana',      name: 'Praia de Arrifana',    region: 'Algarve', subregion: 'Aljezur',      lat: 37.30, lng: -8.87, offshoreWindDir: 90, cameraUrl: 'https://www.beachcam.pt/camsite/arrifana/' },
  { id: 'bordeira',      name: 'Praia da Bordeira',    region: 'Algarve', subregion: 'Aljezur',      lat: 37.19, lng: -8.90, offshoreWindDir: 90 },
  { id: 'praia-do-amado', name: 'Praia do Amado',      region: 'Algarve', subregion: 'Aljezur',      lat: 37.16, lng: -8.91, offshoreWindDir: 90, cameraUrl: 'https://www.beachcam.pt/camsite/amado/' },
  { id: 'castelejo',     name: 'Praia do Castelejo',   region: 'Algarve', subregion: 'Vila do Bispo', lat: 37.09, lng: -8.94, offshoreWindDir: 90 },
  // ── Algarve – Sagres ────────────────────────────────────────────────────────
  { id: 'beliche',   name: 'Praia de Beliche',  region: 'Algarve', subregion: 'Vila do Bispo', lat: 37.02, lng: -8.98, offshoreWindDir: 45 },
  { id: 'tonel',     name: 'Praia do Tonel',    region: 'Algarve', subregion: 'Vila do Bispo', lat: 37.01, lng: -8.94, offshoreWindDir: 30, cameraUrl: 'https://www.beachcam.pt/camsite/tonel/' },
  { id: 'mareta',    name: 'Praia da Mareta',   region: 'Algarve', subregion: 'Vila do Bispo', lat: 37.00, lng: -8.93, offshoreWindDir: 0 },
  { id: 'martinhal', name: 'Praia do Martinhal', region: 'Algarve', subregion: 'Vila do Bispo', lat: 37.02, lng: -8.91, offshoreWindDir: 0 },
  // ── Algarve – Costa Sul ──────────────────────────────────────────────────────
  { id: 'salema',    name: 'Praia de Salema', region: 'Algarve', subregion: 'Lagos', lat: 37.07, lng: -8.58, offshoreWindDir: 0 },
  { id: 'luz',       name: 'Praia da Luz',    region: 'Algarve', subregion: 'Lagos', lat: 37.09, lng: -8.72, offshoreWindDir: 0 },
  { id: 'meia-praia', name: 'Meia Praia',     region: 'Algarve', subregion: 'Lagos', lat: 37.11, lng: -8.67, offshoreWindDir: 0 },
];

// Merge: surf spots first (they have richer metadata), then OSM beaches.
// Dedup by id — surf spot wins on collision.
const surfIds = new Set(SURF_SPOTS.map((s) => s.id));
export const SPOTS: Spot[] = [
  ...SURF_SPOTS,
  ...ALGARVE_BEACHES.filter((b) => !surfIds.has(b.id)),
];
