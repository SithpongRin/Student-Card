import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { Student } from '../../types/student';
import { useStudentStore } from '../../store/useStudentStore';
import { useTemplateStore } from '../../store/useTemplateStore';
import { useAppStore } from '../../store/useAppStore';
import { AppleCard } from '../common/AppleCard';
import { AppleButton } from '../common/AppleButton';
import { AppleBadge } from '../common/AppleBadge';
import { StudentCardFront } from '../card/StudentCardFront';
import { StudentCardBack } from '../card/StudentCardBack';
import { CardPreviewModal } from '../card/CardPreviewModal';
import { toKhmerNumerals } from '../../utils/khmerNumerals';
import { PREDEFINED_TEMPLATES } from '../../db/defaultTemplates';
import { AppleSegmentedControl } from '../common/AppleSegmentedControl';
import {
  CreditCard,
  Printer,
  Eye,
  Filter,
  CheckCircle2,
  Users,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const CardGenerateView: React.FC = () => {
  const { setActiveView } = useAppStore();
  const { currentTemplate, setTemplate } = useTemplateStore();
  const { selectedStudentIds, toggleSelectStudent, selectAllStudents, clearSelection } =
    useStudentStore();

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [targetMode, setTargetMode] = useState<'all' | 'selected' | 'class'>('all');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [previewStudent, setPreviewStudent] = useState<Student | undefined>();
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const all = await db.students.toArray();
      setStudents(all);
      const uniqueClasses = Array.from(new Set(all.map((s) => s.class).filter(Boolean)));
      setClasses(uniqueClasses);
      if (uniqueClasses.length > 0) setSelectedClass(uniqueClasses[0]);
    } catch (err) {
      console.error(err);
    }
  };

  // Determine active students for generation
  const targetStudents = students.filter((s) => {
    if (targetMode === 'selected') {
      return s.id && selectedStudentIds.includes(s.id);
    }
    if (targetMode === 'class') {
      return s.class === selectedClass;
    }
    return true; // 'all'
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1d1d1f] font-moul tracking-wide">
            បង្កើតកាតសិស្ស (Card Generation)
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            ជ្រើសរើសសិស្សដើម្បីបង្កើតកាត ពិនិត្យមើលជាមុន និងបន្តទៅកាន់ការបោះពុម្ព
          </p>
        </div>

        <AppleButton
          variant="primary"
          icon={<Printer size={15} />}
          onClick={() => setActiveView('print')}
        >
          {targetStudents.length > 0
            ? `បោះពុម្ព PDF (${toKhmerNumerals(targetStudents.length)} កាត)`
            : 'ទៅកាន់ការបោះពុម្ព PDF (A4)'}
        </AppleButton>
      </div>

      {/* Target & Template Selection Bar */}
      <AppleCard className="p-4" noPadding>
        <div className="p-4 flex flex-wrap items-center justify-between gap-4">
          {/* Template Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
              គំរូកាត:
            </span>
            <AppleSegmentedControl
              size="sm"
              options={[
                { value: 'top-photo', label: 'គំរូទី១ (ថតរូបលើ - កណ្ដាល)' },
                { value: 'bottom-photo', label: 'គំរូទី២ (ថតរូបក្រោម - បាត់ដំបង)' },
              ]}
              value={currentTemplate.variant}
              onChange={(v) => {
                const matched = PREDEFINED_TEMPLATES.find((t) => t.variant === v);
                if (matched) setTemplate({ ...matched });
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
              ជម្រើសបង្កើត:
            </span>
            <div className="inline-flex p-1 bg-[#efeff4] rounded-full text-xs font-medium border border-black/[0.04]">
              <button
                type="button"
                onClick={() => setTargetMode('all')}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  targetMode === 'all'
                    ? 'bg-white text-[#1d1d1f] shadow-sm font-semibold'
                    : 'text-[#6e6e73]'
                }`}
              >
                សិស្សទាំងអស់ ({toKhmerNumerals(students.length)})
              </button>
              <button
                type="button"
                onClick={() => setTargetMode('selected')}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  targetMode === 'selected'
                    ? 'bg-white text-[#1d1d1f] shadow-sm font-semibold'
                    : 'text-[#6e6e73]'
                }`}
              >
                សិស្សដែលបានជ្រើស ({toKhmerNumerals(selectedStudentIds.length)})
              </button>
              <button
                type="button"
                onClick={() => setTargetMode('class')}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  targetMode === 'class'
                    ? 'bg-white text-[#1d1d1f] shadow-sm font-semibold'
                    : 'text-[#6e6e73]'
                }`}
              >
                តាមថ្នាក់រៀន
              </button>
            </div>
          </div>

          {targetMode === 'class' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-[#1d1d1f]">ជ្រើសថ្នាក់:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3.5 py-1.5 rounded-full bg-[#f5f5f7] border border-black/[0.06] text-xs font-semibold"
              >
                {classes.map((c) => (
                  <option key={c} value={c}>
                    ថ្នាក់ទី {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="text-xs text-[#86868b]">
            កាតត្រូវបង្កើត: <span className="font-bold text-[#1d1d1f]">{toKhmerNumerals(targetStudents.length)}</span> កាត
          </div>
        </div>
      </AppleCard>

      {/* Grid of Generated Cards Live Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#1d1d1f]">
            ផ្ទាំងមើលកាតសិស្សជាក់ស្តែង (Card Showcase)
          </h3>
          <span className="text-xs text-[#86868b]">
            បង្ហាញកាតតាមលំដាប់ពិតប្រាកដ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {targetStudents.map((student) => (
            <div
              key={student.id || student.studentId}
              className="bg-white rounded-2xl p-4 border border-black/[0.06] shadow-sm hover:shadow-md transition-all flex flex-col items-center group"
            >
              <div className="relative mb-3 rounded-sm overflow-hidden bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <StudentCardFront
                  student={student}
                  template={currentTemplate}
                  scale={0.65}
                  showCuttingBorder={false}
                />
              </div>

              <div className="w-full text-center mt-auto pt-2 border-t border-black/[0.04]">
                <div className="font-bold text-[#1d1d1f] text-xs font-battambang truncate">
                  {student.nameKm}
                </div>
                <div className="text-[11px] text-[#86868b] flex items-center justify-center gap-2 mt-0.5">
                  <span>{student.studentId}</span>
                  <span>•</span>
                  <span>ថ្នាក់ {student.class}</span>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2">
                  <AppleButton
                    variant="secondary"
                    size="sm"
                    icon={<Eye size={12} />}
                    onClick={() => {
                      setPreviewStudent(student);
                      setIsPreviewOpen(true);
                    }}
                  >
                    មើលកាត
                  </AppleButton>
                </div>
              </div>
            </div>
          ))}

          {targetStudents.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0071e3] flex items-center justify-center mx-auto">
                  <Users size={24} />
                </div>
                <div className="text-sm font-semibold text-[#1d1d1f]">
                  {students.length === 0
                    ? 'មិនទាន់មានទិន្នន័យសិស្សនៅឡើយទេ'
                    : 'ពុំមានសិស្សត្រូវនឹងលក្ខខណ្ឌដែលបានជ្រើសឡើយ'}
                </div>
                <p className="text-xs text-[#86868b]">
                  {students.length === 0
                    ? 'អ្នកអាចនាំចូលទិន្នន័យពី Excel ឬបញ្ចូលទិន្នន័យគំរូដើម្បីតេស្តបង្កើតកាត'
                    : 'សូមជ្រើសរើសសិស្ស ឬថ្នាក់រៀនផ្សេង'}
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  {students.length === 0 ? (
                    <>
                      <AppleButton
                        variant="primary"
                        size="sm"
                        onClick={() => setActiveView('import')}
                      >
                        នាំចូលពី Excel
                      </AppleButton>
                      <AppleButton
                        variant="secondary"
                        size="sm"
                        onClick={async () => {
                          const { initialSeedStudents } = await import('../../db/seedData');
                          for (const s of initialSeedStudents) {
                            const exists = await db.students.where('studentId').equals(s.studentId).first();
                            if (!exists) {
                              await db.students.add(s as Student);
                            }
                          }
                          await loadStudents();
                          useAppStore.getState().addToast({
                            type: 'success',
                            title: 'ជោគជ័យ',
                            message: 'បានបញ្ចូលទិន្នន័យគំរូចំនួន ១២ នាក់ជោគជ័យ!',
                          });
                        }}
                      >
                        បញ្ចូលទិន្នន័យគំរូ (១២ នាក់)
                      </AppleButton>
                    </>
                  ) : (
                    <AppleButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setTargetMode('all')}
                    >
                      បង្ហាញសិស្សទាំងអស់
                    </AppleButton>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Preview Modal */}
      <CardPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        student={previewStudent}
        template={currentTemplate}
      />
    </div>
  );
};
