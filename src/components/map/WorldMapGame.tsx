'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import Link from 'next/link';
import { shuffleArray } from '@/lib/questions';
import { useAuth } from '@/context/AuthContext';
import { saveScore } from '@/lib/db';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

type Continent = 'americas' | 'europe' | 'africa' | 'asia' | 'oceania';
type Phase = 'select' | 'game' | 'done';
type Filter =
  | { type: 'all' }
  | { type: 'continent'; value: Continent }
  | { type: 'letter'; value: string };

interface CountryData {
  geo: string;       // exact geo.properties.name from world-atlas
  continent: Continent;
}

const ALL_COUNTRIES: CountryData[] = [
  // Americas
  { geo: 'Canada',                    continent: 'americas' },
  { geo: 'United States of America',  continent: 'americas' },
  { geo: 'Mexico',                    continent: 'americas' },
  { geo: 'Cuba',                      continent: 'americas' },
  { geo: 'Haiti',                     continent: 'americas' },
  { geo: 'Jamaica',                   continent: 'americas' },
  { geo: 'Dominican Rep.',            continent: 'americas' },
  { geo: 'Guatemala',                 continent: 'americas' },
  { geo: 'Belize',                    continent: 'americas' },
  { geo: 'El Salvador',               continent: 'americas' },
  { geo: 'Honduras',                  continent: 'americas' },
  { geo: 'Nicaragua',                 continent: 'americas' },
  { geo: 'Costa Rica',                continent: 'americas' },
  { geo: 'Panama',                    continent: 'americas' },
  { geo: 'Colombia',                  continent: 'americas' },
  { geo: 'Venezuela',                 continent: 'americas' },
  { geo: 'Guyana',                    continent: 'americas' },
  { geo: 'Suriname',                  continent: 'americas' },
  { geo: 'Ecuador',                   continent: 'americas' },
  { geo: 'Peru',                      continent: 'americas' },
  { geo: 'Brazil',                    continent: 'americas' },
  { geo: 'Bolivia',                   continent: 'americas' },
  { geo: 'Chile',                     continent: 'americas' },
  { geo: 'Argentina',                 continent: 'americas' },
  { geo: 'Uruguay',                   continent: 'americas' },
  { geo: 'Paraguay',                  continent: 'americas' },
  // Europe
  { geo: 'Iceland',                   continent: 'europe' },
  { geo: 'United Kingdom',            continent: 'europe' },
  { geo: 'Ireland',                   continent: 'europe' },
  { geo: 'Norway',                    continent: 'europe' },
  { geo: 'Sweden',                    continent: 'europe' },
  { geo: 'Finland',                   continent: 'europe' },
  { geo: 'Denmark',                   continent: 'europe' },
  { geo: 'Netherlands',               continent: 'europe' },
  { geo: 'Belgium',                   continent: 'europe' },
  { geo: 'France',                    continent: 'europe' },
  { geo: 'Spain',                     continent: 'europe' },
  { geo: 'Portugal',                  continent: 'europe' },
  { geo: 'Germany',                   continent: 'europe' },
  { geo: 'Switzerland',               continent: 'europe' },
  { geo: 'Austria',                   continent: 'europe' },
  { geo: 'Italy',                     continent: 'europe' },
  { geo: 'Greece',                    continent: 'europe' },
  { geo: 'Poland',                    continent: 'europe' },
  { geo: 'Czechia',                   continent: 'europe' },
  { geo: 'Slovakia',                  continent: 'europe' },
  { geo: 'Hungary',                   continent: 'europe' },
  { geo: 'Romania',                   continent: 'europe' },
  { geo: 'Moldova',                   continent: 'europe' },
  { geo: 'Bulgaria',                  continent: 'europe' },
  { geo: 'Serbia',                    continent: 'europe' },
  { geo: 'Montenegro',                continent: 'europe' },
  { geo: 'Croatia',                   continent: 'europe' },
  { geo: 'Bosnia and Herz.',          continent: 'europe' },
  { geo: 'Albania',                   continent: 'europe' },
  { geo: 'N. Macedonia',              continent: 'europe' },
  { geo: 'Slovenia',                  continent: 'europe' },
  { geo: 'Ukraine',                   continent: 'europe' },
  { geo: 'Belarus',                   continent: 'europe' },
  { geo: 'Lithuania',                 continent: 'europe' },
  { geo: 'Latvia',                    continent: 'europe' },
  { geo: 'Estonia',                   continent: 'europe' },
  { geo: 'Russia',                    continent: 'europe' },
  { geo: 'Turkey',                    continent: 'europe' },
  { geo: 'Cyprus',                    continent: 'europe' },
  { geo: 'Georgia',                   continent: 'europe' },
  { geo: 'Armenia',                   continent: 'europe' },
  { geo: 'Azerbaijan',                continent: 'europe' },
  // Africa
  { geo: 'Morocco',                   continent: 'africa' },
  { geo: 'Algeria',                   continent: 'africa' },
  { geo: 'Tunisia',                   continent: 'africa' },
  { geo: 'Libya',                     continent: 'africa' },
  { geo: 'Egypt',                     continent: 'africa' },
  { geo: 'Mauritania',                continent: 'africa' },
  { geo: 'Mali',                      continent: 'africa' },
  { geo: 'Niger',                     continent: 'africa' },
  { geo: 'Chad',                      continent: 'africa' },
  { geo: 'Sudan',                     continent: 'africa' },
  { geo: 'Djibouti',                  continent: 'africa' },
  { geo: 'Ethiopia',                  continent: 'africa' },
  { geo: 'Somalia',                   continent: 'africa' },
  { geo: 'Senegal',                   continent: 'africa' },
  { geo: 'Gambia',                    continent: 'africa' },
  { geo: 'Guinea-Bissau',             continent: 'africa' },
  { geo: 'Guinea',                    continent: 'africa' },
  { geo: 'Sierra Leone',              continent: 'africa' },
  { geo: 'Liberia',                   continent: 'africa' },
  { geo: "Côte d'Ivoire",            continent: 'africa' },
  { geo: 'Ghana',                     continent: 'africa' },
  { geo: 'Burkina Faso',              continent: 'africa' },
  { geo: 'Togo',                      continent: 'africa' },
  { geo: 'Benin',                     continent: 'africa' },
  { geo: 'Nigeria',                   continent: 'africa' },
  { geo: 'Cameroon',                  continent: 'africa' },
  { geo: 'Eq. Guinea',               continent: 'africa' },
  { geo: 'Gabon',                     continent: 'africa' },
  { geo: 'Central African Rep.',      continent: 'africa' },
  { geo: 'Dem. Rep. Congo',           continent: 'africa' },
  { geo: 'Congo',                     continent: 'africa' },
  { geo: 'Angola',                    continent: 'africa' },
  { geo: 'Zambia',                    continent: 'africa' },
  { geo: 'Zimbabwe',                  continent: 'africa' },
  { geo: 'Mozambique',                continent: 'africa' },
  { geo: 'Namibia',                   continent: 'africa' },
  { geo: 'Botswana',                  continent: 'africa' },
  { geo: 'Lesotho',                   continent: 'africa' },
  { geo: 'Swaziland',                 continent: 'africa' },
  { geo: 'South Africa',              continent: 'africa' },
  { geo: 'Madagascar',                continent: 'africa' },
  { geo: 'Kenya',                     continent: 'africa' },
  { geo: 'Tanzania',                  continent: 'africa' },
  { geo: 'Uganda',                    continent: 'africa' },
  { geo: 'Rwanda',                    continent: 'africa' },
  { geo: 'Burundi',                   continent: 'africa' },
  { geo: 'Malawi',                    continent: 'africa' },
  { geo: 'S. Sudan',                  continent: 'africa' },
  { geo: 'Eritrea',                   continent: 'africa' },
  // Asia
  { geo: 'Saudi Arabia',              continent: 'asia' },
  { geo: 'Yemen',                     continent: 'asia' },
  { geo: 'Oman',                      continent: 'asia' },
  { geo: 'United Arab Emirates',      continent: 'asia' },
  { geo: 'Qatar',                     continent: 'asia' },
  { geo: 'Kuwait',                    continent: 'asia' },
  { geo: 'Iraq',                      continent: 'asia' },
  { geo: 'Iran',                      continent: 'asia' },
  { geo: 'Syria',                     continent: 'asia' },
  { geo: 'Lebanon',                   continent: 'asia' },
  { geo: 'Jordan',                    continent: 'asia' },
  { geo: 'Israel',                    continent: 'asia' },
  { geo: 'Afghanistan',               continent: 'asia' },
  { geo: 'Pakistan',                  continent: 'asia' },
  { geo: 'India',                     continent: 'asia' },
  { geo: 'Nepal',                     continent: 'asia' },
  { geo: 'Bhutan',                    continent: 'asia' },
  { geo: 'Bangladesh',                continent: 'asia' },
  { geo: 'Myanmar',                   continent: 'asia' },
  { geo: 'Thailand',                  continent: 'asia' },
  { geo: 'Vietnam',                   continent: 'asia' },
  { geo: 'Cambodia',                  continent: 'asia' },
  { geo: 'Laos',                      continent: 'asia' },
  { geo: 'Malaysia',                  continent: 'asia' },
  { geo: 'Indonesia',                 continent: 'asia' },
  { geo: 'Timor-Leste',               continent: 'asia' },
  { geo: 'Philippines',               continent: 'asia' },
  { geo: 'China',                     continent: 'asia' },
  { geo: 'Mongolia',                  continent: 'asia' },
  { geo: 'Kazakhstan',                continent: 'asia' },
  { geo: 'Uzbekistan',                continent: 'asia' },
  { geo: 'Turkmenistan',              continent: 'asia' },
  { geo: 'Kyrgyzstan',                continent: 'asia' },
  { geo: 'Tajikistan',                continent: 'asia' },
  { geo: 'Japan',                     continent: 'asia' },
  { geo: 'South Korea',               continent: 'asia' },
  { geo: 'North Korea',               continent: 'asia' },
  { geo: 'Sri Lanka',                 continent: 'asia' },
  // Oceania
  { geo: 'Australia',                 continent: 'oceania' },
  { geo: 'New Zealand',               continent: 'oceania' },
  { geo: 'Papua New Guinea',          continent: 'oceania' },
  { geo: 'Fiji',                      continent: 'oceania' },
];

