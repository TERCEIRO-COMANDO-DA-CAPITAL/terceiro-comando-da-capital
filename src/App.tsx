import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Key, 
  Users, 
  Settings, 
  Plus, 
  Trash2, 
  Search, 
  Menu, 
  X,
  ShieldCheck,
  Gamepad2,
  FileCode,
  Calendar,
  Copy,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  LogOut,
  LogIn
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster, toast } from "react-hot-toast";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type View = "dashboard" | "keys" | "users" | "settings";

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface ScriptKey {
  id: string;
  key: string;
  userName: string;
  game: string;
  scriptName: string;
  expiresAt: string;
  createdAt: string;
  status: "active" | "expired";
}

interface Stats {
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
  uniqueUsers: number;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [keys, setKeys] = useState<ScriptKey[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalKeys: 0,
    activeKeys: 0,
    expiredKeys: 0,
    uniqueUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data);
    } catch (err) {
      setUser(null);
    }
  };

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/keys");
      const data = await res.json();
      if (Array.isArray(data)) {
        setKeys(data);
      } else {
        setKeys([]);
        if (data.error) toast.error(data.error);
      }
    } catch (err) {
      toast.error("Erro ao carregar chaves");
      setKeys([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data && !data.error) {
        setStats(data);
      }
    } catch (err) {
      toast.error("Erro ao carregar estatísticas");
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchUser();
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (user) {
      fetchKeys();
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchUser();
        toast.success("Login realizado com sucesso!");
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/url");
      const { url } = await res.json();
      window.open(url, "discord_login", "width=500,height=600");
    } catch (err) {
      toast.error("Erro ao iniciar login");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      toast.success("Sessão encerrada");
    } catch (err) {
      toast.error("Erro ao sair");
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta chave?")) return;
    try {
      const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Chave excluída com sucesso");
        fetchKeys();
        fetchStats();
      }
    } catch (err) {
      toast.error("Erro ao excluir chave");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 bg-white rounded-full blur-xl"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm glass p-8 rounded-3xl text-center space-y-8"
        >
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-white/10">
            <ShieldCheck className="w-10 h-10 text-black" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">ScriptKey Manager</h1>
            <p className="text-zinc-500 text-sm">Faça login para gerenciar seus scripts com segurança.</p>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full bg-[#5865F2] text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-[#4752C4] transition-all active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" />
            </svg>
            Entrar com Discord
          </button>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Powered by ScriptKey Engine</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex font-sans selection:bg-white/20">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#0a0a0a',
          color: '#ffffff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px'
        }
      }} />

      {/* Sidebar Desktop */}
      <aside className={cn(
        "hidden lg:flex flex-col border-r border-white/5 bg-black transition-all duration-300 ease-in-out sticky top-0 h-screen",
        isSidebarMinimized ? "w-20" : "w-64"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className={cn("flex items-center gap-3", isSidebarMinimized && "hidden")}>
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold tracking-tight">ScriptKey</span>
          </div>
          <button 
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-500"
          >
            {isSidebarMinimized ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeView === "dashboard"} 
            minimized={isSidebarMinimized}
            onClick={() => setActiveView("dashboard")} 
          />
          <SidebarItem 
            icon={<Key size={20} />} 
            label="Chaves" 
            active={activeView === "keys"} 
            minimized={isSidebarMinimized}
            onClick={() => setActiveView("keys")} 
          />
          <SidebarItem 
            icon={<Users size={20} />} 
            label="Usuários" 
            active={activeView === "users"} 
            minimized={isSidebarMinimized}
            onClick={() => setActiveView("users")} 
          />
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="Ajustes" 
            active={activeView === "settings"} 
            minimized={isSidebarMinimized}
            onClick={() => setActiveView("settings")} 
          />
        </nav>

        <div className="p-4 mt-auto">
          <div className={cn(
            "p-3 rounded-2xl bg-white/5 border border-white/5 transition-all",
            isSidebarMinimized ? "items-center justify-center flex" : "flex items-center gap-3"
          )}>
            <div className="relative">
              <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-white/10" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#5865F2] rounded-full border-2 border-black flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full" />
              </div>
            </div>
            {!isSidebarMinimized && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold truncate">{user.name}</p>
                <div className="flex items-center gap-2">
                  <button onClick={handleLogout} className="text-[10px] text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                    <LogOut size={10} /> Sair
                  </button>
                  <span className="text-[8px] bg-[#5865F2]/20 text-[#5865F2] px-1 rounded uppercase font-bold tracking-tighter">Discord</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-tighter">Vercel Ready</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed inset-y-0 left-0 w-72 bg-black border-r border-white/5 z-[70] lg:hidden p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-black" />
                  </div>
                  <span className="font-bold tracking-tight">ScriptKey</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-4">
                <SidebarItem 
                  icon={<LayoutDashboard size={20} />} 
                  label="Dashboard" 
                  active={activeView === "dashboard"} 
                  onClick={() => { setActiveView("dashboard"); setIsMobileMenuOpen(false); }} 
                />
                <SidebarItem 
                  icon={<Key size={20} />} 
                  label="Chaves" 
                  active={activeView === "keys"} 
                  onClick={() => { setActiveView("keys"); setIsMobileMenuOpen(false); }} 
                />
                <SidebarItem 
                  icon={<Users size={20} />} 
                  label="Usuários" 
                  active={activeView === "users"} 
                  onClick={() => { setActiveView("users"); setIsMobileMenuOpen(false); }} 
                />
                <SidebarItem 
                  icon={<Settings size={20} />} 
                  label="Ajustes" 
                  active={activeView === "settings"} 
                  onClick={() => { setActiveView("settings"); setIsMobileMenuOpen(false); }} 
                />
              </nav>

              <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold truncate">{user.name}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={handleLogout} className="text-xs text-zinc-500 hover:text-white transition-colors">Sair da conta</button>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-tighter">Vercel Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-12 bg-black/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">
              {activeView}
            </h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Vercel Ready</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-white/5 border border-white/5 rounded-xl px-4 py-2 focus-within:border-white/20 transition-all">
              <Search size={16} className="text-zinc-600" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none focus:ring-0 text-sm ml-3 w-48 placeholder:text-zinc-700"
              />
            </div>
            <button 
              onClick={() => setActiveView("keys")}
              className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus size={16} />
              New Key
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-12 max-w-7xl mx-auto w-full animate-fade-in">
          <AnimatePresence mode="wait">
            {activeView === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Total Keys" value={stats.totalKeys} icon={<Key size={20} />} />
                  <StatCard label="Active" value={stats.activeKeys} icon={<CheckCircle2 size={20} className="text-emerald-500" />} />
                  <StatCard label="Expired" value={stats.expiredKeys} icon={<AlertCircle size={20} className="text-rose-500" />} />
                  <StatCard label="Users" value={stats.uniqueUsers} icon={<Users size={20} />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold tracking-tight">Recent Activity</h3>
                      <button className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">View All</button>
                    </div>
                    <div className="space-y-4">
                      {keys.slice(0, 5).map((key) => (
                        <div key={key.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                            <Gamepad2 size={24} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold">{key.userName}</p>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold">{key.game} • {key.scriptName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-mono text-zinc-500">{key.key.substring(0, 12)}...</p>
                            <p className="text-[10px] text-zinc-700 font-bold">{new Date(key.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                      {keys.length === 0 && (
                        <div className="text-center py-20 text-zinc-700 font-bold uppercase tracking-widest text-xs">
                          No recent activity
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-bold tracking-tight">Distribution</h3>
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-8">
                      <GameProgress label="Roblox" percentage={65} />
                      <GameProgress label="Minecraft" percentage={45} />
                      <GameProgress label="GTA V" percentage={30} />
                      <GameProgress label="Valorant" percentage={15} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === "keys" && (
              <motion.div
                key="keys"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">Key Management</h3>
                    <p className="text-zinc-600 text-sm">Manage and monitor all generated access keys.</p>
                  </div>
                  <KeyGeneratorModal onKeyGenerated={() => { fetchKeys(); fetchStats(); }} />
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.01]">
                          <th className="px-8 py-5 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">User</th>
                          <th className="px-8 py-5 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Game / Script</th>
                          <th className="px-8 py-5 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Access Key</th>
                          <th className="px-8 py-5 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Status</th>
                          <th className="px-8 py-5 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {keys.map((key) => (
                          <tr key={key.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-600">
                                  <Users size={16} />
                                </div>
                                <span className="text-sm font-bold">{key.userName}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="space-y-1">
                                <p className="text-sm font-bold">{key.game}</p>
                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">{key.scriptName}</p>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <code className="text-xs font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-zinc-400">
                                  {key.key}
                                </code>
                                <button 
                                  onClick={() => handleCopy(key.key)}
                                  className="p-2 hover:bg-white/10 rounded-lg text-zinc-600 hover:text-white transition-all"
                                >
                                  <Copy size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className={cn(
                                "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                key.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                              )}>
                                {key.status}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button 
                                onClick={() => handleDeleteKey(key.id)}
                                className="p-2.5 text-zinc-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {keys.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-8 py-24 text-center text-zinc-700 font-bold uppercase tracking-[0.3em] text-xs">
                              Empty Database
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {(activeView === "users" || activeView === "settings") && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 text-zinc-800"
              >
                <Settings size={80} className="mb-6 opacity-10" />
                <h3 className="text-xl font-bold uppercase tracking-[0.2em]">In Development</h3>
                <p className="text-sm font-medium mt-2">This module will be available in the next update.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, minimized, onClick }: { icon: React.ReactNode, label: string, active?: boolean, minimized?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 relative group",
        active 
          ? "text-white bg-white/5 border border-white/5" 
          : "text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.02]"
      )}
    >
      <div className={cn("transition-transform duration-300", active && "scale-110")}>
        {icon}
      </div>
      {!minimized && <span>{label}</span>}
      {minimized && (
        <div className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 z-[100] border border-white/10">
          {label}
        </div>
      )}
      {active && !minimized && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-0 w-1 h-6 bg-white rounded-full"
        />
      )}
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string, value: number | string, icon: React.ReactNode }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:border-white/10 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">{label}</p>
      <h4 className="text-4xl font-bold tracking-tighter">{value}</h4>
    </div>
  );
}

function GameProgress({ label, percentage }: { label: string, percentage: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
        <span className="text-zinc-500">{label}</span>
        <span className="text-zinc-400">{percentage}%</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="h-full rounded-full bg-white" 
        />
      </div>
    </div>
  );
}

function KeyGeneratorModal({ onKeyGenerated }: { onKeyGenerated: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    game: "Roblox",
    scriptName: "",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Key generated successfully");
        setIsOpen(false);
        setFormData({
          userName: "",
          game: "Roblox",
          scriptName: "",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        onKeyGenerated();
      }
    } catch (err) {
      toast.error("Failed to generate key");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/5"
      >
        Generate New
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-black border border-white/10 rounded-[32px] shadow-2xl p-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">New Access Key</h3>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Configure user permissions</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">User Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. John Doe"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-white/20 transition-all outline-none placeholder:text-zinc-800 font-bold"
                    value={formData.userName}
                    onChange={(e) => setFormData({...formData, userName: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Game</label>
                    <select 
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-white/20 transition-all outline-none appearance-none font-bold"
                      value={formData.game}
                      onChange={(e) => setFormData({...formData, game: e.target.value})}
                    >
                      <option value="Roblox">Roblox</option>
                      <option value="Minecraft">Minecraft</option>
                      <option value="GTA V">GTA V</option>
                      <option value="Valorant">Valorant</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Expires</label>
                    <input 
                      type="date" 
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-white/20 transition-all outline-none font-bold"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Script Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Premium Hub"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-white/20 transition-all outline-none placeholder:text-zinc-800 font-bold"
                    value={formData.scriptName}
                    onChange={(e) => setFormData({...formData, scriptName: e.target.value})}
                  />
                </div>

                <div className="pt-6">
                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmitting ? "Generating..." : "Generate Key"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
