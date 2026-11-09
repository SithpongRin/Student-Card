import React from 'react';
import { useAppStore, ActiveView } from '../../store/useAppStore';
import { AppleButton } from '../common/AppleButton';
import { AppleBadge } from '../common/AppleBadge';
import { Printer, Upload, RefreshCw, UserCheck } from 'lucide-react';

interface AppleHeaderProps {
  onRefresh?: () => void;
}

const VIEW_TITLES: Record<ActiveView, { km: string; en: string }> = {
  dashboard: { km: 'ផ្ទាំងព័ត៌មានទូទៅ', en: 'Dashboard & Overview' },
  students: { km: 'បញ្ជីឈ្មោះសិស្ស', en: 'Student Management' },
  import: { km: 'នាំចូលទិន្នន័យពី Excel', en: 'Excel Import' },
  designer: { km: 'កែសម្រួលគំរូកាតសិស្ស', en: 'Card Template Designer' },
  generate: { km: 'បង្កើតកាតសិស្ស', en: 'Card Generation' },
  print: { km: 'បោះពុម្ពកាតលើក្រដាស A4', en: 'PDF Print Production (9 Cards/Page)' },
  backup: { km: 'ការបម្រុងទុក & ស្តារទិន្នន័យ', en: 'Backup & Restore' },
  settings: { km: 'ការកំណត់ប្រព័ន្ធ', en: 'System Settings' },
};

export const AppleHeader: React.FC<AppleHeaderProps> = ({ onRefresh }) => {
  const { activeView, setActiveView } = useAppStore();
  const title = VIEW_TITLES[activeView] || { km: 'Card សិស្ស', en: '' };

  return (
    <header className="h-16 px-8 bg-white/75 backdrop-blur-xl border-b border-black/[0.06] flex items-center justify-between sticky top-0 z-10 shrink-0">
      {/* Title */}
      <div>
        <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight font-battambang">
          {title.km}
        </h2>
        <p className="text-[11px] text-[#86868b] leading-none mt-0.5">{title.en}</p>
      </div>

      {/* Quick Actions & Developer Badge */}
      <div className="flex items-center gap-3">
        {/* Developer Credit Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 border border-black/[0.04] text-xs text-[#1d1d1f]">
          <span className="text-[#86868b]">Dev:</span>
          <span className="font-semibold text-[#0071e3]">Sithpong Rin</span>
        </div>

        <AppleBadge variant="green" size="sm">
          A4: ៩ កាត / ទំព័រ
        </AppleBadge>

        {activeView !== 'import' && (
          <AppleButton
            variant="secondary"
            size="sm"
            icon={<Upload size={14} />}
            onClick={() => setActiveView('import')}
          >
            នាំចូល Excel
          </AppleButton>
        )}

        {activeView !== 'print' && (
          <AppleButton
            variant="primary"
            size="sm"
            icon={<Printer size={14} />}
            onClick={() => setActiveView('print')}
          >
            បោះពុម្ព PDF
          </AppleButton>
        )}

        {onRefresh && (
          <button
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
