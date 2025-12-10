import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { PuzzleGame } from './components/PuzzleGame';
import { Leaderboard } from './components/Leaderboard';
import { Pricing } from './components/Pricing';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Login } from './components/Login';
import { LayoutGrid, Award, User, Menu, X, LogOut, Crown } from 'lucide-react';
import { Difficulty, DailyTask, INITIAL_USER_STATE, UserStats, Puzzle, XP_THRESHOLDS } from './types';
import { generatePuzzle } from './services/geminiService';
import confetti from 'canvas-confetti';

// --- State Management Helpers ---
const loadState = (): UserStats => {
  try {
    const saved = localStorage.getItem('logicalX_user');
    return saved ? JSON.parse(saved) : INITIAL_USER_STATE;
  } catch {
    return INITIAL_USER_STATE;
  }
};

const saveState = (state: UserStats) => {
  localStorage.setItem('logicalX_user', JSON.stringify(state));
};

const getDailyTasks = (): DailyTask[] => {
  const today = new Date().toISOString().split('T')[0];
  const savedTasks = localStorage.getItem(`logicalX_tasks_${today}`);
  
  if (savedTasks) {
    return JSON.parse(savedTasks);
  }

  const newTasks: DailyTask[] = [
    { id: 'daily_beg', difficulty: Difficulty.Beginner, completed: false },
    { id: 'daily_int', difficulty: Difficulty.Intermediate, completed: false },
    { id: 'daily_exp', difficulty: Difficulty.Expert, completed: false },
  ];
  
  localStorage.setItem(`logicalX_tasks_${today}`, JSON.stringify(newTasks));
  return newTasks;
};

// --- Main App Component ---

