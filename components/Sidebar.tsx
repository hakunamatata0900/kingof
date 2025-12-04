"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Map, Grid3x3, Boxes, LogOut, User, FileText, DollarSign, Wrench } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Graveyards', href: '/graveyards', icon: Map },
  { name: 'Plots', href: '/plots', icon: Grid3x3 },
  { name: 'Graves', href: '/graves', icon: Boxes },
  { name: 'Burial Records', href: '/burial-records', icon: FileText },
  { name: 'Finance', href: '/finance', icon: DollarSign },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'staff':
        return 'bg-amber-100 text-amber-700';
      case 'visitor':
        return 'bg-cyan-100 text-cyan-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700">
      <div className="flex h-16 items-center justify-center border-b border-slate-700">
        <h1 className="text-2xl font-bold text-white">Graveyard System</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-slate-700 text-white shadow-lg scale-105'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:scale-102'
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-700 p-4 space-y-3">
        {user && (
          <div className="rounded-lg bg-slate-700/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-full bg-slate-600 p-2">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.username}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold capitalize ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