const ALL_GEO_NAMES = new Set(ALL_COUNTRIES.map((c) => c.geo));

const DISPLAY_NAMES: Record<string, string> = {
  'United States of America': 'United States',
  'Dominican Rep.':           'Dominican Republic',
  'Bosnia and Herz.':         'Bosnia and Herzegovina',
  'N. Macedonia':             'North Macedonia',
  'Czechia':                  'Czech Republic',
  "Côte d'Ivoire":           'Ivory Coast',
  'Dem. Rep. Congo':          'DR Congo',
  'Congo':                    'Republic of Congo',
  'S. Sudan':                 'South Sudan',
  'United Arab Emirates':     'UAE',
  'Central African Rep.':     'Central African Republic',
  'Eq. Guinea':               'Equatorial Guinea',
  'Swaziland':                'Eswatini',
};

function displayName(geo: string) {
  return DISPLAY_NAMES[geo] ?? geo;
}

// Extra countries for type mode only (too small / not in click-mode list)
interface TypeExtra { name: string; geo: string | null; iso: string; }
const TYPE_EXTRA: TypeExtra[] = [
  // Americas
  { name: 'Trinidad and Tobago',          geo: 'Trinidad and Tobago', iso: 'tt' },
  { name: 'Bahamas',                       geo: 'Bahamas',             iso: 'bs' },
  { name: 'Barbados',                      geo: null,                  iso: 'bb' },
  { name: 'Saint Lucia',                   geo: null,                  iso: 'lc' },
  { name: 'Saint Vincent and the Grenadines', geo: null,               iso: 'vc' },
  { name: 'Grenada',                       geo: null,                  iso: 'gd' },
  { name: 'Antigua and Barbuda',           geo: null,                  iso: 'ag' },
  { name: 'Dominica',                      geo: null,                  iso: 'dm' },
  { name: 'Saint Kitts and Nevis',         geo: null,                  iso: 'kn' },
  // Europe
  { name: 'Luxembourg',                    geo: 'Luxembourg',          iso: 'lu' },
  { name: 'Kosovo',                        geo: 'Kosovo',              iso: 'xk' },
  { name: 'Malta',                         geo: null,                  iso: 'mt' },
  { name: 'Andorra',                       geo: null,                  iso: 'ad' },
  { name: 'Monaco',                        geo: null,                  iso: 'mc' },
  { name: 'Liechtenstein',                 geo: null,                  iso: 'li' },
  { name: 'San Marino',                    geo: null,                  iso: 'sm' },
  { name: 'Vatican City',                  geo: null,                  iso: 'va' },
  // Africa
  { name: 'Cape Verde',                    geo: null,                  iso: 'cv' },
  { name: 'São Tomé and Príncipe',         geo: null,                  iso: 'st' },
  { name: 'Comoros',                       geo: null,                  iso: 'km' },
  { name: 'Mauritius',                     geo: null,                  iso: 'mu' },
  { name: 'Seychelles',                    geo: null,                  iso: 'sc' },
  // Asia
  { name: 'Brunei',                        geo: 'Brunei',              iso: 'bn' },
  { name: 'Singapore',                     geo: null,                  iso: 'sg' },
  { name: 'Bahrain',                       geo: null,                  iso: 'bh' },
  { name: 'Maldives',                      geo: null,                  iso: 'mv' },
  { name: 'Palestine',                     geo: null,                  iso: 'ps' },
  { name: 'Taiwan',                        geo: 'Taiwan',              iso: 'tw' },
  // Oceania
  { name: 'Solomon Islands',               geo: 'Solomon Is.',         iso: 'sb' },
  { name: 'Vanuatu',                       geo: 'Vanuatu',             iso: 'vu' },
  { name: 'Samoa',                         geo: null,                  iso: 'ws' },
  { name: 'Tonga',                         geo: null,                  iso: 'to' },
  { name: 'Kiribati',                      geo: null,                  iso: 'ki' },
  { name: 'Micronesia',                    geo: null,                  iso: 'fm' },
  { name: 'Marshall Islands',              geo: null,                  iso: 'mh' },
  { name: 'Palau',                         geo: null,                  iso: 'pw' },
  { name: 'Nauru',                         geo: null,                  iso: 'nr' },
  { name: 'Tuvalu',                        geo: null,                  iso: 'tv' },
];

