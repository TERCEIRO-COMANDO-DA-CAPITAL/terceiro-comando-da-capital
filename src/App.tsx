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
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-6 font-sans overflow-hidden relative">
        <Toaster position="top-center" />
        
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.02] rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.01] rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl relative z-10"
        >
          <div className="text-center space-y-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-10"
            >
              <div className="w-32 h-32 bg-white rounded-[48px] flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.1)] relative group">
                <ShieldCheck size={64} className="text-black transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-white rounded-[48px] animate-ping opacity-10 scale-110" />
              </div>
              <div className="space-y-4">
                <h1 className="text-7xl font-black tracking-tighter uppercase">TCC Panel</h1>
                <p className="text-zinc-800 text-[11px] font-black uppercase tracking-[0.6em]">Centralized Access Protocol</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-10"
            >
              <button 
                onClick={handleLogin}
                className="discord-btn w-full py-8 rounded-[40px] flex items-center justify-center gap-5 transition-all duration-700 group active:scale-95"
              >
                <div className="w-10 h-10 bg-black/5 rounded-2xl flex items-center justify-center group-hover:bg-black/10 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.5em]">Initialize Session</span>
              </button>
              
              <div className="flex items-center justify-center gap-10">
                <p className="text-[9px] text-zinc-900 font-black uppercase tracking-[0.4em]">v4.2.0 Stable</p>
                <div className="w-1 h-1 bg-zinc-900 rounded-full" />
                <p className="text-[9px] text-zinc-900 font-black uppercase tracking-[0.4em]">Encrypted Tunnel</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex font-sans selection:bg-white/10 overflow-hidden">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#050505',
          color: '#ffffff',
          border: 'none',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          padding: '16px 24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }
      }} />

      {/* Sidebar Desktop */}
      <aside className={cn(
        "hidden lg:flex flex-col bg-[#000000] transition-all duration-700 ease-in-out sticky top-0 h-screen",
        isSidebarMinimized ? "w-24" : "w-80"
      )}>
        <div className="p-10 flex items-center justify-between">
          <div className={cn("flex items-center gap-5", isSidebarMinimized && "hidden")}>
            <div className="w-12 h-12 bg-white rounded-[18px] flex items-center justify-center shadow-2xl shadow-white/5">
              <ShieldCheck className="w-7 h-7 text-black" />
            </div>
            <span className="font-black tracking-tighter text-2xl">TCC</span>
          </div>
          <button 
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            className="p-3.5 hover:bg-white/5 rounded-2xl transition-all text-zinc-700 hover:text-white"
          >
            {isSidebarMinimized ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
        </div>

        <nav className="flex-1 px-8 space-y-4 mt-8">
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

        <div className="p-8 mt-auto">
          <div className={cn(
            "p-5 rounded-[32px] bg-[#050505] transition-all duration-500 hover:bg-[#080808]",
            isSidebarMinimized ? "items-center justify-center flex" : "flex items-center gap-5"
          )}>
            <div className="relative">
              <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full grayscale hover:grayscale-0 transition-all duration-700" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#5865F2] rounded-full border-4 border-black flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>
            {!isSidebarMinimized && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-black truncate tracking-tight uppercase">{user.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <button onClick={handleLogout} className="text-[10px] text-zinc-700 hover:text-white transition-colors flex items-center gap-1.5 font-black uppercase tracking-widest">
                    <LogOut size={12} /> Sair
                  </button>
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

      <main className="flex-1 flex flex-col min-w-0 bg-[#000000] overflow-y-auto custom-scrollbar">
        <header className="h-28 flex items-center justify-between px-10 lg:px-20 bg-[#000000]/90 backdrop-blur-3xl sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-4 hover:bg-white/5 rounded-3xl transition-colors"
            >
              <Menu size={28} />
            </button>
            <h2 className="text-[11px] font-black text-zinc-800 uppercase tracking-[0.6em]">
              {activeView}
            </h2>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center bg-[#050505] rounded-[24px] px-8 py-4 focus-within:ring-2 ring-white/5 transition-all duration-500">
              <Search size={20} className="text-zinc-800" />
              <input 
                type="text" 
                placeholder="Search database..." 
                className="bg-transparent border-none focus:ring-0 text-[11px] ml-5 w-80 placeholder:text-zinc-900 font-black uppercase tracking-[0.2em]"
              />
            </div>
          </div>
        </header>

        <div className="p-10 lg:p-20 max-w-7xl mx-auto w-full animate-fade-in">
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
                      <button className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] hover:text-white transition-colors">Full Logs</button>
                    </div>
                    <div className="space-y-5">
                      {keys.slice(0, 5).map((key) => (
                        <div key={key.id} className="flex items-center gap-8 p-8 rounded-[40px] bg-[#050505] hover:bg-[#080808] transition-all duration-500 group">
                          <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-zinc-800 group-hover:text-white transition-all duration-700">
                            <Gamepad2 size={32} />
                          </div>
                          <div className="flex-1">
                            <p className="text-base font-black tracking-tight uppercase">{key.userName}</p>
                            <p className="text-[10px] text-zinc-800 uppercase tracking-[0.3em] font-black mt-2">{key.game} • {key.scriptName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] font-mono text-zinc-800 group-hover:text-zinc-600 transition-colors">{key.key.substring(0, 12)}...</p>
                            <p className="text-[10px] text-zinc-900 font-black uppercase mt-2">{new Date(key.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                      {keys.length === 0 && (
                        <div className="text-center py-40 text-zinc-900 font-black uppercase tracking-[0.8em] text-[11px]">
                          System Idle
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-10">
                    <h3 className="text-2xl font-black tracking-tighter uppercase">Distribution</h3>
                    <div className="p-12 rounded-[48px] bg-[#050505] space-y-12">
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

                <div className="bg-[#050505] rounded-[48px] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#080808]">
                          <th className="px-12 py-8 text-[11px] font-black text-zinc-800 uppercase tracking-[0.4em]">User</th>
                          <th className="px-12 py-8 text-[11px] font-black text-zinc-800 uppercase tracking-[0.4em]">Game / Script</th>
                          <th className="px-12 py-8 text-[11px] font-black text-zinc-800 uppercase tracking-[0.4em]">Access Key</th>
                          <th className="px-12 py-8 text-[11px] font-black text-zinc-800 uppercase tracking-[0.4em]">Status</th>
                          <th className="px-12 py-8 text-[11px] font-black text-zinc-800 uppercase tracking-[0.4em] text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.01]">
                        {keys.map((key) => (
                          <tr key={key.id} className="hover:bg-[#080808] transition-all duration-500 group">
                            <td className="px-12 py-10">
                              <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-800">
                                  <Users size={24} />
                                </div>
                                <span className="text-base font-black tracking-tight uppercase">{key.userName}</span>
                              </div>
                            </td>
                            <td className="px-12 py-10">
                              <div className="space-y-2">
                                <p className="text-base font-black tracking-tight uppercase">{key.game}</p>
                                <p className="text-[10px] text-zinc-800 font-black uppercase tracking-[0.3em]">{key.scriptName}</p>
                              </div>
                            </td>
                            <td className="px-12 py-10">
                              <div className="flex items-center gap-5">
                                <code className="text-xs font-mono bg-[#000000] px-5 py-3 rounded-2xl text-zinc-600">
                                  {key.key}
                                </code>
                                <button 
                                  onClick={() => handleCopy(key.key)}
                                  className="p-3 hover:bg-white/5 rounded-2xl text-zinc-800 hover:text-white transition-all"
                                >
                                  <Copy size={18} />
                                </button>
                              </div>
                            </td>
                            <td className="px-12 py-10">
                              <span className={cn(
                                "inline-flex items-center px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em]",
                                key.status === "active" ? "bg-emerald-500/5 text-emerald-500" : "bg-rose-500/5 text-rose-500"
                              )}>
                                {key.status}
                              </span>
                            </td>
                            <td className="px-12 py-10 text-right">
                              <button 
                                onClick={() => handleDeleteKey(key.id)}
                                className="p-4 text-zinc-900 hover:text-rose-500 hover:bg-rose-500/10 rounded-3xl transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={24} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {keys.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-12 py-48 text-center text-zinc-900 font-black uppercase tracking-[1em] text-[11px]">
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
                      <span className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em]">{user?.connections?.length || 0} Active</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {user?.connections?.map((conn: any) => (
                        <div key={conn.id} className="p-6 rounded-[32px] bg-[#050505] flex items-center gap-5 group hover:bg-[#080808] transition-all duration-500">
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
                            <p className="text-[11px] font-black uppercase tracking-widest">{conn.type}</p>
                            <p className="text-[10px] text-zinc-800 truncate font-black mt-1">{conn.name}</p>
                          </div>
                          {conn.verified && <CheckCircle2 size={16} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />}
                        </div>
                      ))}
                      {(!user?.connections || user.connections.length === 0) && (
                        <div className="col-span-full py-20 text-center text-zinc-900 font-black uppercase tracking-[0.5em] text-[11px]">
                          No active links
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Guilds */}
                  <div className="space-y-10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-black tracking-tighter uppercase">Authorized Nodes</h4>
                      <span className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em]">{user?.guilds?.length || 0} Connected</span>
                    </div>
                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
                      {user?.guilds?.map((guild: any) => (
                        <div key={guild.id} className="p-6 rounded-[32px] bg-[#050505] flex items-center gap-6 hover:bg-[#080808] transition-all duration-500 group">
                          {guild.icon ? (
                            <img 
                              src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} 
                              alt={guild.name}
                              className="w-14 h-14 rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-black text-zinc-800 group-hover:text-white transition-colors">
                              {guild.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-black truncate tracking-tight uppercase">{guild.name}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              {guild.owner && <span className="text-[8px] bg-amber-500/5 text-amber-500 px-2 py-0.5 rounded-full uppercase font-black tracking-widest">Master</span>}
                              <span className="text-[8px] text-zinc-900 font-black uppercase tracking-widest">ID: {guild.id}</span>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-zinc-900 group-hover:text-white transition-colors" />
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
                      <div className="p-12 rounded-[48px] bg-[#050505] space-y-10">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em] ml-4">Webhook Endpoint</label>
                          <div className="flex gap-5">
                            <input 
                              type="text" 
                              readOnly
                              value="https://api.tcc.panel/v1/webhook"
                              className="flex-1 bg-[#000000] border-none rounded-[32px] px-8 py-6 text-sm font-black text-zinc-600 uppercase tracking-widest"
                            />
                            <button className="p-6 bg-white/5 hover:bg-white/10 rounded-[32px] transition-all">
                              <Copy size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <h4 className="text-xl font-black tracking-tighter uppercase">System Health</h4>
                    <div className="p-12 rounded-[48px] bg-[#050505] space-y-12">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em]">Redis Latency</span>
                        <span className="text-emerald-500 font-black text-xs uppercase tracking-widest">12ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em]">Uptime</span>
                        <span className="text-white font-black text-xs uppercase tracking-widest">99.9%</span>
                      </div>
                      <div className="pt-8 border-t border-white/[0.02]">
                        <button className="w-full py-6 rounded-[32px] bg-rose-500/5 text-rose-500 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-rose-500/10 transition-all">
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
    <div className="flex items-center justify-between p-8 rounded-[32px] bg-[#050505] hover:bg-[#080808] transition-all duration-500 group">
      <div className="space-y-2">
        <p className="text-base font-black tracking-tight uppercase">{label}</p>
        <p className="text-[10px] text-zinc-800 font-black uppercase tracking-[0.3em]">{description}</p>
      </div>
      <button 
        onClick={() => setIsOn(!isOn)}
        className={cn(
          "w-16 h-8 rounded-full transition-all duration-500 relative",
          isOn ? "bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "bg-zinc-900"
        )}
      >
        <div className={cn(
          "absolute top-1 w-6 h-6 rounded-full transition-all duration-500",
          isOn ? "left-9 bg-black" : "left-1 bg-zinc-800"
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
        "w-full flex items-center gap-6 px-6 py-5 rounded-[32px] text-sm font-black transition-all duration-700 relative group",
        active 
          ? "text-white bg-[#050505] shadow-2xl shadow-black" 
          : "text-zinc-800 hover:text-zinc-500 hover:bg-white/[0.01]"
      )}
    >
      <div className={cn("transition-all duration-700", active && "scale-125 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]")}>
        {icon}
      </div>
      {!minimized && <span className="uppercase tracking-[0.3em] text-[10px] font-black">{label}</span>}
      {minimized && (
        <div className="absolute left-full ml-8 px-5 py-3 bg-[#050505] text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-500 translate-x-[-20px] group-hover:translate-x-0 z-[100] shadow-2xl">
          {label}
        </div>
      )}
      {active && !minimized && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-0 w-2 h-10 bg-white rounded-full"
        />
      )}
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string, value: number | string, icon: React.ReactNode }) {
  return (
    <div className="bg-[#050505] p-12 rounded-[48px] hover:bg-[#080808] transition-all duration-700 group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-1000 scale-150">
        {icon}
      </div>
      <p className="text-[11px] font-black text-zinc-800 uppercase tracking-[0.5em] mb-8">{label}</p>
      <h4 className="text-6xl font-black tracking-tighter uppercase">{value}</h4>
    </div>
  );
}

function GameProgress({ label, percentage }: { label: string, percentage: number }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.4em]">
        <span className="text-zinc-800">{label}</span>
        <span className="text-zinc-600">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-white/[0.01] rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 2.5, ease: "circOut" }}
          className="h-full rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
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
        className="bg-[#050505] hover:bg-[#080808] text-white px-8 py-4 rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 active:scale-95 shadow-2xl"
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
              className="absolute inset-0 bg-black/98 backdrop-blur-3xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-lg bg-[#000000] rounded-[64px] shadow-[0_0_100px_rgba(0,0,0,1)] p-16 overflow-hidden"
            >
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter uppercase">Authorize</h3>
                    <p className="text-[10px] text-zinc-800 font-black uppercase tracking-[0.4em] mt-2">New System Entry</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-4 hover:bg-white/5 rounded-3xl transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em] ml-4">Subject Identity</label>
                      <input 
                        type="text" 
                        required
                        value={formData.userName}
                        onChange={(e) => setFormData({...formData, userName: e.target.value})}
                        className="w-full bg-[#050505] border-none rounded-[32px] px-8 py-6 text-sm font-black focus:ring-2 ring-white/5 transition-all duration-500 placeholder:text-zinc-900 uppercase tracking-widest"
                        placeholder="Discord ID / Name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em] ml-4">Target</label>
                        <div className="relative">
                          <select 
                            value={formData.game}
                            onChange={(e) => setFormData({...formData, game: e.target.value})}
                            className="w-full bg-[#050505] border-none rounded-[32px] px-8 py-6 text-sm font-black focus:ring-2 ring-white/5 transition-all duration-500 appearance-none uppercase tracking-widest"
                          >
                            <option>Roblox</option>
                            <option>Minecraft</option>
                            <option>GTA V</option>
                            <option>Valorant</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em] ml-4">Module</label>
                        <input 
                          type="text" 
                          required
                          value={formData.scriptName}
                          onChange={(e) => setFormData({...formData, scriptName: e.target.value})}
                          className="w-full bg-[#050505] border-none rounded-[32px] px-8 py-6 text-sm font-black focus:ring-2 ring-white/5 transition-all duration-500 placeholder:text-zinc-900 uppercase tracking-widest"
                          placeholder="Script Name"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em] ml-4">Expiration Protocol</label>
                      <input 
                        type="date" 
                        required
                        value={formData.expiresAt}
                        onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                        className="w-full bg-[#050505] border-none rounded-[32px] px-8 py-6 text-sm font-black focus:ring-2 ring-white/5 transition-all duration-500 uppercase tracking-widest"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-white text-black py-6 rounded-[32px] font-black text-[11px] uppercase tracking-[0.5em] hover:bg-zinc-200 transition-all duration-500 active:scale-95 disabled:opacity-50 shadow-2xl shadow-white/5"
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
