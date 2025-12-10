import React from 'react';
import { Trophy, Medal, User } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const users = [
    { rank: 1, name: "AlgorithmAce", xp: 12450, badge: '👑' },
    { rank: 2, name: "BinaryBaron", xp: 11200, badge: '🥈' },
    { rank: 3, name: "LogicLoop", xp: 10850, badge: '🥉' },
    { rank: 4, name: "SyntaxSorcerer", xp: 9500, badge: '' },
    { rank: 5, name: "NullPointer", xp: 8200, badge: '' },
    { rank: 6, name: "GitMaster", xp: 7600, badge: '' },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Weekly Leaderboard</h2>
        <p className="text-slate-400">Top logicians this week. Resets in 2 days.</p>
      </div>

      <div className="bg-surface border border-slate-700 rounded-2xl overflow-hidden">
        {users.map((user) => (
          <div 
            key={user.rank} 
            className={`
              flex items-center justify-between p-4 border-b border-slate-800 last:border-0 hover:bg-white/5 transition-colors
              ${user.rank === 1 ? 'bg-yellow-500/10' : ''}
              ${user.rank === 2 ? 'bg-slate-400/10' : ''}
              ${user.rank === 3 ? 'bg-orange-700/10' : ''}
            `}
          >
            <div className="flex items-center space-x-4">
              <div className={`
                w-8 h-8 flex items-center justify-center font-bold rounded-full
                ${user.rank <= 3 ? 'text-white' : 'text-slate-500'}
                ${user.rank === 1 ? 'bg-yellow-500' : ''}
                ${user.rank === 2 ? 'bg-slate-500' : ''}
                ${user.rank === 3 ? 'bg-orange-700' : ''}
              `}>
                {user.rank <= 3 ? <Trophy size={14} /> : user.rank}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-slate-300">
                    <User size={16} />
                </div>
                <div>
                    <h3 className="font-semibold text-white">{user.name}</h3>
                    <p className="text-xs text-slate-500">Level {Math.floor(user.xp / 500)}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-primary">{user.xp.toLocaleString()} XP</div>
              {user.badge && <div className="text-sm">{user.badge}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};