// geo name → display name for map highlighting in type mode
const TYPE_DISPLAY_TO_GEO: Record<string, string> = {};
for (const c of ALL_COUNTRIES) {
  TYPE_DISPLAY_TO_GEO[displayName(c.geo)] = c.geo;
}
for (const e of TYPE_EXTRA) {
  if (e.geo) TYPE_DISPLAY_TO_GEO[e.name] = e.geo;
}

// Display names of countries with no map geometry (show notification when typed)
const TYPE_NO_GEO = new Set(TYPE_EXTRA.filter((e) => !e.geo).map((e) => e.name));

const TYPE_TOTAL = ALL_COUNTRIES.length + TYPE_EXTRA.length;

// NAME_LOOKUP maps typed strings → canonical display names
const NAME_LOOKUP: Record<string, string> = {};
for (const c of ALL_COUNTRIES) {
  NAME_LOOKUP[displayName(c.geo).toLowerCase()] = displayName(c.geo);
}
for (const e of TYPE_EXTRA) {
  NAME_LOOKUP[e.name.toLowerCase()] = e.name;
}
// Common alternate names / abbreviations → display names
Object.assign(NAME_LOOKUP, {
  'usa':                                  'United States',
  'uk':                                   'United Kingdom',
  'great britain':                        'United Kingdom',
  'dr congo':                             'DR Congo',
  'drc':                                  'DR Congo',
  'democratic republic of the congo':     'DR Congo',
  'republic of the congo':               'Republic of Congo',
  'east timor':                           'Timor-Leste',
  'bosnia':                               'Bosnia and Herzegovina',
  'the gambia':                           'Gambia',
  'czechia':                              'Czech Republic',
  'holland':                              'Netherlands',
  'persia':                               'Iran',
  'burma':                                'Myanmar',
  'the bahamas':                          'Bahamas',
  'sao tome and principe':               'São Tomé and Príncipe',
  'federated states of micronesia':       'Micronesia',
  'saint vincent':                        'Saint Vincent and the Grenadines',
  'st vincent':                           'Saint Vincent and the Grenadines',
  'st lucia':                             'Saint Lucia',
  'st kitts':                             'Saint Kitts and Nevis',
  'st kitts and nevis':                   'Saint Kitts and Nevis',
  'holy see':                             'Vatican City',
  'ivory coast':                          'Ivory Coast',
});

