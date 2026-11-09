import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { Student } from '../../types/student';
import { useTemplateStore } from '../../store/useTemplateStore';
import { useStudentStore } from '../../store/useStudentStore';
import { useAppStore } from '../../store/useAppStore';
import { AppleCard } from '../common/AppleCard';
import { AppleButton } from '../common/AppleButton';
import { AppleBadge } from '../common/AppleBadge';
import { AppleSegmentedControl } from '../common/AppleSegmentedControl';
import { StudentCardFront } from '../card/StudentCardFront';
import { StudentCardBack } from '../card/StudentCardBack';
import {
  PREDEFINED_TEMPLATES,
  defaultReferenceTemplate,
  templateBattambangBottomPhoto,
} from '../../db/defaultTemplates';
import {
  generateStudentCardsPdf,
  downloadPdf,
  PdfGenerationProgress,
} from '../../services/pdfService';
import { PrintMode } from '../../types/print';
import { toKhmerNumerals } from '../../utils/khmerNumerals';
import {
  FileDown,
  Sliders,
  Info,
} from 'lucide-react';

export const PdfExportView: React.FC = () => {
  const { currentTemplate, setTemplate, setCardDimensions, printSettings, updatePrintSetting, savePrintSettings } =
    useTemplateStore();
  const { selectedStudentIds } = useStudentStore();
  const { addToast } = useAppStore();

  const [students, setStudents] = useState<Student[]>([]);
  const [printScope, setPrintScope] = useState<'all' | 'selected'>('all');
  const [printMode, setPrintMode] = useState<PrintMode>('duplex');
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<PdfGenerationProgress | null>(null);
  const [showCalibration, setShowCalibration] = useState<boolean>(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const all = await db.students.toArray();
    setStudents(all);
    if (selectedStudentIds.length > 0) {
      setPrintScope('selected');
    }
  };

  const targetStudents =
    printScope === 'selected' && selectedStudentIds.length > 0
      ? students.filter((s) => s.id && selectedStudentIds.includes(s.id))
      : students;

  const totalCards = targetStudents.length;
  const cardsPerPage = printSettings.cardsPerPage || 9;
  const totalSheets = Math.ceil(totalCards / cardsPerPage) || (totalCards === 0 ? 0 : 1);

  const handleExportPdf = async (isTest: boolean = false) => {
    let exportList = isTest ? targetStudents.slice(0, cardsPerPage) : targetStudents;
    if (exportList.length === 0) {
      if (isTest) {
        const { initialSeedStudents } = await import('../../db/seedData');
        exportList = initialSeedStudents.slice(0, cardsPerPage) as any;
      } else {
        alert('សូមជ្រើសរើស ឬបញ្ចូលសិស្សយ៉ាងហោចណាស់ម្នាក់ដើម្បីបោះពុម្ព');
        return;
      }
    }

    setIsGenerating(true);
    setProgress({
      totalCards: exportList.length,
      completedCards: 0,
      currentStep: 'កំពុងរៀបចំទំព័រ...',
      percent: 0,
    });

    try {
      const pdfBytes = await generateStudentCardsPdf(
        exportList,
        currentTemplate,
        printSettings,
        printMode,
        (p) => setProgress(p)
      );

      const fileName = isTest
        ? `Test_${currentTemplate.variant}_A4_9cards.pdf`
        : `Student_Cards_A4_${currentTemplate.variant}_${exportList.length}cards.pdf`;

      downloadPdf(pdfBytes, fileName);

      await db.generationHistory.add({
        batchName: fileName,
        studentCount: exportList.length,
        mode: printMode,
        generatedAt: Date.now(),
      });

      addToast({
        type: 'success',
        title: 'ទាញយក PDF រួចរាល់!',
        message: `បានបង្កើតឯកសារ PDF ចំនួន ${exportList.length} កាត (៩ កាតលើ A4)`,
      });
    } catch (e: any) {
      console.error(e);
      alert('មានបញ្ហាក្នុងការបង្កើត PDF: ' + (e?.message || 'Error'));
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  const previewNineCards = targetStudents.slice(0, cardsPerPage);
  while (previewNineCards.length < cardsPerPage) {
    previewNineCards.push(targetStudents[0] || ({} as any));
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1d1d1f] font-moul tracking-wide">
            បោះពុម្ពកាតលើ A4 (PDF Print Production)
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            រៀបចំ ៩ កាតក្នុងមួយទំព័រ A4 (៣ ជួរឈរ × ៣ ជួរដេក) គាំទ្រ Duplex សងខាង និងបន្ទាត់កាត់
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AppleButton
            variant="secondary"
            size="sm"
            icon={<Sliders size={14} />}
            onClick={() => setShowCalibration(!showCalibration)}
          >
            {showCalibration ? 'លាក់ការកំណត់' : 'កំណត់ទំហំ & គម្លាត (Calibration)'}
          </AppleButton>

          <AppleButton
            variant="secondary"
            size="sm"
            onClick={() => handleExportPdf(true)}
            disabled={isGenerating}
          >
            បោះពុម្ពតេស្ត (១ ទំព័រ)
          </AppleButton>

          <AppleButton
            variant="primary"
            size="md"
            icon={<FileDown size={16} />}
            onClick={() => handleExportPdf(false)}
            disabled={isGenerating || totalCards === 0}
          >
            {isGenerating
              ? 'កំពុងបង្កើត PDF...'
              : `ទាញយក PDF (${toKhmerNumerals(totalCards)} កាត)`}
          </AppleButton>
        </div>
      </div>

      {/* Progress Bar */}
      {isGenerating && progress && (
        <AppleCard className="bg-blue-50/80 border-blue-200">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-blue-900">
              <span>{progress.currentStep}</span>
              <span className="font-bold">{progress.percent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-blue-200 overflow-hidden">
              <div
                className="h-full bg-[#0071e3] transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        </AppleCard>
      )}

      {/* Calibration Drawer */}
      {showCalibration && (
        <AppleCard
          title="ការកំណត់កម្រិតព្រីន & គម្លាតក្រដាស (Print Calibration Settings)"
          subtitle="កែតម្រូវចម្ងាយរំកិលរវាងទំព័រមុខ និងក្រោយ សម្រាប់ម៉ាស៊ីនព្រីនសងខាង"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-battambang">
            <div>
              <label className="block font-medium text-[#1d1d1f] mb-1">
                គែមឆ្វេង/ស្តាំ (Margin Left in mm)
              </label>
              <input
                type="number"
                step="0.5"
                value={printSettings.marginLeftMm}
                onChange={(e) =>
                  updatePrintSetting('marginLeftMm', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#1d1d1f] mb-1">
                គែមលើ/ក្រោម (Margin Top in mm)
              </label>
              <input
                type="number"
                step="0.5"
                value={printSettings.marginTopMm}
                onChange={(e) =>
                  updatePrintSetting('marginTopMm', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#1d1d1f] mb-1">
                រំកិលផ្ដេកទំព័រក្រោយ (Duplex X Offset in mm)
              </label>
              <input
                type="number"
                step="0.2"
                value={printSettings.duplexOffsetXmM}
                onChange={(e) =>
                  updatePrintSetting('duplexOffsetXmM', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#1d1d1f] mb-1">
                រំកិលបញ្ឈរទំព័រក្រោយ (Duplex Y Offset in mm)
              </label>
              <input
                type="number"
                step="0.2"
                value={printSettings.duplexOffsetYmM}
                onChange={(e) =>
                  updatePrintSetting('duplexOffsetYmM', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06]"
              />
            </div>

            <div className="col-span-full flex items-center justify-between pt-3 border-t border-black/[0.06]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={printSettings.showCuttingGuides}
                  onChange={(e) => updatePrintSetting('showCuttingGuides', e.target.checked)}
                  className="w-4 h-4 accent-[#0071e3] rounded"
                />
                <span className="font-semibold text-[#1d1d1f]">
                  បង្ហាញបន្ទាត់ណែនាំសម្រាប់កាត់ (Cutting Guides / Trim Marks)
                </span>
              </label>

              <AppleButton variant="secondary" size="sm" onClick={savePrintSettings}>
                រក្សាទុកការកំណត់
              </AppleButton>
            </div>
          </div>
        </AppleCard>
      )}

      {/* Print Controls Bar & Template Switcher */}
      <AppleCard className="p-4" noPadding>
        <div className="p-4 flex flex-wrap items-center justify-between gap-6">
          {/* A4 Sheet Layout: 9 Cards vs 4 Cards */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#86868b] uppercase">ប្លង់លើ A4:</span>
            <AppleSegmentedControl
              size="sm"
              options={[
                { value: '9', label: '១ សន្លឹក ៩ កាត (3×3)' },
                { value: '4', label: '១ សន្លឹក ៤ កាត (2×2)' },
              ]}
              value={printSettings.cardsPerPage === 4 ? '4' : '9'}
              onChange={(v) => {
                if (v === '4') {
                  setCardDimensions(95, 135);
                  updatePrintSetting('cardsPerPage', 4);
                  updatePrintSetting('gridColumns', 2);
                  updatePrintSetting('gridRows', 2);
                  addToast({
                    type: 'info',
                    title: 'ប្លង់ ១ សន្លឹក ៤ កាត',
                    message: 'បានកំណត់ទំហំ ៩៥ × ១៣៥ mm (៤ កាតលើ A4 ខ្នាតធំច្បាស់)',
                  });
                } else {
                  setCardDimensions(64, 92);
                  updatePrintSetting('cardsPerPage', 9);
                  updatePrintSetting('gridColumns', 3);
                  updatePrintSetting('gridRows', 3);
                  addToast({
                    type: 'info',
                    title: 'ប្លង់ ១ សន្លឹក ៩ កាត',
                    message: 'បានកំណត់ទំហំ ៦៤ × ៩២ mm (៩ កាតលើ A4 គំរូដើមក្រសួង)',
                  });
                }
              }}
            />
          </div>

          {/* Template Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#86868b] uppercase">គំរូកាត:</span>
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

          {/* Card Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#86868b] uppercase">ទំហំកាត:</span>
            <select
              value={`${currentTemplate.cardWidthMm}x${currentTemplate.cardHeightMm}`}
              onChange={(e) => {
                const [w, h] = e.target.value.split('x').map(Number);
                setCardDimensions(w, h);
                if (w >= 90 || h >= 120) {
                  updatePrintSetting('cardsPerPage', 4);
                  updatePrintSetting('gridColumns', 2);
                  updatePrintSetting('gridRows', 2);
                } else {
                  updatePrintSetting('cardsPerPage', 9);
                  updatePrintSetting('gridColumns', 3);
                  updatePrintSetting('gridRows', 3);
                }
              }}
              className="px-3 py-1.5 rounded-full text-xs bg-[#f5f5f7] border border-black/[0.06] font-semibold text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            >
              <option value="60x90">6 cm × 9 cm (ស្រោមផ្លាស្ទិក A2 - ៩ កាតលើ A4)</option>
              <option value="70x100">7 cm × 10 cm (ស្រោមផ្លាស្ទិក A3 - ៤ កាតលើ A4)</option>
              <option value="64x92">64 × 92 mm (គំរូដើម MoEYS - ៩ កាតលើ A4)</option>
              <option value="95x135">95 × 135 mm (ខ្នាតធំ A6 - ៤ កាតលើ A4)</option>
              <option value="86x54">86 × 54 mm (CR80 / ATM ផ្ដេក)</option>
              <option value="54x86">54 × 86 mm (CR80 / ATM បញ្ឈរ)</option>
              <option value="65x95">65 × 95 mm (Pouch អ៊ុតផ្លាស្ទិក)</option>
              <option value="74x105">74 × 105 mm (A7)</option>
            </select>
          </div>

          {/* Print Scope */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#86868b] uppercase">ជ្រើសរើស:</span>
            <AppleSegmentedControl
              size="sm"
              options={[
                { value: 'all', label: `ទាំងអស់ (${toKhmerNumerals(students.length)})` },
                {
                  value: 'selected',
                  label: `ដែលបានជ្រើស (${toKhmerNumerals(selectedStudentIds.length)})`,
                },
              ]}
              value={printScope}
              onChange={(v) => setPrintScope(v as any)}
            />
          </div>

          {/* Print Mode */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#86868b] uppercase">ទម្រង់:</span>
            <AppleSegmentedControl
              size="sm"
              options={[
                { value: 'duplex', label: 'សងខាង (Duplex)' },
                { value: 'front-only', label: 'តែខាងមុខ' },
                { value: 'back-only', label: 'តែខាងក្រោយ' },
              ]}
              value={printMode}
              onChange={(v) => setPrintMode(v as any)}
            />
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-2 text-xs">
            <AppleBadge variant="blue">
              {toKhmerNumerals(totalCards)} កាត
            </AppleBadge>
            <AppleBadge variant="gray">
              {toKhmerNumerals(totalSheets)} A4
            </AppleBadge>
          </div>
        </div>
      </AppleCard>

      {/* Interactive A4 Sheet 3x3 Preview */}
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-between w-full max-w-4xl mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1d1d1f]">
              ទំព័រ A4 គំរូ ({currentTemplate.name})
            </span>
            <AppleBadge variant="green" size="sm">
              ៣ ជួរឈរ × ៣ ជួរដេក = ៩ កាត
            </AppleBadge>
          </div>

          <AppleSegmentedControl
            size="sm"
            options={[
              { value: 'front', label: 'មើលទំព័រមុខ' },
              { value: 'back', label: 'មើលទំព័រក្រោយ' },
            ]}
            value={previewSide}
            onChange={(v) => setPreviewSide(v as any)}
          />
        </div>

        {/* The A4 Canvas Sheet Representation */}
        <div className="relative bg-white shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-black/[0.08] rounded-xl p-6 overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute top-2 left-3 text-[10px] text-[#86868b] font-mono">
            ក្រដាស A4 (210 × 297 mm) | មាត្រដ្ឋានបោះពុម្ព ១០០%
          </div>

          {/* 3x3 Grid of 9 Cards */}
          <div className="grid grid-cols-3 gap-1.5 p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50/40">
            {previewNineCards.map((student, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xs overflow-hidden shadow-xs border border-slate-200"
              >
                {previewSide === 'front' ? (
                  <StudentCardFront
                    student={student}
                    template={currentTemplate}
                    scale={0.48}
                    showCuttingBorder={false}
                  />
                ) : (
                  <StudentCardBack
                    template={currentTemplate}
                    scale={0.48}
                    showCuttingBorder={false}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Duplex Alignment Notice */}
          <div className="mt-4 flex items-center gap-2 text-xs text-[#86868b]">
            <Info size={14} className="text-[#0071e3]" />
            <span>
              {previewSide === 'front'
                ? 'ទំព័រមុខ: កាតត្រូវបានតម្រៀបតាមជួរពីឆ្វេងទៅស្តាំ (Card 1, 2, 3...)'
                : 'ទំព័រក្រោយ: ជួរឈរត្រូវបានបញ្ច្រាស (Mirrored) ស្វ័យប្រវត្តិដើម្បីត្រូវគ្នាត្រង់ចំខ្នងពេលព្រីន Duplex!'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
