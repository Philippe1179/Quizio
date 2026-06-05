'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import Link from 'next/link';
import { shuffleArray } from '@/lib/questions';

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
  { geo: 'Bulgaria',                  continent: 'europe' },
  { geo: 'Serbia',                    continent: 'europe' },
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
  { geo: 'Ethiopia',                  continent: 'africa' },
  { geo: 'Somalia',                   continent: 'africa' },
  { geo: 'Senegal',                   continent: 'africa' },
  { geo: 'Guinea',                    continent: 'africa' },
  { geo: 'Sierra Leone',              continent: 'africa' },
  { geo: 'Liberia',                   continent: 'africa' },
  { geo: "Côte d'Ivoire",            continent: 'africa' },
  { geo: 'Ghana',                     continent: 'africa' },
  { geo: 'Nigeria',                   continent: 'africa' },
  { geo: 'Cameroon',                  continent: 'africa' },
  { geo: 'Gabon',                     continent: 'africa' },
  { geo: 'Dem. Rep. Congo',           continent: 'africa' },
  { geo: 'Congo',                     continent: 'africa' },
  { geo: 'Angola',                    continent: 'africa' },
  { geo: 'Zambia',                    continent: 'africa' },
  { geo: 'Zimbabwe',                  continent: 'africa' },
  { geo: 'Mozambique',                continent: 'africa' },
  { geo: 'Namibia',                   continent: 'africa' },
  { geo: 'Botswana',                  continent: 'africa' },
  { geo: 'South Africa',              continent: 'africa' },
  { geo: 'Madagascar',                continent: 'africa' },
  { geo: 'Kenya',                     continent: 'africa' },
  { geo: 'Tanzania',                  continent: 'africa' },
  { geo: 'Uganda',                    continent: 'africa' },
  { geo: 'Rwanda',                    continent: 'africa' },
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
  { geo: 'Bangladesh',                continent: 'asia' },
  { geo: 'Myanmar',                   continent: 'asia' },
  { geo: 'Thailand',                  continent: 'asia' },
  { geo: 'Vietnam',                   continent: 'asia' },
  { geo: 'Cambodia',                  continent: 'asia' },
  { geo: 'Laos',                      continent: 'asia' },
  { geo: 'Malaysia',                  continent: 'asia' },
  { geo: 'Indonesia',                 continent: 'asia' },
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
};

function displayName(geo: string) {
  return DISPLAY_NAMES[geo] ?? geo;
}

