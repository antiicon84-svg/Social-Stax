import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
 LogOut
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Client } from '../types';

interface NavbarProps {
 clients: Client[];
}

const Navbar: React.FC<NavbarProps> = ({ clients }) => {
 const location = useLocation();
 const navigate = useNavigate();
 const path = location.pathname;

 const handleLogout = async () => {
 try {
 await signOut(auth);
 navigate('/login');
 } catch (error) {
 console.error('Logout failed:', error);
 }
 };

 const navItems = [
 { name: 'Dashboard', path: '/', icon: LayoutDashboard },
 { name: 'Add Client', path: '/add-client', icon: UserPlus },
 { name: 'Templates', path: '/templates', icon: FileText },
 { name: 'Content Lab', path: '/content-lab', icon: FlaskConical },
 { name: 'Downloads', path: '/downloads', icon: Download },
 { name: 'Prompt Guide', path: '/prompt-guide', icon: HelpCircle },
 { name: 'Billing', path: '/billing', icon: CreditCard },
 ];

 const isActive = (itemPath: string) => path === itemPath;

 return (
 <nav className="w-full md:w-64 bg-gray-950 text-white flex flex-col h-auto md:h-screen border-r border-gray-800 z-50">
 <div className="p-6">
 <div className="flex items-center gap-3 mb-8">
 <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-red-900/20">S</div>
 <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
 Social Stax
 </h1>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto px-4 space-y-8 pb-8">
 <div>
 <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold px-4 mb-4">Main Menu</h2>
 <div className="space-y-1">
 {navItems.map((item) => (
 <Link
 key={item.path}
 to={item.path}
 className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
 isActive(item.path) 
 ? 'bg-red-600/10 text-red-500 border border-red-600/20 shadow-[0_0_20px_rgba(220,38,38,0.05)]' 
 : 'text-gray-400 hover:bg-gray-900 hover:text-white border border-transparent'
 }`}
 >
 <item.icon size={18} className={isActive(item.path) ? 'text-red-500' : 'group-hover:text-white'} />
 <span className="font-medium text-sm">{item.name}</span>
 </Link>
 ))}
 </div>
 </div>

 <div>
 <div className="flex items-center justify-between px-4 mb-4">
 <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Recent Clients</h2>
 <Users size={12} className="text-gray-600" />
 </div>
 <div className="space-y-1">
 {clients && clients.length > 0 ? (
 clients.slice(0, 5).map((client) => (
 <Link
 key={client.id}
 to={`/client/${client.id}`}
 className="flex items-center justify-between px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-900 hover:text-white transition-colors group"
 >
 <span className="truncate max-w-[140px]">{client.name}</span>
 <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600" />
 </Link>
 ))
 ) : (
 <p className="px-4 py-2 text-xs text-gray-600 italic">No clients yet</p>
 )}
 </div>
 </div>
 </div>

 <div className="p-4 border-t border-gray-900 space-y-4 mt-auto">
 <div className="bg-gradient-to-br from-gray-900 to-black p-4 rounded-2xl border border-gray-800">
 <p className="text-xs text-gray-400 mb-2">Pro Plan Active</p>
 <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden mb-3">
 <div className="bg-red-600 h-full w-[65%]" />
 </div>
 <button className="text-[10px] font-bold text-white uppercase tracking-wider hover:text-red-500 transition-colors">
 Upgrade Capacity
 </button>
 </div>

 <button
 onClick={handleLogout}
 className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600/10 text-red-500 border border-red-600/20 hover:bg-red-600/20 transition-colors group font-medium text-sm"
 >
 <LogOut size={18} />
 Logout
 </button>
 </div>
 </nav>
 );
};

export default Navbar;
