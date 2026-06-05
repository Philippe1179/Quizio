'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import Link from 'next/link';
import { shuffleArray } from '@/lib/questions';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
  'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
  'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];

type Mode = 'click' | 'name';

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export default function USAMapGame() {
  const [phase, setPhase] = useState<'select' | 'game' | 'done'>('select');
  const [mode, setMode] = useState<Mode>('click');
  const [queue, setQueue] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  // click mode
  const [clickedState, setClickedState] = useState<string | null>(null);
  const [clickResult, setClickResult] = useState<'correct' | 'wrong' | null>(null);

  // name mode
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [nameResult, setNameResult] = useState<'correct' | 'wrong' | null>(null);

  const [answered, setAnswered] = useState<Set<string>>(new Set());

  const inputRef = useRef<HTMLInputElement>(null);
  const target = queue[index] ?? '';

  useEffect(() => {
    if (phase === 'game' && mode === 'name' && !submitted) {
      inputRef.current?.focus();
    }
  }, [phase, mode, submitted, index]);

  const startGame = (selectedMode: Mode) => {
    setMode(selectedMode);
    setQueue(shuffleArray(US_STATES));
    setIndex(0);
    setScore(0);
    setClickedState(null);
    setClickResult(null);
    setInput('');
    setSubmitted(false);
    setNameResult(null);
    setAnswered(new Set());
    setPhase('game');
  };

  const advance = useCallback(() => {
    if (index + 1 >= queue.length) {
      setPhase('done');
    } else {
      setIndex((i) => i + 1);
      setClickedState(null);
      setClickResult(null);
      setInput('');
      setSubmitted(false);
      setNameResult(null);
    }
  }, [index, queue.length]);

  const handleClickState = useCallback(
    (stateName: string) => {
      if (clickResult !== null || answered.has(stateName)) return;
      const isCorrect = stateName === target;
      setClickedState(stateName);
      setClickResult(isCorrect ? 'correct' : 'wrong');
      if (isCorrect) {
        setScore((s) => s + 1);
        setAnswered((prev) => new Set([...prev, stateName]));
      }
      setTimeout(advance, 1500);
    },
    [clickResult, answered, target, advance]
  );

  const handleSubmit = useCallback(() => {
    if (submitted || !input.trim()) return;
    const isCorrect = normalize(input) === normalize(target);
    setNameResult(isCorrect ? 'correct' : 'wrong');
    setSubmitted(true);
    if (isCorrect) {
      setScore((s) => s + 1);
      setAnswered((prev) => new Set([...prev, target]));
    }
  }, [submitted, input, target]);

  const getStateFill = useCallback(
    (stateName: string): string => {
      if (answered.has(stateName)) return '#22c55e';
      if (mode === 'click') {
        if (clickResult === null) return '#1e1b4b';
        if (stateName === target) return '#22c55e';
        if (stateName === clickedState && clickResult === 'wrong') return '#ef4444';
        return '#1e1b4b';
      } else {
        if (stateName !== target) return '#1e1b4b';
        if (!submitted) return '#6366f1';
        return nameResult === 'correct' ? '#22c55e' : '#ef4444';
      }
    },
    [answered, mode, clickResult, target, clickedState, submitted, nameResult]
  );

  // ── Mode select ──
  if (phase === 'select') {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-zinc-400">Choose how you want to play:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => startGame('click')}
            className="group rounded-xl border border-white/10 bg-white/5 p-6 text-left hover:border-indigo-500/40 hover:bg-indigo-950/20 transition-all"
          >
            <p className="text-lg font-bold mb-2">Find the State</p>
            <p className="text-sm text-zinc-400">
              A state name is shown — click the correct state on the map.
            </p>
          </button>
          <button
            onClick={() => startGame('name')}
            className="group rounded-xl border border-white/10 bg-white/5 p-6 text-left hover:border-indigo-500/40 hover:bg-indigo-950/20 transition-all"
          >
            <p className="text-lg font-bold mb-2">Name the State</p>
            <p className="text-sm text-zinc-400">
              A state is highlighted on the map — type its name.
            </p>
          </button>
        </div>
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Back to home
        </Link>
      </div>
    );
  }

  // ── Results ──
  if (phase === 'done') {
    const pct = Math.round((score / queue.length) * 100);
    const message = pct >= 80 ? 'Great work!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!';
    return (
      <div className="flex flex-col items-center text-center gap-4 py-8">
        <div className="text-7xl font-bold tracking-tight">{pct}%</div>
        <p className="text-xl font-semibold">{score} / {queue.length} correct</p>
        <p className="text-zinc-400">{message}</p>
        <div className="flex gap-3 mt-6 flex-wrap justify-center">
          <button
            onClick={() => startGame(mode)}
            className="px-5 py-2.5 rounded-lg border border-white/20 font-medium hover:border-white/40 transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={() => setPhase('select')}
            className="px-5 py-2.5 rounded-lg bg-white/10 font-medium hover:bg-white/15 transition-colors"
          >
            Change Mode
          </button>
          <Link href="/" className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors">
            Home
          </Link>
        </div>
      </div>
    );
  }

  // ── Game ──
  const progress = (index / queue.length) * 100;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>{index + 1} / {queue.length}</span>
        <span>{score} correct</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Prompt */}
      {mode === 'click' ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Find the state</p>
          <p className="text-2xl font-bold">{target}</p>
          {clickResult === 'wrong' && clickedState && (
            <p className="text-sm text-red-400 mt-2">
              You clicked <span className="font-semibold">{clickedState}</span> — highlighting the correct state
            </p>
          )}
          {clickResult === 'correct' && (
            <p className="text-sm text-green-400 mt-2">✓ Correct!</p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 px-6 py-4 text-center">
          <p className="text-xs text-indigo-400 uppercase tracking-widest mb-1">Name the highlighted state</p>
          <p className="text-sm text-zinc-400">The indigo state on the map — what is it called?</p>
        </div>
      )}

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-white/10 bg-[#12102a]">
        <ComposableMap
          projection="geoAlbersUsa"
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name: string = geo.properties.name;
                const fill = getStateFill(name);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => mode === 'click' && handleClickState(name)}
                    fill={fill}
                    stroke="#0f0f1a"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: {
                        outline: 'none',
                        fill: mode === 'click' && clickResult === null && !answered.has(name) ? '#4338ca' : fill,
                        cursor: mode === 'click' && !answered.has(name) ? 'pointer' : 'default',
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

      {/* Name mode input */}
      {mode === 'name' && (
        <div className="flex flex-col gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => !submitted && setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitted ? advance() : handleSubmit();
            }}
            disabled={submitted}
            placeholder="Type the state name..."
            className={`w-full rounded-xl px-5 py-4 text-lg font-medium bg-white/5 border outline-none transition-all ${
              !submitted
                ? 'border-white/10 focus:border-indigo-500/60 placeholder:text-zinc-600'
                : nameResult === 'correct'
                ? 'border-green-500/60 bg-green-950/20 text-green-300'
                : 'border-red-500/60 bg-red-950/20 text-red-300'
            }`}
          />
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Submit
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              {nameResult === 'correct' ? (
                <p className="text-center text-green-400 font-medium">✓ Correct!</p>
              ) : (
                <p className="text-center text-red-400">
                  ✗ The answer was <span className="font-semibold text-zinc-200">{target}</span>
                </p>
              )}
              <button
                onClick={advance}
                className="w-full py-3 rounded-xl border border-white/20 font-medium hover:border-white/40 transition-colors"
              >
                {index + 1 >= queue.length ? 'See Results' : 'Next →'}
              </button>
              <p className="text-xs text-center text-zinc-600">or press Enter</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