const App: React.FC = () => {
  // Views: 'dashboard', 'game', 'leaderboard', 'profile', 'subscription'
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState<UserStats>(INITIAL_USER_STATE);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTaskID, setActiveTaskID] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    const loadedUser = loadState();
    const today = new Date().toISOString().split('T')[0];
    
    // Check streak
    if (loadedUser.lastLoginDate !== today) {
        if (loadedUser.lastLoginDate) {
             const lastDate = new Date(loadedUser.lastLoginDate);
             const diff = (new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
             if (diff > 2) loadedUser.streak = 0; // Reset if missed a day
        }
        loadedUser.lastLoginDate = today;
    }
    
    setUser(loadedUser);
    setTasks(getDailyTasks());

    // Check if user is logged in (has email)
    if (loadedUser.email) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    saveState(user);
  }, [user]);

  // Actions
  const handleLogin = () => {
    // Simulate getting data from Google Provider
    const updatedUser: UserStats = {
      ...user,
      name: 'Alex Developer',
      email: 'alex.dev@gmail.com',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', // Mock avatar
      lastLoginDate: new Date().toISOString().split('T')[0],
      subscriptionPlan: (user.subscriptionPlan || 'free') as 'free' | 'pro_monthly' | 'pro_yearly' // Ensure plan defaults to free if undefined
    };
    setUser(updatedUser);
    setIsAuthenticated(true);
    saveState(updatedUser);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Clear user identity but keep stats locally for now, or could fully reset
    const guestUser: UserStats = { ...user, email: '', name: 'Guest', avatarUrl: '', subscriptionPlan: 'free' };
    setUser(guestUser);
    saveState(guestUser);
    setCurrentView('dashboard');
  };

  const handleStartTask = async (task: DailyTask) => {
    // Check if user is allowed to access Expert/Intermediate levels based on plan if you wanted to restrict it
    // For now we follow the prompt "Free: Beginner questions only" strictly for game generation? 
    // The prompt implies "Free: Beginner questions only", so let's enforce it.
    
    if (user.subscriptionPlan === 'free' && task.difficulty !== Difficulty.Beginner) {
        alert("Upgrade to Pro to access Intermediate and Expert challenges!");
        setCurrentView('subscription');
        return;
    }

    setLoading(true);
    setActiveTaskID(task.id);
    try {
      const puzzle = await generatePuzzle(task.difficulty);
      setActivePuzzle(puzzle);
      setCurrentView('game');
    } catch (e) {
      alert("Failed to load puzzle. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayNow = async () => {
     setLoading(true);
     setActiveTaskID(null);
     try {
       // Adapt difficulty based on user level, but respect plan restrictions
       let diff = user.level > 5 ? Difficulty.Expert : user.level > 2 ? Difficulty.Intermediate : Difficulty.Beginner;
       
       if (user.subscriptionPlan === 'free') {
           diff = Difficulty.Beginner;
       }

       const puzzle = await generatePuzzle(diff);
       setActivePuzzle(puzzle);
       setCurrentView('game');
     } finally {
        setLoading(false);
     }
  };

  const handleSubscribe = (plan: 'free' | 'pro_monthly' | 'pro_yearly') => {
      setUser({ ...user, subscriptionPlan: plan });
      if (plan !== 'free') {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFA500', '#FFFFFF']
          });
      }
      // Optional: Redirect to dashboard after a delay or show success
      // For now we stay on pricing page to show the state change
  };

  const handlePuzzleComplete = (success: boolean) => {
    if (!activePuzzle) return;

    const newUser = { ...user };
    newUser.solvedCount++;

    if (success) {
      newUser.correctCount++;
      // XP Boost for Pro users
      const xpMultiplier = user.subscriptionPlan !== 'free' ? 1.5 : 1;
      newUser.xp += Math.round(activePuzzle.xpReward * xpMultiplier);
      
      // Check Level Up
      const nextLevelXp = XP_THRESHOLDS[newUser.level];
      if (newUser.xp >= nextLevelXp) {
        newUser.level++;
      }

      // Mark task complete if applicable
      if (activeTaskID) {
        const newTasks = tasks.map(t => 
            t.id === activeTaskID ? { ...t, completed: true } : t
        );
        setTasks(newTasks);
        localStorage.setItem(`logicalX_tasks_${new Date().toISOString().split('T')[0]}`, JSON.stringify(newTasks));
        
        // Update streak if all done
        if (newTasks.every(t => t.completed)) {
            newUser.streak++;
        }
      }
    }

    setUser(newUser);
    
    // Slight delay to show result before leaving
    setTimeout(() => {
      setActivePuzzle(null);
      setActiveTaskID(null);
      setCurrentView('dashboard');
    }, 2500);
  };

  // --- Layout Components ---

  const NavItem: React.FC<{ icon: React.ReactNode; label: string; view: string }> = ({ icon, label, view }) => (
    <button 
      onClick={() => {
        setCurrentView(view);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full transition-colors ${currentView === view ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );

  // If not authenticated, show Login screen
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-background text-slate-200 font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 p-6">
        <div className="flex items-center space-x-2 mb-10">
          <div className="w-8 h-8 bg-gradient-to-tr from-primary to-indigo-400 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white text-xl">X</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Logical X</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutGrid size={20} />} label="Dashboard" view="dashboard" />
          <NavItem icon={<Award size={20} />} label="Leaderboard" view="leaderboard" />
          <NavItem icon={<User size={20} />} label="Profile" view="profile" />
          <NavItem icon={<Crown size={20} className="text-yellow-400" />} label="Go Pro" view="subscription" />
        </nav>

        <div className="pt-6 border-t border-slate-800">
           <div className="flex items-center space-x-3 mb-4">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="User" className="w-10 h-10 rounded-full border border-slate-600" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                   {user.name?.[0] || 'G'}
                </div>
              )}
              <div className="overflow-hidden">
                 <div className="text-sm text-white font-medium truncate">{user.name}</div>
                 <div className="text-xs text-slate-500">{user.xp} XP</div>
                 {user.subscriptionPlan !== 'free' && (
                     <div className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider mt-0.5">Pro Member</div>
                 )}
              </div>
           </div>
           <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 text-slate-400 hover:text-white text-sm w-full transition-colors pl-1"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-background/80 backdrop-blur-md z-30 sticky top-0">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="font-bold text-white">X</span>
                </div>
                <span className="font-bold text-white">Logical X</span>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 bg-background z-20 pt-20 px-6 md:hidden">
                <nav className="space-y-4">
                    <NavItem icon={<LayoutGrid size={20} />} label="Dashboard" view="dashboard" />
                    <NavItem icon={<Award size={20} />} label="Leaderboard" view="leaderboard" />
                    <NavItem icon={<User size={20} />} label="Profile" view="profile" />
                    <NavItem icon={<Crown size={20} className="text-yellow-400" />} label="Go Pro" view="subscription" />
                </nav>
                <div className="mt-8 pt-8 border-t border-slate-800 flex items-center justify-between">
                     <div className="flex items-center space-x-3">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="User" className="w-10 h-10 rounded-full" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                                {user.name?.[0] || 'G'}
                            </div>
                        )}
                        <div>
                             <div className="text-sm text-white font-medium">{user.name}</div>
                             <button onClick={handleLogout} className="text-xs text-slate-400 flex items-center mt-1">
                                <LogOut size={12} className="mr-1"/> Sign Out
                             </button>
                        </div>
                     </div>
                </div>
            </div>
        )}

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10">
           <div className="max-w-5xl mx-auto h-full">
              {loading ? (
                  <LoadingSpinner />
              ) : (
                  <>
                    {currentView === 'dashboard' && (
                        <Dashboard 
                            stats={user} 
                            tasks={tasks} 
                            onStartTask={handleStartTask} 
                            onPlayNow={handlePlayNow}
                        />
                    )}
                    {currentView === 'game' && activePuzzle && (
                        <PuzzleGame 
                            puzzle={activePuzzle} 
                            onComplete={handlePuzzleComplete}
                            onExit={() => setCurrentView('dashboard')}
                        />
                    )}
                    {currentView === 'leaderboard' && <Leaderboard />}
                    {currentView === 'subscription' && (
                        <Pricing 
                            currentPlan={user.subscriptionPlan} 
                            onSubscribe={handleSubscribe} 
                        />
                    )}
                    {currentView === 'profile' && (
                        <div className="text-center p-10 animate-fade-in">
                            <div className="relative inline-block mb-6">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="User" className="w-24 h-24 rounded-full border-4 border-surface shadow-2xl" />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-3xl border-4 border-surface shadow-2xl">
                                        {user.name?.[0] || 'G'}
                                    </div>
                                )}
                                <div className="absolute bottom-0 right-0 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full border border-background">
                                    Lvl {user.level}
                                </div>
                            </div>
                            
                            <h2 className="text-3xl font-bold text-white">{user.name}</h2>
                            <p className="text-slate-500 mt-1">{user.email}</p>
                            
                            <div className="mt-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.subscriptionPlan === 'free' ? 'bg-slate-700 text-slate-300' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                    {user.subscriptionPlan === 'free' ? 'Free Plan' : user.subscriptionPlan === 'pro_monthly' ? 'Pro Monthly' : 'Pro Yearly'}
                                </span>
                            </div>
                            
                            <div className="mt-10 grid grid-cols-2 gap-4 max-w-md mx-auto">
                                <div className="p-6 bg-surface border border-slate-700 rounded-xl hover:border-slate-500 transition-colors">
                                    <div className="text-4xl font-bold text-primary mb-2">{user.solvedCount}</div>
                                    <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Puzzles Solved</div>
                                </div>
                                <div className="p-6 bg-surface border border-slate-700 rounded-xl hover:border-slate-500 transition-colors">
                                    <div className="text-4xl font-bold text-emerald-400 mb-2">{user.correctCount}</div>
                                    <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Correct Answers</div>
                                </div>
                            </div>
                        </div>
                    )}
                  </>
              )}
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;