// ISO 3166-1 alpha-2 codes keyed by geo name
const ISO_CODES: Record<string, string> = {
  // Americas
  'Canada': 'ca', 'United States of America': 'us', 'Mexico': 'mx',
  'Cuba': 'cu', 'Haiti': 'ht', 'Jamaica': 'jm', 'Dominican Rep.': 'do',
  'Guatemala': 'gt', 'Belize': 'bz', 'El Salvador': 'sv',
  'Honduras': 'hn', 'Nicaragua': 'ni', 'Costa Rica': 'cr',
  'Panama': 'pa', 'Colombia': 'co', 'Venezuela': 've', 'Guyana': 'gy',
  'Suriname': 'sr', 'Ecuador': 'ec', 'Peru': 'pe', 'Brazil': 'br',
  'Bolivia': 'bo', 'Chile': 'cl', 'Argentina': 'ar', 'Uruguay': 'uy',
  'Paraguay': 'py',
  // Europe
  'Iceland': 'is', 'United Kingdom': 'gb', 'Ireland': 'ie', 'Norway': 'no',
  'Sweden': 'se', 'Finland': 'fi', 'Denmark': 'dk', 'Netherlands': 'nl',
  'Belgium': 'be', 'France': 'fr', 'Spain': 'es', 'Portugal': 'pt',
  'Germany': 'de', 'Switzerland': 'ch', 'Austria': 'at', 'Italy': 'it',
  'Greece': 'gr', 'Poland': 'pl', 'Czechia': 'cz', 'Slovakia': 'sk',
  'Hungary': 'hu', 'Romania': 'ro', 'Bulgaria': 'bg', 'Serbia': 'rs',
  'Croatia': 'hr', 'Montenegro': 'me', 'Bosnia and Herz.': 'ba', 'Albania': 'al',
  'N. Macedonia': 'mk', 'Slovenia': 'si', 'Ukraine': 'ua', 'Belarus': 'by',
  'Lithuania': 'lt', 'Latvia': 'lv', 'Estonia': 'ee', 'Russia': 'ru',
  'Moldova': 'md', 'Turkey': 'tr', 'Cyprus': 'cy',
  'Georgia': 'ge', 'Armenia': 'am', 'Azerbaijan': 'az',
  // Africa
  'Morocco': 'ma', 'Algeria': 'dz', 'Tunisia': 'tn', 'Libya': 'ly',
  'Egypt': 'eg', 'Mauritania': 'mr', 'Mali': 'ml', 'Niger': 'ne',
  'Chad': 'td', 'Sudan': 'sd', 'Ethiopia': 'et', 'Somalia': 'so',
  'Senegal': 'sn', 'Gambia': 'gm', 'Guinea-Bissau': 'gw', 'Guinea': 'gn',
  'Sierra Leone': 'sl', 'Liberia': 'lr',
  "Côte d'Ivoire": 'ci', 'Ghana': 'gh', 'Burkina Faso': 'bf',
  'Togo': 'tg', 'Benin': 'bj', 'Nigeria': 'ng', 'Cameroon': 'cm',
  'Eq. Guinea': 'gq', 'Gabon': 'ga', 'Central African Rep.': 'cf',
  'Dem. Rep. Congo': 'cd', 'Congo': 'cg', 'Angola': 'ao',
  'Zambia': 'zm', 'Malawi': 'mw', 'Zimbabwe': 'zw', 'Mozambique': 'mz',
  'Namibia': 'na', 'Botswana': 'bw', 'Lesotho': 'ls', 'Swaziland': 'sz',
  'South Africa': 'za', 'Madagascar': 'mg', 'Kenya': 'ke',
  'Tanzania': 'tz', 'Uganda': 'ug', 'Rwanda': 'rw', 'Burundi': 'bi',
  'S. Sudan': 'ss', 'Djibouti': 'dj', 'Eritrea': 'er',
  // Asia
  'Saudi Arabia': 'sa', 'Yemen': 'ye', 'Oman': 'om',
  'United Arab Emirates': 'ae', 'Qatar': 'qa', 'Kuwait': 'kw', 'Iraq': 'iq',
  'Iran': 'ir', 'Syria': 'sy', 'Lebanon': 'lb', 'Jordan': 'jo',
  'Israel': 'il', 'Afghanistan': 'af', 'Pakistan': 'pk', 'India': 'in',
  'Nepal': 'np', 'Bhutan': 'bt', 'Bangladesh': 'bd', 'Myanmar': 'mm', 'Thailand': 'th',
  'Vietnam': 'vn', 'Cambodia': 'kh', 'Laos': 'la', 'Malaysia': 'my',
  'Indonesia': 'id', 'Timor-Leste': 'tl', 'Philippines': 'ph', 'China': 'cn', 'Mongolia': 'mn',
  'Kazakhstan': 'kz', 'Uzbekistan': 'uz', 'Turkmenistan': 'tm',
  'Kyrgyzstan': 'kg', 'Tajikistan': 'tj', 'Japan': 'jp',
  'South Korea': 'kr', 'North Korea': 'kp', 'Sri Lanka': 'lk',
  // Oceania
  'Australia': 'au', 'New Zealand': 'nz', 'Papua New Guinea': 'pg', 'Fiji': 'fj',
};

