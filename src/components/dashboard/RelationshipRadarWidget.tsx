import React, { useState } from 'react';
import { ShieldCheck, Heart, Sparkles, Sliders, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Dimension {
  key: string;
  name: string;
  score: number; // 0 to 100
  color: string;
  desc: string;
}

const INITIAL_DIMENSIONS: Dimension[] = [
  { key: 'comm', name: 'Open Heart Communication', score: 96, color: '#ec4899', desc: 'No secret left unsaid' },
  { key: 'romance', name: 'Romance & Chemistry Spark', score: 98, color: '#f43f5e', desc: 'Butterflies & lingering hugs' },
  { key: 'quality', name: 'Intimate Quality Time', score: 92, color: '#8b5cf6', desc: 'Present with full attention' },
  { key: 'play', name: 'Laughter, Goofiness & Play', score: 95, color: '#eab308', desc: 'Inside jokes & belly laughs' },
  { key: 'dreams', name: 'Future Dream Alignment', score: 97, color: '#06b6d4', desc: 'Walking one shared path' },
];

export const RelationshipRadarWidget: React.FC = () => {
  const [dimensions, setDimensions] = useState<Dimension[]>(() => {
    try {
      const saved = localStorage.getItem('shoona_relationship_radar');
      return saved ? JSON.parse(saved) : INITIAL_DIMENSIONS;
    } catch {
      return INITIAL_DIMENSIONS;
    }
  });

  const [isEditing, setIsEditing] = useState(false);

  // Overall harmony average
  const averageHarmony = Math.round(
    dimensions.reduce((acc, curr) => acc + curr.score, 0) / dimensions.length
  );

  const handleScoreChange = (index: number, newScore: number) => {
    const updated = [...dimensions];
    updated[index].score = newScore;
    setDimensions(updated);
    try {
      localStorage.setItem('shoona_relationship_radar', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSaveSync = () => {
    setIsEditing(false);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#ec4899', '#8b5cf6', '#06b6d4'],
    });
  };

  // SVG Radar generation (Pentagon)
  const size = 200;
  const center = size / 2;
  const radius = 70;
  const numPoints = dimensions.length;

  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = (Math.PI * 2 / numPoints) * index - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate web rings
  const ringLevels = [0.33, 0.66, 1.0];
  const ringPolygons = ringLevels.map((level) => {
    return Array.from({ length: numPoints })
      .map((_, i) => {
        const { x, y } = getCoordinates(i, level);
        return `${x},${y}`;
      })
      .join(' ');
  });

  // User's polygon points
  const userPolygonPoints = dimensions
    .map((dim, i) => {
      const { x, y } = getCoordinates(i, dim.score / 100);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-rose-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 flex items-center justify-center font-bold">
            <Heart className="w-4 h-4 fill-rose-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>Relationship Health & Harmony Radar</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900/40">
                {averageHarmony}% Harmony
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              5-dimensional intimacy pulse check & emotional alignment map
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => (isEditing ? handleSaveSync() : setIsEditing(true))}
          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
        >
          {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Sliders className="w-3.5 h-3.5 text-rose-500" />}
          <span>{isEditing ? 'Save Pulse' : 'Sync Scores'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* SVG Radar Chart Display */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
              {/* Background rings */}
              {ringPolygons.map((pts, idx) => (
                <polygon
                  key={idx}
                  points={pts}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-slate-200 dark:text-slate-700/60"
                />
              ))}

              {/* Spoke lines */}
              {Array.from({ length: numPoints }).map((_, i) => {
                const { x, y } = getCoordinates(i, 1.0);
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-slate-200 dark:text-slate-700/60"
                  />
                );
              })}

              {/* Filled Relationship Shape */}
              <polygon
                points={userPolygonPoints}
                fill="rgba(244, 63, 94, 0.25)"
                stroke="#f43f5e"
                strokeWidth="2.5"
                className="transition-all duration-500"
              />

              {/* Data points */}
              {dimensions.map((dim, i) => {
                const { x, y } = getCoordinates(i, dim.score / 100);
                return (
                  <circle
                    key={dim.key}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={dim.color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-rose-500 font-display">{averageHarmony}%</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Synched</span>
            </div>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="md:col-span-7 space-y-2">
          {dimensions.map((dim, idx) => (
            <div
              key={dim.key}
              className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dim.color }} />
                  {dim.name}
                </span>
                <span className="font-black text-rose-600 dark:text-rose-400">{dim.score}%</span>
              </div>

              {isEditing ? (
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={dim.score}
                  onChange={(e) => handleScoreChange(idx, parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg accent-rose-500 cursor-pointer"
                />
              ) : (
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${dim.score}%`, backgroundColor: dim.color }}
                  />
                </div>
              )}
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">{dim.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
