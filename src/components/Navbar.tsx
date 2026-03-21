import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  UserPlus,
  FileText,
  FlaskConical,
  Download,
  HelpCircle,
  CreditCard,
  Users,
  ChevronRight,
  LogOut,
  Shield,
  Settings,
  Zap
} from 'lucide-react';
import { Client } from '~/types';

interface NavbarProps {
  clients: Client[];
}

const Navbar: React.FC<NavbarProps> = ({ clients }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();
  const path = location.pathname;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard',    path: '/',             icon: LayoutDashboard },
    { name: 'All Clients',  path: '/clients',      icon: Users },
    { name: 'Add Client',   path: '/add-client',   icon: UserPlus },
    { name: 'Content Lab',  path: '/content-lab',  icon: FlaskConical },
    { name: 'Prompt Guide', path: '/prompt-guide', icon: HelpCircle },
    { name: 'Templates',    path: '/templates',    icon: FileText },
    { name: 'Downloads',    path: '/downloads',    icon: Download },
    { name: 'Billing',      path: '/billing',      icon: CreditCard },
    { name: 'Settings',     path: '/settings',     icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: Shield });
  }

  const isActive = (itemPath: string) => path === itemPath;

  return (
    <nav className="w-full md:w-60 flex flex-col h-auto md:h-screen z-50 relative"
      style={{ background: 'linear-gradient(180deg, #050c1a 0%, #080d1f 100%)', borderRight: '1px solid rgba(30,58,120,0.4)' }}>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(99,179,237,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,179,237,1) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* Logo */}
      <div className="relative px-5 pt-6 pb-5 border-b" style={{ borderColor: 'rgba(30,58,120,0.35)' }}>
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)', boxShadow: '0 0 18px rgba(124,58,237,0.5)' }}>
            <Zap size={18} className="text-white" />
            <div className="absolute inset-0 rounded-xl" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }} />
          </div>
          <div>
            <h1 className="text-[15px] font-bold tracking-wide text-white leading-none">Social StaX</h1>
            <p className="text-[10px] mt-0.5" style={{ color: '#3b82f6' }}>AI Marketing Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="relative flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] px-3 mb-2" style={{ color: 'rgba(99,179,237,0.4)' }}>Main Menu</p>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden"
                  style={active ? {
                    background: 'linear-gradient(90deg, rgba(59,130,246,0.15) 0%, rgba(124,58,237,0.08) 100%)',
                    borderLeft: '2px solid #3b82f6',
                    paddingLeft: '10px',
                  } : {
                    borderLeft: '2px solid transparent',
                    paddingLeft: '10px',
                  }}
                >
                  {active && (
                    <div className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{ boxShadow: 'inset 0 0 20px rgba(59,130,246,0.05)' }} />
                  )}
                  <item.icon size={16} style={{ color: active ? '#60a5fa' : 'rgba(148,163,184,0.7)', flexShrink: 0 }}
                    className="transition-all duration-200 group-hover:!text-blue-400" />
                  <span className="text-[13px] font-medium transition-all duration-200"
                    style={{ color: active ? '#e2e8f0' : 'rgba(148,163,184,0.7)' }}
                    onMouseEnter={e => !active && ((e.target as HTMLElement).style.color = '#e2e8f0')}
                    onMouseLeave={e => !active && ((e.target as HTMLElement).style.color = 'rgba(148,163,184,0.7)')}
                  >{item.name}</span>
                  {active && <div className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#3b82f6', boxShadow: '0 0 6px #3b82f6' }} />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Clients */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(99,179,237,0.4)' }}>Recent Clients</p>
            <Users size={10} style={{ color: 'rgba(99,179,237,0.3)' }} />
          </div>
          <div className="space-y-0.5">
            {clients && clients.length > 0 ? (
              clients.slice(0, 5).map((client) => (
                <Link key={client.id} to={`/client/${client.id}`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg transition-all group"
                  style={{ color: 'rgba(148,163,184,0.6)' }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(99,179,237,0.4)' }} />
                    <span className="text-[12px] truncate max-w-[120px] group-hover:text-white transition-colors">{client.name}</span>
                  </div>
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: '#3b82f6' }} />
                </Link>
              ))
            ) : (
              <p className="px-3 py-2 text-[11px] italic" style={{ color: 'rgba(99,179,237,0.3)' }}>No clients yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative p-3 space-y-2 border-t" style={{ borderColor: 'rgba(30,58,120,0.35)' }}>
        {/* Usage bar */}
        <div className="px-3 py-3 rounded-xl" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(30,58,120,0.4)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium" style={{ color: 'rgba(148,163,184,0.6)' }}>Pro Plan</span>
            <span className="text-[10px]" style={{ color: '#3b82f6' }}>65%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(30,58,120,0.4)' }}>
            <div className="h-full w-[65%] rounded-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #7c3aed)', boxShadow: '0 0 8px rgba(59,130,246,0.6)' }} />
          </div>
          <Link to="/billing">
            <button className="mt-2 text-[10px] font-bold uppercase tracking-wider transition-colors hover:text-blue-400" style={{ color: 'rgba(148,163,184,0.5)' }}>
              Upgrade Plan →
            </button>
          </Link>
        </div>

        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
          style={{ background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)', color: '#f87171' }}
        >
          <LogOut size={15} />
          <span className="text-[13px] font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