function flagUrl(geo: string) {
  const code = ISO_CODES[geo];
  if (!code) return null;
  return `https://flagcdn.com/w160/${code}.png`;
}

type ProjectionConfig = { scale: number; center: [number, number] };

const WORLD_PROJECTION: ProjectionConfig = { scale: 147, center: [0, 10] };

const CONTINENT_PROJECTIONS: Record<Continent, ProjectionConfig> = {
  americas: { scale: 290, center: [-78,  5]  },
  europe:   { scale: 620, center: [ 15, 52]  },
  africa:   { scale: 380, center: [ 22,  2]  },
  asia:     { scale: 270, center: [ 95, 32]  },
  oceania:  { scale: 490, center: [148,-27]  },
};

const CONTINENT_META: Record<Continent, { label: string; description: string; color: string }> = {
  americas: { label: 'Americas',  description: 'North, Central & South America', color: '#1d4ed8' },
  europe:   { label: 'Europe',    description: 'All European nations',            color: '#7c3aed' },
  africa:   { label: 'Africa',    description: 'Across the African continent',    color: '#b45309' },
  asia:     { label: 'Asia',      description: 'From the Middle East to the Pacific', color: '#dc2626' },
  oceania:  { label: 'Oceania',   description: 'Australia, NZ & the Pacific',     color: '#059669' },
};

const AVAILABLE_LETTERS = [
  ...new Set(ALL_COUNTRIES.map((c) => displayName(c.geo)[0].toUpperCase())),
].sort();

function filterToQueue(f: Filter): string[] {
  let filtered: CountryData[];
  if (f.type === 'all') {
    filtered = ALL_COUNTRIES;
  } else if (f.type === 'continent') {
    filtered = ALL_COUNTRIES.filter((c) => c.continent === f.value);
  } else {
    filtered = ALL_COUNTRIES.filter((c) => displayName(c.geo).startsWith(f.value));
  }
  return shuffleArray(filtered.map((c) => c.geo));
}

