import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Task } from '../types';
import { Activity } from 'lucide-react';

interface StatsViewProps {
  tasks: Task[];
}

export const StatsView: React.FC<StatsViewProps> = ({ tasks }) => {
  const completed = tasks.filter(t => t.isCompleted).length;
  const pending = tasks.length - completed;

  const data = [
    { name: 'COMPLETE', value: completed },
    { name: 'PENDING', value: pending },
  ];

  const COLORS = ['#06b6d4', '#334155']; // Cyan, Slate-700

  if (tasks.length === 0) {
    return (
      <div className="holo-card flex flex-col items-center justify-center h-64 text-slate-500 font-tech">
        <p>NO DATA AVAILABLE</p>
      </div>
    );
  }

  return (
    <div className="holo-card p-6 flex flex-col items-center">
      <div className="w-full flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
         <Activity size={20} className="text-cyan-400" />
         <h3 className="text-lg font-tech font-bold text-cyan-100 tracking-wider">MISSION ANALYTICS</h3>
      </div>
      
      <div className="w-full h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="square"/>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
            <div className="text-3xl font-tech font-bold text-white">{Math.round((completed / tasks.length) * 100) || 0}%</div>
            <div className="text-[10px] text-cyan-400 tracking-widest">EFFICIENCY</div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 w-full">
        <div className="bg-cyan-950/30 border border-cyan-900 p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-1">
             <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_cyan]"></div>
          </div>
          <p className="text-3xl font-bold font-mono text-cyan-400">{completed}</p>
          <p className="text-[10px] text-cyan-600 uppercase font-bold tracking-widest mt-1">MISSIONS COMPLETE</p>
        </div>
        <div className="bg-slate-800/30 border border-slate-700 p-4 relative">
          <p className="text-3xl font-bold font-mono text-slate-400">{pending}</p>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">PENDING ACTION</p>
        </div>
      </div>
    </div>
  );
};