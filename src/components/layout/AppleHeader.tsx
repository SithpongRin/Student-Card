import React from 'react';
import { useAppStore, ActiveView } from '../../store/useAppStore';
import { AppleButton } from '../common/AppleButton';
import { AppleBadge } from '../common/AppleBadge';
import { Printer, Upload, RefreshCw, Menu } from 'lucide-react';
import { useTemplateStore } from '../../store/useTemplateStore';
import { cardsPerSheet } from '../../utils/cardSizes';
import { toKhmerNumerals } from '../../utils/khmerNumerals';

interface AppleHeaderProps {
  onRefresh?: () => void;
}

const VIEW_TITLES: Record<ActiveView, { km: string; en: string }> = {
  dashboard: { km: 'ផ្ទាំងព័ត៌មានទូទៅ', en: 'Dashboard & Overview' },
  students: { km: 'បញ្ជីឈ្មោះសិស្ស', en: 'Student Management' },
  import: { km: 'នាំចូលទិន្នន័យពី Excel', en: 'Excel Import' },
  designer: { km: 'កែសម្រួលគំរូកាតសិស្ស', en: 'Card Template Designer' },
  generate: { km: 'បង្កើតកាតសិស្ស', en: 'Card Generation' },
  print: { km: 'បោះពុម្ពកាតលើក្រដាស A4', en: 'PDF Print Production' },
  backup: { km: 'ការបម្រុងទុក & ស្តារទិន្នន័យ', en: 'Backup & Restore' },
  settings: { km: 'ការកំណត់ប្រព័ន្ធ', en: 'System Settings' },
};

export const AppleHeader: React.FC<AppleHeaderProps> = ({ onRefresh }) => {
  const { activeView, setActiveView, toggleMobileSidebar } = useAppStore();
  const perSheet = useTemplateStore((st) => cardsPerSheet(st.currentTemplate, st.printSettings));
  const title = VIEW_TITLES[activeView] || { km: 'Card សិស្ស', en: '' };

  return (
    <header className="h-16 px-4 sm:px-8 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] flex items-center justify-between sticky top-0 z-10 shrink-0">
      {/* Title & Mobile Hamburger Button */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 -ml-1 rounded-xl text-slate-700 hover:bg-black/[0.05] active:scale-95 transition-all shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-semibold text-[#1d1d1f] tracking-tight font-battambang truncate">
            {title.km}
          </h2>
          <p className="text-[10px] sm:text-[11px] text-[#86868b] leading-none mt-0.5 truncate hidden xs:block">
            {title.en}
          </p>
        </div>
      </div>

      {/* Quick Actions & Badges */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Developer Credit Badge (hidden on mobile) */}
        <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 border border-black/[0.04] text-xs text-[#1d1d1f]">
          <span className="text-[#86868b]">Dev:</span>
          <span className="font-semibold text-[#0071e3]">Sithpong Rin</span>
        </div>

        {/* Cards-per-sheet Badge (hidden on small phone screens) */}
        <div className="hidden sm:inline-flex">
          <AppleBadge variant="green" size="sm">
            A4: {toKhmerNumerals(perSheet)} កាត
          </AppleBadge>
        </div>

        {activeView !== 'import' && (
          <AppleButton
            variant="secondary"
            size="sm"
            icon={<Upload size={14} />}
            onClick={() => setActiveView('import')}
            className="text-xs"
          >
            <span className="hidden sm:inline">នាំចូល Excel</span>
            <span className="sm:hidden">នាំចូល</span>
          </AppleButton>
        )}

        {activeView !== 'print' && (
          <AppleButton
            variant="primary"
            size="sm"
            icon={<Printer size={14} />}
            onClick={() => setActiveView('print')}
            className="text-xs"
          >
            <span className="hidden sm:inline">បោះពុម្ព PDF</span>
            <span className="sm:hidden">ព្រីន</span>
          </AppleButton>
        )}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] flex items-center justify-center text-[#6e6e73] transition-colors"
            title="Reload"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>
    </header>
  );
};
