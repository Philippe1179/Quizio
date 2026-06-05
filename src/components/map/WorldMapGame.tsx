'use client';

import { useState, useCallback } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import Link from 'next/link';
import { shuffleArray } from '@/lib/questions';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Exact geo.properties.name values from world-atlas / Natural Earth
const WORLD_COUNTRIES = new Set([
  // Americas
  'Canada', 'United States of America', 'Mexico', 'Cuba', 'Haiti', 'Jamaica',
  'Dominican Rep.', 'Guatemala', 'Honduras', 'Nicaragua', 'Costa Rica', 'Panama',
  'Colombia', 'Venezuela', 'Guyana', 'Suriname', 'Ecuador', 'Peru', 'Brazil',
  'Bolivia', 'Chile', 'Argentina', 'Uruguay', 'Paraguay',
  // Europe
  'Iceland', 'United Kingdom', 'Ireland', 'Norway', 'Sweden', 'Finland', 'Denmark',
  'Netherlands', 'Belgium', 'France', 'Spain', 'Portugal', 'Germany', 'Switzerland',
  'Austria', 'Italy', 'Greece', 'Poland', 'Czechia', 'Slovakia', 'Hungary',
  'Romania', 'Bulgaria', 'Serbia', 'Croatia', 'Bosnia and Herz.', 'Albania',
  'N. Macedonia', 'Slovenia', 'Ukraine', 'Belarus', 'Lithuania', 'Latvia',
  'Estonia', 'Russia', 'Turkey', 'Cyprus',
  // Africa
  'Morocco', 'Algeria', 'Tunisia', 'Libya', 'Egypt', 'Mauritania', 'Mali',
  'Niger', 'Chad', 'Sudan', 'Ethiopia', 'Somalia', 'Senegal', 'Guinea',
  'Sierra Leone', 'Liberia', "Côte d'Ivoire", 'Ghana', 'Nigeria', 'Cameroon',
  'Gabon', 'Dem. Rep. Congo', 'Congo', 'Angola', 'Zambia', 'Zimbabwe',
  'Mozambique', 'Namibia', 'Botswana', 'South Africa', 'Madagascar', 'Kenya',
  'Tanzania', 'Uganda', 'Rwanda', 'S. Sudan', 'Eritrea',
  // Asia
  'Saudi Arabia', 'Yemen', 'Oman', 'United Arab Emirates', 'Qatar', 'Kuwait',
  'Iraq', 'Iran', 'Syria', 'Lebanon', 'Jordan', 'Israel', 'Afghanistan',
  'Pakistan', 'India', 'Nepal', 'Bangladesh', 'Myanmar', 'Thailand', 'Vietnam',
  'Cambodia', 'Laos', 'Malaysia', 'Indonesia', 'Philippines', 'China',
  'Mongolia', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan',
  'Tajikistan', 'Japan', 'South Korea', 'North Korea', 'Sri Lanka',
  // Oceania
  'Australia', 'New Zealand', 'Papua New Guinea',
]);

// Friendly display names for geo names that look abbreviated or unfamiliar
const DISPLAY_NAMES: Record<string, string> = {
  'United States of America': 'United States',
  'Dominican Rep.': 'Dominican Republic',
  'Bosnia and Herz.': 'Bosnia and Herzegovina',
  'N. Macedonia': 'North Macedonia',
  'Czechia': 'Czech Republic',
  "Côte d'Ivoire": 'Ivory Coast',
  'Dem. Rep. Congo': 'DR Congo',
  'Congo': 'Republic of Congo',
  'S. Sudan': 'South Sudan',
  'United Arab Emirates': 'UAE',
};

function displayName(geoName: string) {
  return DISPLAY_NAMES[geoName] ?? geoName;
}

function getCountryFill(
  geoName: string,
  found: Set<string>,
  missed: Set<string>,
  clickResult: 'correct' | 'wrong' | null,
  target: string,
): string {
  if (found.has(geoName)) return '#22c55e';
  if (clickResult === 'wrong' && geoName === target) return '#ef4444';
  if (missed.has(geoName)) return '#7f1d1d';
  if (!WORLD_COUNTRIES.has(geoName)) return '#16153a';
  return '#1e1b4b';
}

export default function WorldMapGame() {
  const [queue, setQueue] = useState<string[]>(() => shuffleArray([...WORLD_COUNTRIES]));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [clickResult, setClickResult] = useState<'correct' | 'wrong' | null>(null);
  const [done, setDone] = useState(false);

  const target = queue[index] ?? '';

  const advance = useCallback(() => {
    if (index + 1 >= queue.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setClickResult(null);
    }
  }, [index, queue.length]);

  const handleClick = useCallback(
    (geoName: string) => {
      if (clickResult !== null || !WORLD_COUNTRIES.has(geoName)) return;
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
    [clickResult, found, missed, target, advance],
  );

  const restart = useCallback(() => {
    setQueue(shuffleArray([...WORLD_COUNTRIES]));
    setIndex(0);
    setScore(0);
    setFound(new Set());
    setMissed(new Set());
    setClickResult(null);
    setDone(false);
  }, []);

  if (done) {
    const total = queue.length;
    const pct = Math.round((score / total) * 100);
    const missedList = queue.filter((n) => missed.has(n));
    const message = pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!';
    return (
      <div className="flex flex-col gap-6 py-4">
        <div className="flex flex-col items-center text-center gap-2">
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
            onClick={restart}
            className="px-5 py-2.5 rounded-lg border border-white/20 font-medium hover:border-white/40 transition-colors"
          >
            Play Again
          </button>
          <Link href="/" className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors">
            Home
          </Link>
        </div>
      </div>
    );
  }

  const progress = (index / queue.length) * 100;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>{index + 1} / {queue.length}</span>
        <span>{score} correct</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Prompt */}
      <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-center">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Find the country</p>
        <p className="text-2xl font-bold">{displayName(target)}</p>
        <p className="h-5 mt-2 text-sm font-medium">
          {clickResult === 'correct' && <span className="text-green-400">✓ Correct!</span>}
          {clickResult === 'wrong' && <span className="text-red-400">✗ Wrong — highlighted in red</span>}
        </p>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0f0e1a]">
        <ComposableMap
          projection="geoNaturalEarth1"
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name: string = geo.properties.name;
                const fill = getCountryFill(name, found, missed, clickResult, target);
                const isClickable =
                  WORLD_COUNTRIES.has(name) &&
                  clickResult === null &&
                  !found.has(name) &&
                  !missed.has(name);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleClick(name)}
                    fill={fill}
                    stroke="#0a0918"
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
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-zinc-500 justify-center flex-wrap">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#1e1b4b]" /> In game</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#22c55e]" /> Correct</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#7f1d1d]" /> Missed</div>
      </div>
    </div>
  );
}