// ISO 3166-1 alpha-2 codes keyed by geo name
const ISO_CODES: Record<string, string> = {
  // Americas
  'Canada': 'ca', 'United States of America': 'us', 'Mexico': 'mx',
  'Cuba': 'cu', 'Haiti': 'ht', 'Jamaica': 'jm', 'Dominican Rep.': 'do',
  'Guatemala': 'gt', 'Honduras': 'hn', 'Nicaragua': 'ni', 'Costa Rica': 'cr',
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
  'Croatia': 'hr', 'Bosnia and Herz.': 'ba', 'Albania': 'al',
  'N. Macedonia': 'mk', 'Slovenia': 'si', 'Ukraine': 'ua', 'Belarus': 'by',
  'Lithuania': 'lt', 'Latvia': 'lv', 'Estonia': 'ee', 'Russia': 'ru',
  'Turkey': 'tr', 'Cyprus': 'cy',
  // Africa
  'Morocco': 'ma', 'Algeria': 'dz', 'Tunisia': 'tn', 'Libya': 'ly',
  'Egypt': 'eg', 'Mauritania': 'mr', 'Mali': 'ml', 'Niger': 'ne',
  'Chad': 'td', 'Sudan': 'sd', 'Ethiopia': 'et', 'Somalia': 'so',
  'Senegal': 'sn', 'Guinea': 'gn', 'Sierra Leone': 'sl', 'Liberia': 'lr',
  "Côte d'Ivoire": 'ci', 'Ghana': 'gh', 'Nigeria': 'ng', 'Cameroon': 'cm',
  'Gabon': 'ga', 'Dem. Rep. Congo': 'cd', 'Congo': 'cg', 'Angola': 'ao',
  'Zambia': 'zm', 'Zimbabwe': 'zw', 'Mozambique': 'mz', 'Namibia': 'na',
  'Botswana': 'bw', 'South Africa': 'za', 'Madagascar': 'mg', 'Kenya': 'ke',
  'Tanzania': 'tz', 'Uganda': 'ug', 'Rwanda': 'rw', 'S. Sudan': 'ss',
  'Eritrea': 'er',
  // Asia
  'Saudi Arabia': 'sa', 'Yemen': 'ye', 'Oman': 'om',
  'United Arab Emirates': 'ae', 'Qatar': 'qa', 'Kuwait': 'kw', 'Iraq': 'iq',
  'Iran': 'ir', 'Syria': 'sy', 'Lebanon': 'lb', 'Jordan': 'jo',
  'Israel': 'il', 'Afghanistan': 'af', 'Pakistan': 'pk', 'India': 'in',
  'Nepal': 'np', 'Bangladesh': 'bd', 'Myanmar': 'mm', 'Thailand': 'th',
  'Vietnam': 'vn', 'Cambodia': 'kh', 'Laos': 'la', 'Malaysia': 'my',
  'Indonesia': 'id', 'Philippines': 'ph', 'China': 'cn', 'Mongolia': 'mn',
  'Kazakhstan': 'kz', 'Uzbekistan': 'uz', 'Turkmenistan': 'tm',
  'Kyrgyzstan': 'kg', 'Tajikistan': 'tj', 'Japan': 'jp',
  'South Korea': 'kr', 'North Korea': 'kp', 'Sri Lanka': 'lk',
  // Oceania
  'Australia': 'au', 'New Zealand': 'nz', 'Papua New Guinea': 'pg',
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

export default function WorldMapGame() {
  const [phase, setPhase] = useState<Phase>('select');
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

  const queueSet = useMemo(() => new Set(queue), [queue]);

  const projectionConfig = useMemo<ProjectionConfig>(() => {
    if (filter.type === 'continent') return CONTINENT_PROJECTIONS[filter.value];
    return WORLD_PROJECTION;
  }, [filter]);
  const target = queue[index] ?? '';

  const startGame = useCallback((f: Filter) => {
    const q = filterToQueue(f);
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

          {/* All */}
          <button
            onClick={() => startGame({ type: 'all' })}
            className="w-full rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-5 text-left hover:border-indigo-500/60 hover:bg-indigo-950/30 transition-all"
          >
            <p className="text-lg font-bold">All Countries</p>
            <p className="text-sm text-zinc-400 mt-0.5">{ALL_COUNTRIES.length} countries — the full challenge</p>
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
    const total = queue.length;
    const pct = Math.round((score / total) * 100);
    const missedList = queue.filter((n) => missed.has(n));
    const message = pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!';
    return (
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col items-center text-center gap-2">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">{filterLabel(filter)}</p>
            <div className="text-7xl font-bold tracking-tight">{pct}%</div>
            <p className="text-xl font-semibold">{score} / {total} correct</p>
            <p className="text-zinc-400">{message}</p>
          </div>
          {missedList.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-zinc-400 mb-3">Missed ({missedList.length})</p>
              <div className="flex flex-wrap gap-2">
                {missedList.map((n) => (
                  <span key={n} className="text-xs px-2 py-1 rounded bg-white/10 text-zinc-300">
                    {displayName(n)}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => startGame(filter)}
              className="px-5 py-2.5 rounded-lg border border-white/20 font-medium hover:border-white/40 transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={() => setPhase('select')}
              className="px-5 py-2.5 rounded-lg bg-white/10 font-medium hover:bg-white/15 transition-colors"
            >
              Change Filter
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
  const progress = (index / queue.length) * 100;

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-2">
      {/* Header */}
      <div className="flex items-center justify-between text-sm text-zinc-400 flex-shrink-0">
        <span>{index + 1} / {queue.length}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-600">{filterLabel(filter)}</span>
          <span>{score} correct</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
        <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Compact prompt */}
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

      {/* Map */}
      <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-white/10 bg-[#0a0918] relative">
        {/* Zoom controls */}
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
          {position.zoom > 1.1 && (
            <button
              onClick={() => setPosition({ coordinates: homePosition, zoom: 1 })}
              className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 text-zinc-300 text-sm flex items-center justify-center transition-colors"
              title="Reset zoom"
            >↺</button>
          )}
        </div>
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
                  const fill = getCountryFill(name, queueSet, found, missed, clickResult, target);
                  const isClickable =
                    queueSet.has(name) && clickResult === null && !found.has(name) && !missed.has(name);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleClick(name)}
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

      {/* Legend */}
      <div className="flex gap-4 text-xs text-zinc-500 justify-center flex-wrap flex-shrink-0">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#1e1b4b]" /> Active</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#22c55e]" /> Correct</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#7f1d1d]" /> Missed</div>
      </div>
    </div>
  );
}
