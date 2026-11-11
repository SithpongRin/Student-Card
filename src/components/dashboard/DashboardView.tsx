import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { useAppStore } from '../../store/useAppStore';
import { useTemplateStore } from '../../store/useTemplateStore';
import { AppleCard } from '../common/AppleCard';
import { AppleButton } from '../common/AppleButton';
import { AppleBadge } from '../common/AppleBadge';
import { StudentCardFront } from '../card/StudentCardFront';
import { StudentCardBack } from '../card/StudentCardBack';
import { CardPreviewModal } from '../card/CardPreviewModal';
import { Student } from '../../types/student';
import { toKhmerNumerals } from '../../utils/khmerNumerals';
import { cardsPerSheet } from '../../utils/cardSizes';
import { formatDateTime } from '../../utils/formatters';
import {
  Users,
  GraduationCap,
  FileSpreadsheet,
  Printer,
  AlertCircle,
  HardDriveDownload,
  Eye,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { setActiveView } = useAppStore();
  const { currentTemplate, printSettings } = useTemplateStore();
  const perSheetKm = toKhmerNumerals(cardsPerSheet(currentTemplate, printSettings));

  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [totalClasses, setTotalClasses] = useState<number>(0);
  const [missingInfoCount, setMissingInfoCount] = useState<number>(0);
  const [lastBackupDate, setLastBackupDate] = useState<string>('មិនទាន់មាន');
  const [sampleStudent, setSampleStudent] = useState<Student | undefined>();
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [classesList, setClassesList] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const students = await db.students.toArray();
      setTotalStudents(students.length);

      if (students.length > 0) {
        setSampleStudent(students[0]);

        // Calculate missing info
        const missing = students.filter(
          (s) => !s.gender || !s.dateOfBirth || !s.class || !s.fatherName || !s.motherName
        ).length;
        setMissingInfoCount(missing);

        // Group by class
        const classMap: Record<string, number> = {};
        students.forEach((s) => {
          const c = s.class || 'មិនបញ្ជាក់';
          classMap[c] = (classMap[c] || 0) + 1;
        });
        const clList = Object.entries(classMap).map(([name, count]) => ({ name, count }));
        setClassesList(clList);
        setTotalClasses(clList.length);
      }

      // Check last backup
      const lastBackup = await db.backupHistory.orderBy('createdAt').last();
      if (lastBackup) {
        setLastBackupDate(formatDateTime(lastBackup.createdAt));
      }
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#163d7e] via-[#0d2550] to-[#091b3a] p-5 sm:p-8 text-white shadow-[0_20px_50px_rgba(22,61,126,0.25)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-blue-200">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>ប្រព័ន្ធបង្កើតកាតសិស្សផ្លូវការ — ក្រសួងអប់រំ យុវជន និងកីឡា</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-moul tracking-wide text-white leading-relaxed">
              Card សិស្ស — Offline-First Generator
            </h1>
            <p className="text-sm text-blue-100/80 font-battambang leading-relaxed">
              នាំចូលទិន្នន័យពី Excel បង្កើតកាតសិស្សតាមគំរូដើមផ្លូវការ និងបោះពុម្ពជា PDF
              ខ្នាត A4 ចំនួន {perSheetKm} កាតក្នុងមួយទំព័រ ដំណើរការដោយមិនចាំបាច់មានអ៊ីនធឺណិត។
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('import')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#163d7e] font-semibold text-xs hover:bg-blue-50 active:scale-95 transition-all shadow-md"
            >
              <FileSpreadsheet size={15} />
              <span>នាំចូល Excel</span>
            </button>
            <button
              onClick={() => setActiveView('print')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600/60 hover:bg-blue-600/80 text-white font-medium text-xs backdrop-blur-md border border-white/20 active:scale-95 transition-all"
            >
              <Printer size={15} />
              <span>បោះពុម្ព PDF {perSheetKm} កាត</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Students */}
        <AppleCard className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#86868b]">សិស្សសរុប (Students)</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0071e3]">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1d1d1f] font-battambang tracking-tight">
              {toKhmerNumerals(totalStudents)}
            </span>
            <span className="text-xs text-[#86868b]">នាក់</span>
          </div>
          <p className="text-[11px] text-[#86868b] mt-1">ក្នុងប្រព័ន្ធ IndexedDB ក្នុងម៉ាស៊ីន</p>
        </AppleCard>

        {/* Total Classes */}
        <AppleCard>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#86868b]">ថ្នាក់រៀនសរុប (Classes)</span>
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <GraduationCap size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1d1d1f] font-battambang tracking-tight">
              {toKhmerNumerals(totalClasses)}
            </span>
            <span className="text-xs text-[#86868b]">ថ្នាក់</span>
          </div>
          <p className="text-[11px] text-[#86868b] mt-1">ឆ្នាំសិក្សា ២០២៤ - ២០២៥</p>
        </AppleCard>

        {/* Missing Info */}
        <AppleCard>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#86868b]">ខ្វះព័ត៌មាន (Missing Data)</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-[#ff9500]">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1d1d1f] font-battambang tracking-tight">
              {toKhmerNumerals(missingInfoCount)}
            </span>
            <span className="text-xs text-[#86868b]">នាក់</span>
          </div>
          <p className="text-[11px] text-[#86868b] mt-1">
            {missingInfoCount > 0 ? 'អាចកែសម្រួលបន្ថែមបាន' : 'ទិន្នន័យគ្រប់ជ្រុងជ្រោយ'}
          </p>
        </AppleCard>

        {/* Last Backup */}
        <AppleCard>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#86868b]">បម្រុងទុកចុងក្រោយ (Backup)</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-[#34c759]">
              <HardDriveDownload size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-semibold text-[#1d1d1f] truncate font-battambang">
              {lastBackupDate}
            </div>
            <p className="text-[11px] text-[#86868b] mt-1">សុវត្ថិភាពមូលដ្ឋានទិន្នន័យ</p>
          </div>
        </AppleCard>
      </div>

      {/* Main Split: Live Card Preview & Quick Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Authentic Reference Card Live Showcase */}
        <div className="lg:col-span-7 space-y-4">
          <AppleCard
            title="គំរូកាតសិស្សផ្លូវការ (Authoritative Reference Design)"
            subtitle="ផ្អែកលើរូបភាពយោង (Reference Image 1 & 2) — គំរូដើមក្រសួងអប់រំ យុវជន និងកីឡា"
            headerAction={
              <AppleButton
                variant="secondary"
                size="sm"
                icon={<Eye size={14} />}
                onClick={() => setIsPreviewOpen(true)}
              >
                មើលធំពេញអេក្រង់
              </AppleButton>
            }
          >
            <div className="p-4 bg-[#f5f5f7] rounded-2xl flex flex-wrap items-center justify-center gap-6">
              {/* Front Preview */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-[#6e6e73]">
                  ខាងមុខ (Front Side)
                </span>
                <div className="shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-sm bg-white overflow-hidden transition-transform hover:scale-[1.02]">
                  <StudentCardFront
                    student={sampleStudent}
                    template={currentTemplate}
                    scale={0.72}
                    showCuttingBorder={false}
                  />
                </div>
              </div>

              {/* Back Preview */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-[#6e6e73]">
                  ខាងក្រោយ (Back Side)
                </span>
                <div className="shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-sm bg-white overflow-hidden transition-transform hover:scale-[1.02]">
                  <StudentCardBack
                    template={currentTemplate}
                    scale={0.72}
                    showCuttingBorder={false}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-[#86868b] pt-3 border-t border-black/[0.04]">
              <span>ខ្នាតកាត: 64mm × 92mm | សមាមាត្រ: 3×4 Photo Placeholder</span>
              <button
                onClick={() => setActiveView('designer')}
                className="text-[#0071e3] font-medium hover:underline flex items-center gap-1"
              >
                <span>កែសម្រួលគំរូ</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </AppleCard>
        </div>

        {/* Right Side: Quick Action Hub & Class Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Actions Card */}
          <AppleCard title="សកម្មភាពរហ័ស (Quick Actions)">
            <div className="space-y-2.5">
              <button
                onClick={() => setActiveView('import')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#f5f5f7] hover:bg-[#ebebed] text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100/60 flex items-center justify-center text-[#0071e3]">
                    <FileSpreadsheet size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#1d1d1f]">នាំចូលឯកសារ Excel</div>
                    <div className="text-[11px] text-[#86868b]">XLSX, XLS, CSV ស្គាល់ជួរស្វ័យប្រវត្តិ</div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[#86868b] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setActiveView('students')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#f5f5f7] hover:bg-[#ebebed] text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100/60 flex items-center justify-center text-[#34c759]">
                    <Users size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#1d1d1f]">គ្រប់គ្រងបញ្ជីឈ្មោះសិស្ស</div>
                    <div className="text-[11px] text-[#86868b]">បន្ថែម កែសម្រួល ស្វែងរក និងច្រោះតាមថ្នាក់</div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[#86868b] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setActiveView('print')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#f5f5f7] hover:bg-[#ebebed] text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100/60 flex items-center justify-center text-purple-600">
                    <Printer size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#1d1d1f]">បោះពុម្ពកាតលើ A4 ({perSheetKm} កាត)</div>
                    <div className="text-[11px] text-[#86868b]">Duplex ត្រូវគ្នា 300 DPI គុណភាពខ្ពស់</div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[#86868b] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setActiveView('backup')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#f5f5f7] hover:bg-[#ebebed] text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100/60 flex items-center justify-center text-[#ff9500]">
                    <HardDriveDownload size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#1d1d1f]">ទាញយក Backup (ZIP)</div>
                    <div className="text-[11px] text-[#86868b]">រក្សាទុកទិន្នន័យ និងគំរូទាំងអស់ក្រៅបណ្ដាញ</div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[#86868b] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </AppleCard>

          {/* Classes Breakdown */}
          <AppleCard title="ចំនួនសិស្សតាមថ្នាក់ (Classes Breakdown)">
            <div className="space-y-2">
              {classesList.slice(0, 5).map((cls) => (
                <div
                  key={cls.name}
                  className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-[#f5f5f7] text-xs"
                >
                  <span className="font-medium text-[#1d1d1f]">ថ្នាក់ទី {cls.name}</span>
                  <AppleBadge variant="gray" size="sm">
                    {toKhmerNumerals(cls.count)} នាក់
                  </AppleBadge>
                </div>
              ))}
              {classesList.length === 0 && (
                <p className="text-xs text-[#86868b] text-center py-4">មិនទាន់មានទិន្នន័យថ្នាក់រៀន</p>
              )}
            </div>
          </AppleCard>
        </div>
      </div>

      {/* Preview Modal */}
      <CardPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        student={sampleStudent}
        template={currentTemplate}
      />
    </div>
  );
};
