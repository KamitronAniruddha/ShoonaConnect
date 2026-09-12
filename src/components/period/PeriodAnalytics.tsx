import React, { useState } from 'react';
import { CycleData, BaselineStats } from '../../types/period';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';

interface Props {
  cycles: CycleData[];
  baselineStats: BaselineStats;
}

export const PeriodAnalytics: React.FC<Props> = ({ cycles, baselineStats }) => {
  const [timeRange, setTimeRange] = useState<'6m' | '12m' | 'all'>('6m');

  const completedCycles = cycles.filter(c => c.cycleLength !== null).reverse();
  
  let chartData = completedCycles.map(c => ({
    name: format(parseISO(c.startDate), 'MMM yy'),
    length: c.cycleLength,
    period: c.periodLength || 0,
    cycleId: c.id
  }));

  if (timeRange === '6m') chartData = chartData.slice(-6);
  else if (timeRange === '12m') chartData = chartData.slice(-12);

  if (cycles.length < 2) {
    return (
      <div className="py-20 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Not enough data</h3>
        <p className="text-slate-400">Log at least 2 completed cycles to unlock beautiful charts and analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Controls */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-2xl">
         <div className="flex gap-1">
            {(['6m', '12m', 'all'] as const).map(tr => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer capitalize ${
                  timeRange === tr ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tr}
              </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cycle Length Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">Cycle Length Trend</h3>
            <p className="text-sm text-slate-400">Historical variation in cycle duration</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCycle" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#f43f5e' }}
                  cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="length" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorCycle)" activeDot={{ r: 6, fill: '#f43f5e' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Period Duration Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">Bleeding Duration</h3>
            <p className="text-sm text-slate-400">Number of days per period</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                  cursor={{ fill: '#1e293b', opacity: 0.4 }}
                />
                <Bar dataKey="period" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
