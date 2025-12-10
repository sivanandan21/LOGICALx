import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DailyTask, Difficulty, UserStats, XP_THRESHOLDS } from '../types';
import { Button } from './Button';
import {  Trophy, Target, Flame, Zap, Brain, Code, Lock } from 'lucide-react';

interface DashboardProps {
  stats: UserStats;
  tasks: DailyTask[];
  onStartTask: (task: DailyTask) => void;
  onPlayNow: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-surface border border-slate-700 p-4 rounded-xl flex items-center space-x-4">
    <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')} ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ stats, tasks, onStartTask, onPlayNow }) => {
  // Calculate Progress to next level
  const currentLevelXp = XP_THRESHOLDS[stats.level - 1] || 0;
  const nextLevelXp = XP_THRESHOLDS[stats.level] || 10000;
  const progressPercent = Math.min(100, Math.max(0, ((stats.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100));

  // Mock data for chart
  const chartData = [
    { day: 'M', xp: 20 },
    { day: 'T', xp: 45 },
    { day: 'W', xp: 30 },
    { day: 'T', xp: 80 },
    { day: 'F', xp: 55 },
    { day: 'S', xp: 90 },
    { day: 'S', xp: stats.xp > 0 ? stats.xp % 150 : 100 }, 
  ];

  return (
    <div className="space-y-8 pb-20 md:pb-0 animate-fade-in">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total XP" value={stats.xp} icon={<Zap size={24} />} color="text-yellow-400" />
        <StatCard title="Streak" value={`${stats.streak} Days`} icon={<Flame size={24} />} color="text-orange-500" />
        <StatCard title="Accuracy" value={`${stats.solvedCount > 0 ? Math.round((stats.correctCount / stats.solvedCount) * 100) : 0}%`} icon={<Target size={24} />} color="text-emerald-400" />
        <StatCard title="Badges" value={stats.badges.length} icon={<Trophy size={24} />} color="text-purple-400" />
      </div>

      {/* Level Progress */}
      <div className="bg-surface border border-slate-700 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Brain size={100} />
        </div>
        <div className="relative z-10">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <span className="text-slate-400 text-sm">Current Level</span>
                    <h2 className="text-3xl font-bold text-white">Level {stats.level}</h2>
                </div>
                <div className="text-right">
                    <span className="text-primary font-bold">{Math.floor(stats.xp)}</span>
                    <span className="text-slate-500"> / {nextLevelXp} XP</span>
                </div>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-1000 ease-out" 
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Tasks */}
        <div className="lg:col-span-2 bg-surface border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center">
                <Target className="mr-2 text-primary" /> Daily Achievements
            </h3>
            <div className="space-y-4">
                {tasks.map((task, index) => (
                    <div key={task.id} className="bg-background rounded-xl p-4 flex items-center justify-between border border-slate-800 hover:border-slate-600 transition-colors">
                        <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                                ${task.difficulty === Difficulty.Beginner ? 'bg-emerald-500/20 text-emerald-400' : 
                                  task.difficulty === Difficulty.Intermediate ? 'bg-blue-500/20 text-blue-400' : 
                                  'bg-rose-500/20 text-rose-400'}`}>
                                {task.completed ? <Trophy size={18} /> : <Code size={18} />}
                            </div>
                            <div>
                                <p className="font-semibold text-white">{task.difficulty} Challenge</p>
                                <p className="text-sm text-slate-400">Reward: {task.difficulty === Difficulty.Beginner ? 25 : task.difficulty === Difficulty.Intermediate ? 50 : 100} XP</p>
                            </div>
                        </div>
                        {task.completed ? (
                            <span className="text-emerald-400 font-bold text-sm px-4 py-1 bg-emerald-500/10 rounded-full">Completed</span>
                        ) : (
                            <Button size="sm" onClick={() => onStartTask(task)}>Start</Button>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Quick Play & Chart */}
        <div className="space-y-8">
            <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-2xl p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Weekly Challenge</h3>
                <p className="text-indigo-200 mb-6 text-sm">Compete for the top spot on the leaderboard.</p>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
                     <Lock className="mx-auto mb-2 text-indigo-200" size={24} />
                     <p className="text-xs text-indigo-100">Unlocks at Level 3</p>
                </div>
                <Button variant="secondary" fullWidth onClick={onPlayNow}>Quick Practice</Button>
            </div>

            <div className="bg-surface border border-slate-700 rounded-2xl p-6 h-64">
                <h4 className="text-sm text-slate-400 mb-4">XP History</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="day" stroke="#475569" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                            itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Area type="monotone" dataKey="xp" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};