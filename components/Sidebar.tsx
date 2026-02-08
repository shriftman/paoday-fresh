'use client';

import { useState } from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const menuItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: LayoutDashboard, label: 'CRM Pipeline', href: '/dashboard/crm' },
  { icon: Search, label: 'Research Boards', href: '/dashboard/research' },
  { icon: Users, label: 'Contacts', href: '/dashboard/contacts' },
  { icon: Building2, label: 'Companies', href: '/dashboard/companies' },
  { icon: FileText, label: 'Documents', href: '/dashboard/documents' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div 
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-[#1f2937] text-white h-screen fixed left-0 top-0 transition-all duration-300 flex flex-col shadow-xl z-50`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold">
              P
            </div>
            <span className="font-bold text-lg">Paoday CRM</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold mx-auto">
            P
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 bg-[#1f2937] border-2 border-gray-700 rounded-full p-1 hover:bg-gray-700 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <div className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer - Logout */}
      <div className="p-3 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
