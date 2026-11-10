import React from 'react';
import { useAppStore, ActiveView } from '../../store/useAppStore';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Palette,
  Printer,
  Menu,
} from 'lucide-react';
import clsx from 'clsx';

interface BottomTab {
  id: ActiveView | 'menu';
  labelKm: string;
  icon: React.ReactNode;
}

export const MobileBottomNav: React.FC = () => {
  const { activeView, setActiveView, toggleMobileSidebar } = useAppStore();

  const tabs: BottomTab[] = [
    {
      id: 'dashboard',
      labelKm: 'ផ្ទាំងព័ត៌មាន',
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: 'students',
      labelKm: 'សិស្ស',
      icon: <Users size={20} />,
    },
    {
      id: 'import',
      labelKm: 'នាំចូល',
      icon: <FileSpreadsheet size={20} />,
    },
    {
      id: 'designer',
      labelKm: 'គំរូកាត',
      icon: <Palette size={20} />,
    },
    {
      id: 'print',
      labelKm: 'បោះពុម្ព',
      icon: <Printer size={20} />,
    },
    {
      id: 'menu',
      labelKm: 'ម៉ឺនុយ',
      icon: <Menu size={20} />,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/90 backdrop-blur-2xl border-t border-black/[0.08] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] flex items-center justify-around select-none shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
      aria-label="Mobile Navigation"
    >
      {tabs.map((tab) => {
        const isActive = tab.id !== 'menu' && activeView === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              if (tab.id === 'menu') {
                toggleMobileSidebar();
              } else {
                setActiveView(tab.id);
              }
            }}
            className={clsx(
              'flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 active:scale-90',
              isActive
                ? 'text-[#0071e3] font-bold'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
            )}
          >
            <div className="relative">
              {tab.icon}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0071e3]" />
              )}
            </div>
            <span
              className={clsx(
                'text-[10px] font-battambang mt-0.5 leading-tight truncate max-w-[54px]',
                isActive ? 'font-bold text-[#0071e3]' : 'font-medium'
              )}
            >
              {tab.labelKm}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
