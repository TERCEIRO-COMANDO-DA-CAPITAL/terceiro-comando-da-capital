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
  connections?: any[];
  guilds?: any[];
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
  const [user, setUser] = useState<User | null>({
    id: "system-user",
    name: "System Admin",
    picture: "https://cdn.discordapp.com/embed/avatars/0.png",
    email: "admin@system.local",
    connections: [],
    guilds: []
  });
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
  const [isLoading, setIsLoading] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error("Fetch user failed, using default");
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
      await fetchUser();
      await fetchKeys();
      await fetchStats();
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
      toast.loading("Iniciando conexão...", { id: "login-toast" });
      const res = await fetch("/api/auth/url");
      const { url } = await res.json();
      
      // Try to open in a popup first
      const popup = window.open(url, "discord_login", "width=500,height=600");
      
      // Fallback: If popup is blocked or fails, redirect the main window
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        toast.dismiss("login-toast");
        window.location.href = url;
      } else {
        // Monitor popup closure to handle manual cancellation
        const timer = setInterval(() => {
          if (popup.closed) {
            clearInterval(timer);
            toast.dismiss("login-toast");
          }
        }, 1000);
      }
    } catch (err) {
      toast.error("Erro ao iniciar login", { id: "login-toast" });
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
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 bg-[#5865F2] rounded-full blur-xl"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center font-sans selection:bg-white/10 overflow-hidden relative">
        <div className="atmosphere" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
          className="relative z-10 w-full max-w-md px-10"
        >
          <div className="text-center space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-7xl font-black tracking-tighter uppercase leading-none">
                System<br />
                <span className="text-white/40">Access</span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.6em]">Terminal Connection Required</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              <button 
                onClick={handleLogin}
                className="btn-text-gradient w-full py-8 rounded-none flex items-center justify-center gap-6 group"
              >
                <div className="w-10 h-10 flex items-center justify-center text-white/60 group-hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.8em] text-white/80 group-hover:text-white transition-colors">Initialize Session</span>
              </button>
              
              <div className="flex items-center justify-center gap-10 opacity-20">
                <p className="text-[8px] font-black uppercase tracking-[0.4em]">v4.2.0 Stable</p>
                <div className="w-1 h-1 bg-white rounded-full" />
                <p className="text-[8px] font-black uppercase tracking-[0.4em]">Encrypted Tunnel</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex font-sans selection:bg-white/10 overflow-hidden relative">
      <div className="atmosphere" />

      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(40px)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '0px',
          fontSize: '10px',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '0.4em',
          padding: '24px 32px',
          boxShadow: 'none'
        }
      }} />

      {/* Sidebar Desktop */}
      <aside className={cn(
        "hidden lg:flex flex-col glass-surface transition-all duration-1000 ease-[0.19, 1, 0.22, 1] sticky top-0 h-screen",
        isSidebarMinimized ? "w-20" : "w-72"
      )}>
        <div className="p-10 flex items-center justify-between">
          <div className={cn("flex items-center gap-4", isSidebarMinimized && "hidden")}>
            <span className="font-black tracking-tighter text-3xl">TCC</span>
          </div>
          <button 
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            className="p-2 hover:bg-white/5 rounded-none transition-all text-zinc-600 hover:text-white"
          >
            {isSidebarMinimized ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-6 space-y-2 mt-12">
          <SidebarItem 
            icon={<LayoutDashboard size={24} />} 
            label="Dashboard" 
            active={activeView === "dashboard"} 
            minimized={isSidebarMinimized}
            onClick={() => setActiveView("dashboard")} 
          />
          <SidebarItem 
            icon={<Key size={24} />} 
            label="Chaves" 
            active={activeView === "keys"} 
            minimized={isSidebarMinimized}
            onClick={() => setActiveView("keys")} 
          />
          <SidebarItem 
            icon={<Users size={24} />} 
            label="Usuários" 
            active={activeView === "users"} 
            minimized={isSidebarMinimized}
            onClick={() => setActiveView("users")} 
          />
          <SidebarItem 
            icon={<Settings size={24} />} 
            label="Ajustes" 
            active={activeView === "settings"} 
            minimized={isSidebarMinimized}
            onClick={() => setActiveView("settings")} 
          />
        </nav>

        <div className="p-6 mt-auto">
          <div className={cn(
            "p-4 rounded-none bg-white/[0.02] transition-all duration-500 hover:bg-white/[0.04]",
            isSidebarMinimized ? "items-center justify-center flex" : "flex items-center gap-4"
          )}>
            <div className="relative">
              <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-none grayscale hover:grayscale-0 transition-all duration-1000" />
            </div>
            {!isSidebarMinimized && (
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-black truncate tracking-tight uppercase text-white/80">{user.name}</p>
                <button onClick={handleLogout} className="text-[8px] text-zinc-600 hover:text-white transition-colors font-black uppercase tracking-widest mt-1">
                  Disconnect
                </button>
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
                  <span className="font-bold tracking-tight">TCC Panel</span>
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

      <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-y-auto">
        <header className="h-24 flex items-center justify-between px-10 lg:px-20 bg-white/[0.01] backdrop-blur-3xl sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-4 hover:bg-white/5 transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-[9px] font-black text-white/40 uppercase tracking-[0.8em]">
              {activeView}
            </h2>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center bg-white/[0.02] px-6 py-3 transition-all duration-500">
              <Search size={16} className="text-zinc-700" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none focus:ring-0 text-[10px] ml-4 w-64 placeholder:text-zinc-800 font-black uppercase tracking-[0.4em]"
              />
            </div>
          </div>
        </header>

        <div className="p-10 lg:p-20 max-w-7xl mx-auto w-full animate-reveal">
          <AnimatePresence mode="wait">
            {activeView === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-20"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                  <StatCard label="Total Keys" value={stats.totalKeys} icon={<Key size={32} />} />
                  <StatCard label="Active" value={stats.activeKeys} icon={<CheckCircle2 size={32} className="text-emerald-500" />} />
                  <StatCard label="Expired" value={stats.expiredKeys} icon={<AlertCircle size={32} className="text-rose-500" />} />
                  <StatCard label="Users" value={stats.uniqueUsers} icon={<Users size={32} />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
                  <div className="lg:col-span-2 space-y-10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black tracking-tighter uppercase">Recent Activity</h3>
                      <button className="btn-text-gradient px-6 py-3 text-[9px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-colors">Full Logs</button>
                    </div>
                    <div className="space-y-5">
                      {keys.slice(0, 5).map((key) => (
                        <div key={key.id} className="flex items-center gap-8 p-10 rounded-none glass-card group transition-all duration-1000">
                          <div className="w-16 h-16 rounded-none bg-white/5 flex items-center justify-center text-zinc-700 group-hover:text-white transition-all duration-1000">
                            <Gamepad2 size={28} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-black tracking-tight uppercase text-white/90">{key.userName}</p>
                            <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-black mt-2">{key.game} • {key.scriptName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-mono text-zinc-700 group-hover:text-zinc-500 transition-colors">{key.key.substring(0, 12)}...</p>
                            <p className="text-[9px] text-zinc-800 font-black uppercase mt-2">{new Date(key.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                      {keys.length === 0 && (
                        <div className="text-center py-40 text-zinc-800 font-black uppercase tracking-[0.8em] text-[11px]">
                          System Idle
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-10">
                    <h3 className="text-2xl font-black tracking-tighter uppercase">Distribution</h3>
                    <div className="p-12 rounded-none glass-card space-y-12">
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-16"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-10">
                  <div>
                    <h3 className="text-4xl font-black tracking-tighter uppercase">Key Management</h3>
                    <p className="text-zinc-800 text-[11px] font-black uppercase tracking-[0.4em] mt-3">Monitor system access points</p>
                  </div>
                  <KeyGeneratorModal onKeyGenerated={() => { fetchKeys(); fetchStats(); }} />
                </div>

                <div className="glass-surface overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/[0.01]">
                          <th className="px-12 py-8 text-[9px] font-black text-zinc-700 uppercase tracking-[0.6em]">User</th>
                          <th className="px-12 py-8 text-[9px] font-black text-zinc-700 uppercase tracking-[0.6em]">Game / Script</th>
                          <th className="px-12 py-8 text-[9px] font-black text-zinc-700 uppercase tracking-[0.6em]">Access Key</th>
                          <th className="px-12 py-8 text-[9px] font-black text-zinc-700 uppercase tracking-[0.6em]">Status</th>
                          <th className="px-12 py-8 text-[9px] font-black text-zinc-700 uppercase tracking-[0.6em] text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {keys.map((key) => (
                          <tr key={key.id} className="hover:bg-white/[0.02] transition-all duration-500 group">
                            <td className="px-12 py-10">
                              <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-none bg-white/5 flex items-center justify-center text-zinc-700 group-hover:text-white transition-colors">
                                  <Users size={20} />
                                </div>
                                <span className="text-sm font-black tracking-tight uppercase text-white/90">{key.userName}</span>
                              </div>
                            </td>
                            <td className="px-12 py-10">
                              <div className="space-y-2">
                                <p className="text-sm font-black tracking-tight uppercase text-white/80">{key.game}</p>
                                <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.4em]">{key.scriptName}</p>
                              </div>
                            </td>
                            <td className="px-12 py-10">
                              <div className="flex items-center gap-5">
                                <code className="text-[10px] font-mono bg-black/40 px-5 py-3 rounded-none text-zinc-600">
                                  {key.key}
                                </code>
                                <button 
                                  onClick={() => handleCopy(key.key)}
                                  className="p-3 hover:bg-white/5 rounded-2xl text-zinc-600 hover:text-white transition-all"
                                >
                                  <Copy size={18} />
                                </button>
                              </div>
                            </td>
                            <td className="px-12 py-10">
                              <span className={cn(
                                "inline-flex items-center px-4 py-1 rounded-none text-[8px] font-black uppercase tracking-[0.4em]",
                                key.status === "active" ? "bg-emerald-500/5 text-emerald-500" : "bg-rose-500/5 text-rose-500"
                              )}>
                                {key.status}
                              </span>
                            </td>
                            <td className="px-12 py-10 text-right">
                              <button 
                                onClick={() => handleDeleteKey(key.id)}
                                className="p-4 text-zinc-900 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={20} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {keys.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-12 py-48 text-center text-zinc-800 font-black uppercase tracking-[1em] text-[11px]">
                              Database Offline
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-20"
              >
                <div>
                  <h3 className="text-4xl font-black tracking-tighter uppercase">Identity Profile</h3>
                  <p className="text-zinc-800 text-[11px] font-black uppercase tracking-[0.4em] mt-3">Verified Discord credentials</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                  {/* Connections */}
                  <div className="space-y-10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-black tracking-tighter uppercase">Network Links</h4>
                      <span className="text-[10px] font-black text-[#5865F2] uppercase tracking-[0.3em]">{user?.connections?.length || 0} Active</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {user?.connections?.map((conn: any) => (
                        <div key={conn.id} className="p-8 rounded-none glass-card flex items-center gap-5 group transition-all duration-1000">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                            <img 
                              src={`https://cdn.discordapp.com/role-icons/1/${conn.type}.png`} 
                              alt={conn.type}
                              className="w-7 h-7 opacity-20 group-hover:opacity-100 transition-all duration-700 grayscale group-hover:grayscale-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://cdn.discordapp.com/embed/avatars/0.png";
                              }}
                            />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[11px] font-black uppercase tracking-widest text-white/90">{conn.type}</p>
                            <p className="text-[10px] text-zinc-600 truncate font-black mt-1 uppercase">{conn.name}</p>
                          </div>
                          {conn.verified && <CheckCircle2 size={16} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />}
                        </div>
                      ))}
                      {(!user?.connections || user.connections.length === 0) && (
                        <div className="col-span-full py-20 text-center text-zinc-800 font-black uppercase tracking-[0.5em] text-[11px]">
                          No active links
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Guilds */}
                  <div className="space-y-10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-black tracking-tighter uppercase">Authorized Nodes</h4>
                      <span className="text-[10px] font-black text-[#5865F2] uppercase tracking-[0.3em]">{user?.guilds?.length || 0} Connected</span>
                    </div>
                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
                      {user?.guilds?.map((guild: any) => (
                        <div key={guild.id} className="p-8 rounded-none glass-card flex items-center gap-6 group transition-all duration-1000">
                          {guild.icon ? (
                            <img 
                              src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} 
                              alt={guild.name}
                              className="w-14 h-14 rounded-none grayscale group-hover:grayscale-0 transition-all duration-1000"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-black text-zinc-600 group-hover:text-white transition-colors">
                              {guild.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-black truncate tracking-tight uppercase text-white/90">{guild.name}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              {guild.owner && <span className="text-[7px] bg-amber-500/5 text-amber-500 px-2 py-0.5 rounded-none uppercase font-black tracking-widest">Master</span>}
                              <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">ID: {guild.id}</span>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-zinc-700 group-hover:text-white transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-20"
              >
                <div>
                  <h3 className="text-4xl font-black tracking-tighter uppercase">System Configuration</h3>
                  <p className="text-zinc-800 text-[11px] font-black uppercase tracking-[0.4em] mt-3">Core parameters and security</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
                  <div className="lg:col-span-2 space-y-16">
                    <div className="space-y-10">
                      <h4 className="text-xl font-black tracking-tighter uppercase">Global Rules</h4>
                      <div className="space-y-6">
                        <SettingToggle label="Auto-rotate Session Keys" description="Generate new encryption keys every 24 hours" enabled />
                        <SettingToggle label="Purge Inactive Data" description="Delete logs and keys after 7 days of system idle" enabled />
                        <SettingToggle label="Enhanced OAuth Security" description="Strict validation for Discord authentication tokens" enabled />
                      </div>
                    </div>

                    <div className="space-y-10">
                      <h4 className="text-xl font-black tracking-tighter uppercase">API Integration</h4>
                      <div className="p-12 rounded-none glass-surface space-y-10">
                        <div className="space-y-4">
                          <label className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.6em] ml-2">Webhook Endpoint</label>
                          <div className="flex gap-5">
                            <input 
                              type="text" 
                              readOnly
                              value="https://api.tcc.panel/v1/webhook"
                              className="flex-1 bg-black/40 rounded-none px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest border-none outline-none"
                            />
                            <button className="p-6 bg-white/[0.02] hover:bg-white/[0.05] transition-all">
                              <Copy size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <h4 className="text-xl font-black tracking-tighter uppercase">System Health</h4>
                    <div className="p-12 rounded-none glass-surface space-y-12">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.6em]">Redis Latency</span>
                        <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">12ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.6em]">Uptime</span>
                        <span className="text-white/60 font-black text-[10px] uppercase tracking-widest">99.9%</span>
                      </div>
                      <div className="pt-8 opacity-20">
                        <button className="btn-text-gradient w-full py-6 text-[9px] font-black uppercase tracking-[0.5em] text-rose-500">
                          Emergency Shutdown
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SettingToggle({ label, description, enabled }: { label: string, description: string, enabled?: boolean }) {
  const [isOn, setIsOn] = useState(enabled);
  return (
    <div className="flex items-center justify-between p-10 rounded-none glass-card group transition-all duration-1000">
      <div className="space-y-2">
        <p className="text-base font-black tracking-tight uppercase text-white/90">{label}</p>
        <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.4em]">{description}</p>
      </div>
      <button 
        onClick={() => setIsOn(!isOn)}
        className={cn(
          "w-12 h-6 rounded-none transition-all duration-1000 relative",
          isOn ? "bg-white/20" : "bg-white/[0.02]"
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 rounded-none transition-all duration-1000",
          isOn ? "left-7 bg-white" : "left-1 bg-zinc-800"
        )} />
      </button>
    </div>
  );
}

function SidebarItem({ icon, label, active, minimized, onClick }: { icon: React.ReactNode, label: string, active?: boolean, minimized?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-5 px-5 py-4 text-sm font-black transition-all duration-1000 relative group",
        active 
          ? "text-white bg-white/[0.04]" 
          : "text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.01]"
      )}
    >
      <div className={cn("transition-all duration-1000", active && "scale-110 text-white")}>
        {icon}
      </div>
      {!minimized && <span className="uppercase tracking-[0.4em] text-[9px] font-black">{label}</span>}
      {minimized && (
        <div className="absolute left-full ml-6 px-4 py-2 bg-black/90 backdrop-blur-3xl text-white text-[8px] font-black uppercase tracking-[0.4em] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0 z-[100]">
          {label}
        </div>
      )}
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string, value: number | string, icon: React.ReactNode }) {
  return (
    <div className="glass-card p-12 rounded-none hover:bg-white/[0.03] transition-all duration-1000 group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-1000 scale-150">
        {icon}
      </div>
      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.6em] mb-8">{label}</p>
      <h4 className="text-7xl font-black tracking-tighter uppercase text-white/90">{value}</h4>
    </div>
  );
}

function GameProgress({ label, percentage }: { label: string, percentage: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.4em]">
        <span className="text-zinc-600">{label}</span>
        <span className="text-white/40">{percentage}%</span>
      </div>
      <div className="h-[1px] w-full bg-white/[0.05] overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 3, ease: [0.19, 1, 0.22, 1] }}
          className="h-full bg-white/20" 
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
        className="btn-text-gradient px-10 py-5 text-[10px] font-black uppercase tracking-[0.5em] transition-all duration-500 active:scale-95"
      >
        Authorize Access
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-3xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-lg glass-surface p-16 overflow-hidden"
            >
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-4xl font-black tracking-tighter uppercase text-white/90">Authorize</h3>
                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.6em] mt-2">New System Entry</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-4 hover:bg-white/5 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.6em] ml-2">Subject Identity</label>
                      <input 
                        type="text" 
                        required
                        value={formData.userName}
                        onChange={(e) => setFormData({...formData, userName: e.target.value})}
                        className="w-full bg-white/[0.02] px-8 py-6 text-sm font-black focus:bg-white/[0.04] transition-all duration-500 placeholder:text-zinc-800 uppercase tracking-widest text-white border-none outline-none"
                        placeholder="Discord ID / Name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.6em] ml-2">Target</label>
                        <select 
                          value={formData.game}
                          onChange={(e) => setFormData({...formData, game: e.target.value})}
                          className="w-full bg-white/[0.02] px-8 py-6 text-sm font-black transition-all duration-500 appearance-none uppercase tracking-widest text-white border-none outline-none"
                        >
                          <option>Roblox</option>
                          <option>Minecraft</option>
                          <option>GTA V</option>
                          <option>Valorant</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.6em] ml-2">Module</label>
                        <input 
                          type="text" 
                          required
                          value={formData.scriptName}
                          onChange={(e) => setFormData({...formData, scriptName: e.target.value})}
                          className="w-full bg-white/[0.02] px-8 py-6 text-sm font-black transition-all duration-500 placeholder:text-zinc-800 uppercase tracking-widest text-white border-none outline-none"
                          placeholder="Script Name"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.6em] ml-2">Expiration Protocol</label>
                      <input 
                        type="date" 
                        required
                        value={formData.expiresAt}
                        onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                        className="w-full bg-white/[0.02] px-8 py-6 text-sm font-black transition-all duration-500 uppercase tracking-widest text-white border-none outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-white text-black py-8 font-black text-[11px] uppercase tracking-[0.8em] hover:bg-zinc-200 transition-all duration-500 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : "Commit Authorization"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
