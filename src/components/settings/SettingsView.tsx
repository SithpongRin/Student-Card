import React from 'react';
import { AppleCard } from '../common/AppleCard';
import { AppleBadge } from '../common/AppleBadge';
import { useTemplateStore } from '../../store/useTemplateStore';
import { computeSheetLayout } from '../../utils/cardSizes';
import { toKhmerNumerals } from '../../utils/khmerNumerals';
import {
  Code2,
  ShieldCheck,
  Monitor,
  Printer,
  Heart,
  Cpu,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentTemplate, printSettings } = useTemplateStore();
  const sheet = computeSheetLayout(currentTemplate, {
    ...printSettings,
    cardWidthMm: currentTemplate.cardWidthMm,
    cardHeightMm: currentTemplate.cardHeightMm,
  });
  const perSheetKm = toKhmerNumerals(sheet.cardsPerPage);
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#1d1d1f] font-moul tracking-wide">
          ការកំណត់ប្រព័ន្ធ (System Settings)
        </h1>
        <p className="text-xs text-[#86868b] mt-0.5">
          ព័ត៌មានប្រព័ន្ធ គំរូយោងផ្លូវការ និងការផ្ទៀងផ្ទាត់ពុម្ពអក្សរខ្មែរ (Khmer Fonts)
        </p>
      </div>

      {/* Developer Information Card */}
      <AppleCard className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0071e3] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(0,113,227,0.3)]">
              <Code2 size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                  អ្នកបង្កើតប្រព័ន្ធ (Lead Developer)
                </span>
                <AppleBadge variant="blue" size="sm">
                  Author
                </AppleBadge>
              </div>
              <h2 className="text-xl font-bold text-[#1d1d1f] tracking-tight mt-0.5">
                Sithpong Rin
              </h2>
              <p className="text-xs text-[#6e6e73] font-battambang mt-0.5">
                ប្រព័ន្ធបង្កើត និងបោះពុម្ពប័ណ្ណសម្គាល់ខ្លួនសិស្ស (Card សិស្ស — Offline-First A4 Generator)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AppleBadge variant="green" size="md">
              <span className="w-2 h-2 rounded-full bg-[#34c759] mr-1" />
              Offline PWA Production Ready
            </AppleBadge>
          </div>
        </div>
      </AppleCard>

      {/* Default System Information */}
      <AppleCard
        title="ការកំណត់លំនាំដើមរបស់ស្ថាប័ន (Default Institutional Settings)"
        subtitle="ការកំណត់ដែលត្រូវបានកំណត់ទុកជាមុនសម្រាប់ប្រព័ន្ធ"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-battambang text-xs">
          <div className="p-4 rounded-2xl bg-[#f5f5f7] space-y-1">
            <span className="text-[#86868b] block text-[11px]">សាលារៀនលំនាំដើម (Default School)</span>
            <span className="text-sm font-bold text-[#1d1d1f] block">អនុវិទ្យាល័យដំណាក់ព្រីង</span>
            <span className="text-[10px] text-[#0071e3]">បង្ហាញលើបន្ទាត់ អនុ/វិទ្យាល័យ</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#f5f5f7] space-y-1">
            <span className="text-[#86868b] block text-[11px]">នាយកសាលា (Director Name)</span>
            <span className="text-sm font-bold text-[#1d1d1f] block">{currentTemplate.directorName || '—'}</span>
            <span className={`text-[10px] ${currentTemplate.showDirectorName ? 'text-[#34c759]' : 'text-[#86868b]'}`}>
              {currentTemplate.showDirectorName ? 'បង្ហាញលើកាត' : 'មិនបង្ហាញលើកាត'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#f5f5f7] space-y-1">
            <span className="text-[#86868b] block text-[11px]">ការបោះពុម្ព A4 (Print Layout)</span>
            <span className="text-sm font-bold text-[#1d1d1f] block">{perSheetKm} កាតក្នុង ១សន្លឹក A4</span>
            <span className="text-[10px] text-[#6e6e73]">
              {sheet.cols} ជួរឈរ × {sheet.rows} ជួរដេក (Duplex Mirrored)
            </span>
          </div>
        </div>
      </AppleCard>

      {/* Reference Specification Showcase */}
      <AppleCard
        title="លក្ខណៈបច្ចេកទេសគំរូដើមផ្លូវការ (Authoritative Reference Images)"
        subtitle="ប្រព័ន្ធត្រូវបានរចនាយ៉ាងម៉ឺងម៉ាត់តាមរូបភាពយោង Reference Image 1 (ខាងមុខ) និង Reference Image 2 (ខាងក្រោយ)"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-[#f5f5f7] rounded-2xl">
          {/* Reference Image 1 info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1d1d1f]">
                Reference Image 1: ខាងមុខ (Front)
              </span>
              <AppleBadge variant="blue" size="sm">
                គំរូដើមផ្លូវការ
              </AppleBadge>
            </div>
            <ul className="text-xs text-[#6e6e73] space-y-1.5 list-disc pl-4 font-battambang">
              <li>ពាក្យស្លោកជាតិ និងចំណងជើង: ពុម្ពអក្សរ <b>Moul</b> (Khmer OS Muol Light)</li>
              <li>ព័ត៌មានលម្អិតសិស្ស: ពុម្ពអក្សរ <b>Battambang</b> (Khmer OS Battambang)</li>
              <li>ប្រអប់រូបថត: ទំហំ <b>3 x 4 cm</b> (ទុកទទេបើគ្មានរូបថត)</li>
              <li>Watermark: និមិត្តសញ្ញាក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS) កម្រិតព្រាល 16%</li>
              <li>កន្លែងចុះហត្ថលេខា: ផ្តល់ចន្លោះធំទូលាយគ្រប់គ្រាន់សម្រាប់ចុះហត្ថលេខា និងបោះត្រាក្រហមផ្លូវការ</li>
            </ul>
          </div>

          {/* Reference Image 2 info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1d1d1f]">
                Reference Image 2: ខាងក្រោយ (Back)
              </span>
              <AppleBadge variant="green" size="sm">
                ពណ៌ផ្លូវការ
              </AppleBadge>
            </div>
            <ul className="text-xs text-[#6e6e73] space-y-1.5 list-disc pl-4 font-battambang">
              <li>ផ្ទៃខាងក្រោយពណ៌សសុទ្ធ (Plain White Background)</li>
              <li>និមិត្តសញ្ញាក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS Emblem) ចំកណ្តាល</li>
              <li>ពណ៌ដើមផ្លូវការ: ភ្លើងគប់ពណ៌មាស, កង់ចក្រ, កាំរស្មីខៀវ, កម្រងផ្កាភ្លើង</li>
              <li>គ្មានបន្ថែមអក្សរ ឬការតុបតែងទំនើបដែលខុសពីគំរូដើមឡើយ</li>
            </ul>
          </div>
        </div>
      </AppleCard>

      {/* Khmer Typography Verification */}
      <AppleCard
        title="ការផ្ទៀងផ្ទាត់ពុម្ពអក្សរខ្មែរ (Khmer Typography Verification)"
        subtitle="ពុម្ពអក្សរទាំងអស់ត្រូវបាន Bundle ក្នុងកម្មវិធី (Offline 100%) ដោយមិនទាញយកពី CDN ក្រៅឡើយ"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white border border-black/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1d1d1f]">Moul (ចំណងជើងធំ & ពាក្យស្លោកជាតិ)</span>
              <AppleBadge variant="green" size="sm">ផ្ទុកជោគជ័យ (Embedded)</AppleBadge>
            </div>
            <div className="font-moul text-sm text-[#163d7e]">
              ព្រះរាជាណាចក្រកម្ពុជា — ជាតិ សាសនា ព្រះមហាក្សត្រ — អត្តសញ្ញាណប័ណ្ណសិស្ស
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-black/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1d1d1f]">Battambang (អត្ថបទ និងព័ត៌មានលម្អិតសិស្ស)</span>
              <AppleBadge variant="green" size="sm">ផ្ទុកជោគជ័យ (Embedded)</AppleBadge>
            </div>
            <div className="font-battambang text-xs text-[#163d7e]">
              គោត្តនាម-នាម: សុខ សុវណ្ណារ៉ា | ថ្ងៃខែឆ្នាំកំណើត: ១៥/០៤/២០០៨ | ថ្នាក់ទី ១០A | ទីលំនៅបច្ចុប្បន្ន: ខេត្តកណ្ដាល
            </div>
          </div>
        </div>
      </AppleCard>

      {/* App Architecture & Privacy Info */}
      <AppleCard title="ស្ថាបត្យកម្មប្រព័ន្ធ & ឯកជនភាព (Architecture & Privacy)">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-battambang">
          <div className="p-4 rounded-2xl bg-[#f5f5f7]">
            <ShieldCheck size={20} className="text-[#34c759] mb-2" />
            <div className="font-semibold text-[#1d1d1f]">គ្មាន Login / គណនី</div>
            <div className="text-[#86868b] mt-1 text-[11px]">
              មិនទាមទារការចុះឈ្មោះ ឬ Login ចូលប្រើប្រាស់ឡើយ។
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f5f5f7]">
            <Monitor size={20} className="text-[#0071e3] mb-2" />
            <div className="font-semibold text-[#1d1d1f]">Local-First Architecture</div>
            <div className="text-[#86868b] mt-1 text-[11px]">
              ទិន្នន័យសិស្សទាំងអស់ស្ថិតនៅក្នុង IndexedDB នៃកុំព្យូទ័រលោកអ្នក។
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f5f5f7]">
            <Printer size={20} className="text-purple-600 mb-2" />
            <div className="font-semibold text-[#1d1d1f]">A4 {perSheetKm} កាត Print-Ready</div>
            <div className="text-[#86868b] mt-1 text-[11px]">
              300 DPI គុណភាពបោះពុម្ពខ្ពស់ គាំទ្រ Duplex Mirroring ស្វ័យប្រវត្តិ។
            </div>
          </div>
        </div>
      </AppleCard>
    </div>
  );
};
