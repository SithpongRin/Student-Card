import React from 'react';
import { useAppStore, ActiveView } from '../../store/useAppStore';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Palette,
  CreditCard,
  Printer,
  HardDriveDownload,
  Settings,
  WifiOff,
  Code2,
} from 'lucide-react';
import clsx from 'clsx';
import { MOEYS_EMBLEM_DATA_URI } from '../../utils/assets';

interface NavItem {
  id: ActiveView;
  labelKm: string;
  labelEn: string;
  icon: React.ReactNode;
  badge?: string;
}

export const AppleSidebar: React.FC = () => {
  const { activeView, setActiveView } = useAppStore();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      labelKm: 'ផ្ទាំងព័ត៌មាន',
      labelEn: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: 'students',
      labelKm: 'គ្រប់គ្រងសិស្ស',
      labelEn: 'Students',
      icon: <Users size={18} />,
    },
    {
      id: 'import',
      labelKm: 'នាំចូល Excel',
      labelEn: 'Import Excel',
      icon: <FileSpreadsheet size={18} />,
    },
    {
      id: 'designer',
      labelKm: 'កែសម្រួលគំរូកាត',
      labelEn: 'Card Designer',
      icon: <Palette size={18} />,
    },
    {
      id: 'generate',
      labelKm: 'បង្កើតកាតសិស្ស',
      labelEn: 'Generate Cards',
      icon: <CreditCard size={18} />,
    },
    {
      id: 'print',
      labelKm: 'បោះពុម្ព A4 PDF',
      labelEn: 'PDF Export',
      icon: <Printer size={18} />,
      badge: '៩ កាត',
    },
    {
      id: 'backup',
      labelKm: 'បម្រុងទុក & ស្តារ',
      labelEn: 'Backup & Restore',
      icon: <HardDriveDownload size={18} />,
    },
    {
      id: 'settings',
      labelKm: 'ការកំណត់',
      labelEn: 'Settings',
      icon: <Settings size={18} />,
    },
  ];

  return (
    <aside className="w-64 h-screen bg-[#f5f5f7]/90 backdrop-blur-2xl border-r border-black/[0.06] flex flex-col justify-between shrink-0 select-none z-20">
      {/* Brand Header */}
      <div>
        <div className="p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-black/[0.04] flex items-center justify-center p-1.5 overflow-hidden">
              <img
                src={MOEYS_EMBLEM_DATA_URI}
                alt="MoEYS Emblem"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-moul text-sm text-[#1d1d1f] tracking-tight">Card សិស្ស</h1>
              </div>
              <p className="text-[11px] font-medium text-[#86868b] flex items-center gap-1">
                <span>Student ID Generator</span>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={clsx(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group text-left',
                  isActive
                    ? 'bg-[#0071e3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.25)]'
                    : 'text-[#1d1d1f] hover:bg-black/[0.05] active:bg-black/[0.08]'
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={clsx(
                      'transition-colors',
                      isActive ? 'text-white' : 'text-[#6e6e73] group-hover:text-[#1d1d1f]'
                    )}
                  >
                    {item.icon}
                  </span>
                  <div>
                    <div className="font-battambang leading-tight text-xs">{item.labelKm}</div>
                    <div
                      className={clsx(
                        'text-[10px] font-normal leading-none mt-0.5',
                        isActive ? 'text-blue-100' : 'text-[#86868b]'
                      )}
                    >
                      {item.labelEn}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={clsx(
                      'text-[10px] px-2 py-0.5 rounded-full font-medium',
                      isActive ? 'bg-white/25 text-white' : 'bg-black/[0.06] text-[#6e6e73]'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Pill & Developer Credit */}
      <div className="p-4 border-t border-black/[0.04] space-y-2">
        <div className="bg-white/80 border border-black/[0.04] rounded-2xl p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#1d1d1f] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#34c759] animate-pulse" />
              ដំណើរការ Offline ១០០%
            </span>
            <WifiOff size={13} className="text-[#86868b]" />
          </div>
          <p className="text-[10px] text-[#86868b] mt-1 leading-snug">
            ទិន្នន័យទាំងអស់រក្សាទុកក្នុងកុំព្យូទ័រលោកអ្នក ដោយសុវត្ថិភាព។
          </p>
        </div>

        {/* Developer Credit Pill */}
        <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[#163d7e]">
            <Code2 size={13} className="text-[#0071e3]" />
            <span className="font-semibold text-[11px]">Developer:</span>
          </div>
          <span className="font-bold text-[11px] text-[#0071e3] tracking-wide">
            Sithpong Rin
          </span>
        </div>
      </div>
    </aside>
  );
};