function filterLabel(f: Filter): string {
  if (f.type === 'all') return 'All Countries';
  if (f.type === 'continent') return CONTINENT_META[f.value].label;
  return `Starting with "${f.value}"`;
}

function getCountryFill(
  geoName: string,
  queueSet: Set<string>,
  found: Set<string>,
  missed: Set<string>,
  clickResult: 'correct' | 'wrong' | null,
  target: string,
): string {
  if (found.has(geoName)) return '#22c55e';
  if (clickResult === 'wrong' && geoName === target) return '#ef4444';
  if (missed.has(geoName)) return '#7f1d1d';
  if (queueSet.has(geoName)) return '#1e1b4b';
  return '#0f0e20';
}

type Mode = 'click' | 'type';

const TYPE_DURATION = 900; // 15 minutes in seconds

export default function WorldMapGame() {
  const [phase, setPhase] = useState<Phase>('select');
  const [mode, setMode] = useState<Mode>('click');
  const [filter, setFilter] = useState<Filter>({ type: 'all' });
  const [queue, setQueue] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [clickResult, setClickResult] = useState<'correct' | 'wrong' | null>(null);
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [0, 0],
    zoom: 1,
  });
  const [homePosition, setHomePosition] = useState<[number, number]>([0, 0]);

  // Type mode state
  const [typeInput, setTypeInput] = useState('');
  const [typeFound, setTypeFound] = useState<Set<string>>(new Set()); // stores display names
  const [timeLeft, setTimeLeft] = useState(TYPE_DURATION);
  const [notification, setNotification] = useState<string | null>(null);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, username } = useAuth();
  const scoreSaved = useRef(false);
  const [isRanked, setIsRanked] = useState(false);

  const typeFoundGeos = useMemo(() => {
    const s = new Set<string>();
    for (const dn of typeFound) {
      const geo = TYPE_DISPLAY_TO_GEO[dn];
      if (geo) s.add(geo);
    }
    return s;
  }, [typeFound]);
  useEffect(() => {
    if (phase !== 'game' || mode !== 'type') return;
    if (timeLeft <= 0) { setPhase('done'); return; }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
  }, [phase, mode, timeLeft]);

  const queueSet = useMemo(() => new Set(queue), [queue]);

  const projectionConfig = useMemo<ProjectionConfig>(() => {
    if (filter.type === 'continent') return CONTINENT_PROJECTIONS[filter.value];
    return WORLD_PROJECTION;
  }, [filter]);
  const target = queue[index] ?? '';

  useEffect(() => {
    if (phase !== 'done' || !user || scoreSaved.current) return;
    scoreSaved.current = true;
    const isType = mode === 'type';
    const total = isType ? TYPE_TOTAL : queue.length;
    const correct = isType ? typeFound.size : score;
    saveScore(user.uid, {
      game: 'world-map',
      category: null,
      label: isType ? 'World Map — Type Mode' : `World Map — ${filterLabel(filter)}`,
      score: correct,
      total,
      pct: Math.round((correct / total) * 100),
    }, username, isRanked).catch(() => {});
  }, [phase, user, mode, score, queue.length, typeFound.size, filter, isRanked]);

  const startGame = useCallback((f: Filter) => {
    scoreSaved.current = false;
    const q = filterToQueue(f);
    setMode('click');
    setFilter(f);
    setQueue(q);
    setIndex(0);
    setScore(0);
    setFound(new Set());
    setMissed(new Set());
    setClickResult(null);
    const home: [number, number] = f.type === 'continent'
      ? CONTINENT_PROJECTIONS[f.value].center
      : WORLD_PROJECTION.center;
    setHomePosition(home);
    setPosition({ coordinates: home, zoom: 1 });
    setPhase('game');
  }, []);

  const startTypeMode = useCallback(() => {
    scoreSaved.current = false;
    setMode('type');
    setTypeInput('');
    setTypeFound(new Set());
    setTimeLeft(TYPE_DURATION);
    setNotification(null);
    setHomePosition(WORLD_PROJECTION.center);
    setPosition({ coordinates: WORLD_PROJECTION.center, zoom: 1 });
    setPhase('game');
  }, []);

  const handleTypeInput = useCallback((value: string) => {
    setTypeInput(value);
    const found = NAME_LOOKUP[value.toLowerCase().trim()];
    if (found && !typeFound.has(found)) {
      const next = new Set([...typeFound, found]);
      setTypeFound(next);
      setTypeInput('');
      if (TYPE_NO_GEO.has(found)) {
        setNotification(found);
        if (notifTimer.current) clearTimeout(notifTimer.current);
        notifTimer.current = setTimeout(() => setNotification(null), 2000);
      }
      if (next.size === TYPE_TOTAL) setPhase('done');
    }
  }, [typeFound]);

  const advance = useCallback(() => {
    if (index + 1 >= queue.length) {
      setPhase('done');
    } else {
      setIndex((i) => i + 1);
      setClickResult(null);
    }
  }, [index, queue.length]);

  const handleClick = useCallback(
    (geoName: string) => {
      if (clickResult !== null || !queueSet.has(geoName)) return;
      if (found.has(geoName) || missed.has(geoName)) return;
      if (geoName === target) {
        setFound((prev) => new Set([...prev, geoName]));
        setScore((s) => s + 1);
        setClickResult('correct');
        setTimeout(advance, 1000);
      } else {
        setMissed((prev) => new Set([...prev, target]));
        setClickResult('wrong');
        setTimeout(advance, 1600);
      }
    },
    [clickResult, queueSet, found, missed, target, advance],
  );

  // ── Select ──
  if (phase === 'select') {
    const continentCounts = Object.fromEntries(
      (Object.keys(CONTINENT_META) as Continent[]).map((c) => [
        c,
        ALL_COUNTRIES.filter((x) => x.continent === c).length,
      ]),
    );
    const letterCounts = Object.fromEntries(
      AVAILABLE_LETTERS.map((l) => [
        l,
        ALL_COUNTRIES.filter((c) => displayName(c.geo).startsWith(l)).length,
      ]),
    );

    return (
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-8 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">World Map</h2>
            <p className="text-sm text-zinc-500 mt-1">Find {ALL_COUNTRIES.length} countries on the map</p>
          </div>

          <div className="flex rounded-lg border border-white/10 overflow-hidden self-start text-sm">
            <button
              onClick={() => setIsRanked(false)}
              className={`px-4 py-2 font-medium transition-colors ${!isRanked ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Practice
            </button>
            <button
              onClick={() => setIsRanked(true)}
              className={`px-4 py-2 font-medium transition-colors ${isRanked ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              ⚡ Ranked
            </button>
          </div>

          {/* Type Mode */}
          <button
            onClick={startTypeMode}
            className="w-full rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-left hover:border-emerald-500/60 hover:bg-emerald-950/30 transition-all"
          >
            <p className="text-lg font-bold">Type Mode</p>
            <p className="text-sm text-zinc-400 mt-0.5">Name all {TYPE_TOTAL} countries from memory — 15 minute timer</p>
          </button>

          {/* Click Mode — All */}
          <button
            onClick={() => startGame({ type: 'all' })}
            className="w-full rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-5 text-left hover:border-indigo-500/60 hover:bg-indigo-950/30 transition-all"
          >
            <p className="text-lg font-bold">All Countries — Click Mode</p>
            <p className="text-sm text-zinc-400 mt-0.5">{ALL_COUNTRIES.length} countries — find each one on the map</p>
          </button>

          {/* By continent */}
          <div>
            <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-3">By Continent</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.keys(CONTINENT_META) as Continent[]).map((c) => {
                const { label, description, color } = CONTINENT_META[c];
                return (
                  <button
                    key={c}
                    onClick={() => startGame({ type: 'continent', value: c })}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 text-left hover:border-white/25 hover:bg-white/10 transition-all"
                  >
                    <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: color }} />
                    <p className="font-semibold">{label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
                    <p className="text-xs text-zinc-600 mt-1">{continentCounts[c]} countries</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* By letter */}
          <div>
            <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-3">Starting with Letter</p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_LETTERS.map((l) => (
                <button
                  key={l}
                  onClick={() => startGame({ type: 'letter', value: l })}
                  className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 font-bold hover:border-white/30 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-0"
                  title={`${letterCounts[l]} countries`}
                >
                  <span className="text-sm leading-none">{l}</span>
                  <span className="text-[8px] text-zinc-600 leading-none">{letterCounts[l]}</span>
                </button>
              ))}
            </div>
          </div>

          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  // ── Done ──
  if (phase === 'done') {
    const isType = mode === 'type';
    const total = isType ? TYPE_TOTAL : queue.length;
    const correct = isType ? typeFound.size : score;
    const pct = Math.round((correct / total) * 100);
    const missedList: string[] = isType
      ? [
          ...ALL_COUNTRIES.filter((c) => !typeFound.has(displayName(c.geo))).map((c) => displayName(c.geo)),
          ...TYPE_EXTRA.filter((e) => !typeFound.has(e.name)).map((e) => e.name),
        ]
      : queue.filter((n) => missed.has(n)).map((n) => displayName(n));
    const label = isType ? 'Type Mode' : filterLabel(filter);
    const message = pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!';
    return (
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col items-center text-center gap-2">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">{label}</p>
            <div className="text-7xl font-bold tracking-tight">{pct}%</div>
            <p className="text-xl font-semibold">{correct} / {total} correct</p>
            <p className="text-zinc-400">{message}</p>
          </div>
          {missedList.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-zinc-400 mb-3">Missed ({missedList.length})</p>
              <div className="flex flex-wrap gap-2">
                {missedList.map((n) => (
                  <span key={n} className="text-xs px-2 py-1 rounded bg-white/10 text-zinc-300">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={isType ? startTypeMode : () => startGame(filter)}
              className="px-5 py-2.5 rounded-lg border border-white/20 font-medium hover:border-white/40 transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={() => setPhase('select')}
              className="px-5 py-2.5 rounded-lg bg-white/10 font-medium hover:bg-white/15 transition-colors"
            >
              {isType ? 'Back' : 'Change Filter'}
            </button>
            <Link href="/" className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Game ──
  const isType = mode === 'type';
  const progress = isType
    ? (typeFound.size / ALL_COUNTRIES.length) * 100
    : (index / queue.length) * 100;
  const typeMinutes = Math.floor(timeLeft / 60);
  const typeSecs = timeLeft % 60;

  const zoomControls = (
    <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
      <button
        onClick={() => setPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 1.5, 12) }))}
        className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 text-zinc-300 font-bold text-base flex items-center justify-center transition-colors"
        title="Zoom in"
      >+</button>
      <button
        onClick={() => setPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }))}
        className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 text-zinc-300 font-bold text-base flex items-center justify-center transition-colors"
        title="Zoom out"
      >−</button>
      {(position.zoom > 1.1 ||
        Math.abs(position.coordinates[0] - homePosition[0]) > 2 ||
        Math.abs(position.coordinates[1] - homePosition[1]) > 2) && (
        <button
          onClick={() => setPosition({ coordinates: homePosition, zoom: 1 })}
          className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 text-zinc-300 text-sm flex items-center justify-center transition-colors"
          title="Reset zoom"
        >↺</button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-2">

      {isType ? (
        /* ── Type mode top bar ── */
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 flex-shrink-0">
          <input
            autoFocus
            type="text"
            value={typeInput}
            onChange={(e) => handleTypeInput(e.target.value)}
            placeholder="Type a country name…"
            className="flex-1 bg-transparent outline-none text-base placeholder:text-zinc-600"
          />
          <span className="text-sm text-zinc-400 whitespace-nowrap">{typeFound.size} / {TYPE_TOTAL}</span>
          <span className={`text-sm font-mono font-bold whitespace-nowrap ${timeLeft < 60 ? 'text-red-400' : 'text-zinc-300'}`}>
            {typeMinutes}:{typeSecs.toString().padStart(2, '0')}
          </span>
        </div>
      ) : (
        /* ── Click mode top bars ── */
        <>
          <div className="flex items-center justify-between text-sm text-zinc-400 flex-shrink-0">
            <span>{index + 1} / {queue.length}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-600">{filterLabel(filter)}</span>
              <span>{score} correct</span>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 flex-shrink-0">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest whitespace-nowrap">Find</p>
            {flagUrl(target) && (
              <Image
                src={flagUrl(target)!}
                alt={`Flag of ${displayName(target)}`}
                width={56}
                height={38}
                className="rounded shadow-sm object-cover flex-shrink-0"
              />
            )}
            <p className="text-xl font-bold flex-1">{displayName(target)}</p>
            <p className="text-sm font-medium w-36 text-right">
              {clickResult === 'correct' && <span className="text-green-400">✓ Correct!</span>}
              {clickResult === 'wrong' && <span className="text-red-400">✗ Missed</span>}
            </p>
          </div>
        </>
      )}

      {/* Map */}
      <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-white/10 bg-[#0a0918] relative">
        {zoomControls}
        {isType && notification && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-emerald-900/90 text-emerald-300 text-sm font-semibold px-4 py-2 rounded-lg border border-emerald-700/50 whitespace-nowrap pointer-events-none">
            ✓ {notification} — too small to show on map
          </div>
        )}
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={projectionConfig}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={({ coordinates, zoom }) => setPosition({ coordinates, zoom })}
            maxZoom={12}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name: string = geo.properties.name;
                  const fill = isType
                    ? (typeFoundGeos.has(name) ? '#22c55e' : '#0f0e20')
                    : getCountryFill(name, queueSet, found, missed, clickResult, target);
                  const isClickable =
                    !isType && queueSet.has(name) && clickResult === null && !found.has(name) && !missed.has(name);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={isType ? undefined : () => handleClick(name)}
                      fill={fill}
                      stroke="#07060f"
                      strokeWidth={0.4}
                      style={{
                        default: { outline: 'none' },
                        hover: {
                          outline: 'none',
                          fill: isClickable ? '#4338ca' : fill,
                          cursor: isClickable ? 'pointer' : 'default',
                        },
                        pressed: { outline: 'none' },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Footer */}
      {isType ? (
        <div className="flex justify-center flex-shrink-0">
          <button
            onClick={() => setPhase('done')}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Give up
          </button>
        </div>
      ) : (
        <div className="flex gap-4 text-xs text-zinc-500 justify-center flex-wrap flex-shrink-0">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#1e1b4b]" /> Active</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#22c55e]" /> Correct</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#7f1d1d]" /> Missed</div>
        </div>
      )}
    </div>
  );
}
