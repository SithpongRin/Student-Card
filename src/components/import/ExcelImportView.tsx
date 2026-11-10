import React, { useState } from 'react';
import { db } from '../../db/database';
import { useAppStore } from '../../store/useAppStore';
import { AppleCard } from '../common/AppleCard';
import { AppleButton } from '../common/AppleButton';
import { AppleBadge } from '../common/AppleBadge';
import {
  parseExcelFile,
  autoDetectColumnMapping,
  validateAndMapRecords,
  downloadExcelSampleTemplate,
  ParsedWorkbook,
  ColumnMapping,
  ImportValidationResult,
} from '../../services/excelService';
import { toKhmerNumerals } from '../../utils/khmerNumerals';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  RotateCw,
  HelpCircle,
} from 'lucide-react';

export const ExcelImportView: React.FC = () => {
  const { setActiveView, addToast } = useAppStore();

  const [file, setFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<ParsedWorkbook | null>(null);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState<number>(0);
  const [mapping, setMapping] = useState<ColumnMapping>({
    studentId: '',
    nameKm: '',
    nameEn: '',
    gender: '',
    dateOfBirth: '',
    placeOfBirth: '',
    class: '',
    academicYear: '',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    address: '',
    phone: '',
    cardNumber: '',
  });

  const [validation, setValidation] = useState<ImportValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');

  const handleFileUpload = async (uploadedFile: File) => {
    setIsProcessing(true);
    setFile(uploadedFile);
    try {
      const parsed = await parseExcelFile(uploadedFile);
      if (parsed.sheets.length === 0) {
        alert('ឯកសារគ្មានសន្លឹកទិន្នន័យ (Empty Workbook)');
        setIsProcessing(false);
        return;
      }
      setWorkbook(parsed);
      setSelectedSheetIndex(0);

      // Auto-detect mapping on first sheet
      const detected = autoDetectColumnMapping(parsed.sheets[0].headers);
      setMapping(detected);

      setStep('mapping');
    } catch (e: any) {
      console.error(e);
      alert('មានបញ្ហាក្នុងការអានឯកសារ Excel: ' + (e?.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidate = async () => {
    if (!workbook) return;
    const currentSheet = workbook.sheets[selectedSheetIndex];
    if (!currentSheet) return;

    // Get existing student IDs to check duplicates
    const existingStudents = await db.students.toArray();
    const existingIdSet = new Set(existingStudents.map((s) => s.studentId));

    const result = validateAndMapRecords(currentSheet.rows, mapping, existingIdSet);
    setValidation(result);
    setStep('preview');
  };

  const handleConfirmImport = async () => {
    if (!validation || validation.validRecords.length === 0) return;

    setIsProcessing(true);
    try {
      // Bulk add valid records
      for (const rec of validation.validRecords) {
        await db.students.add(rec as any);
      }

      // Record in importHistory
      await db.importHistory.add({
        fileName: file?.name || 'Excel_Import.xlsx',
        totalRecords: validation.validRecords.length + validation.invalidRecords.length,
        successCount: validation.validRecords.length,
        skippedCount: validation.invalidRecords.length,
        importedAt: Date.now(),
      });

      addToast({
        type: 'success',
        title: 'នាំចូលជោគជ័យ!',
        message: `បានបន្ថែមសិស្សចំនួន ${validation.validRecords.length} នាក់ទៅក្នុងប្រព័ន្ធ`,
      });

      setActiveView('students');
    } catch (e: any) {
      console.error(e);
      alert('មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ: ' + (e?.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const currentHeaders = workbook?.sheets[selectedSheetIndex]?.headers || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1d1d1f] font-moul tracking-wide">
            នាំចូលទិន្នន័យពី Excel (Excel Import)
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            គាំទ្រឯកសារ .xlsx, .xls, .csv ដំណើរការក្នុងម៉ាស៊ីន (Offline) ១០០% គ្មានបញ្ជូនទៅ Server ក្រៅឡើយ
          </p>
        </div>

        <AppleButton
          variant="secondary"
          size="sm"
          icon={<Download size={14} />}
          onClick={downloadExcelSampleTemplate}
        >
          ទាញយកគំរូតារាង Excel
        </AppleButton>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 py-2">
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            step === 'upload' ? 'bg-[#0071e3] text-white' : 'bg-black/[0.05] text-[#86868b]'
          }`}
        >
          <span>១. ជ្រើសឯកសារ</span>
        </div>
        <div className="w-6 h-[1px] bg-black/10" />
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            step === 'mapping' ? 'bg-[#0071e3] text-white' : 'bg-black/[0.05] text-[#86868b]'
          }`}
        >
          <span>២. ផ្គូផ្គងជួរឈរ (Mapping)</span>
        </div>
        <div className="w-6 h-[1px] bg-black/10" />
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            step === 'preview' ? 'bg-[#0071e3] text-white' : 'bg-black/[0.05] text-[#86868b]'
          }`}
        >
          <span>៣. ផ្ទៀងផ្ទាត់ & នាំចូល</span>
        </div>
      </div>

      {/* STEP 1: UPLOAD BOX */}
      {step === 'upload' && (
        <AppleCard className="p-8">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) handleFileUpload(f);
            }}
            className="border-2 border-dashed border-[#86868b]/30 rounded-3xl p-12 text-center hover:border-[#0071e3] transition-colors flex flex-col items-center justify-center bg-[#f5f5f7]/40"
          >
            <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-[#0071e3] mb-4 shadow-sm">
              <UploadCloud size={32} />
            </div>

            <h3 className="text-base font-semibold text-[#1d1d1f]">
              ទាញទម្លាក់ឯកសារ Excel នៅទីនេះ
            </h3>
            <p className="text-xs text-[#86868b] mt-1 max-w-sm">
              ឬចុចប៊ូតុងខាងក្រោមដើម្បីជ្រើសរើសឯកសារ (.xlsx, .xls, .csv) ពីកុំព្យូទ័រ
            </p>

            <label className="mt-6 inline-flex">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                }}
                className="hidden"
              />
              <span className="cursor-pointer inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0071e3] text-white text-xs font-medium hover:bg-[#0077ed] active:scale-95 transition-all shadow-md">
                <FileSpreadsheet size={15} />
                <span>ជ្រើសរើសឯកសារ Excel</span>
              </span>
            </label>
          </div>
        </AppleCard>
      )}

      {/* STEP 2: COLUMN MAPPING */}
      {step === 'mapping' && workbook && (
        <AppleCard
          title="ផ្គូផ្គងជួរឈរ Excel ទៅនឹងទិន្នន័យកាតសិស្ស"
          subtitle={`ឯកសារ: ${file?.name} | ចំនួនទិន្នន័យ: ${workbook.sheets[selectedSheetIndex]?.totalRows} ជួរ`}
          headerAction={
            workbook.sheets.length > 1 && (
              <select
                value={selectedSheetIndex}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setSelectedSheetIndex(idx);
                  setMapping(autoDetectColumnMapping(workbook.sheets[idx].headers));
                }}
                className="px-3 py-1.5 rounded-full text-xs bg-[#f5f5f7] border border-black/[0.06]"
              >
                {workbook.sheets.map((s, idx) => (
                  <option key={idx} value={idx}>
                    សន្លឹក: {s.sheetName} ({s.totalRows} ជួរ)
                  </option>
                ))}
              </select>
            )
          }
        >
          <div className="space-y-6">
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2">
              <HelpCircle size={16} className="text-[#0071e3] shrink-0 mt-0.5" />
              <span>
                ប្រព័ន្ធបានផ្គូផ្គងជួរឈរដោយស្វ័យប្រវត្តិ។ សូមពិនិត្យ ឬផ្លាស់ប្តូរជម្រើសប្រសិនបើជួរឈរមិនត្រូវគ្នា។
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-battambang">
              {[
                { key: 'nameKm', label: 'គោត្តនាម-នាម (ខ្មែរ) *', required: true },
                { key: 'studentId', label: 'អត្តលេខសិស្ស (ID) *', required: true },
                { key: 'gender', label: 'ភេទ (Gender)' },
                { key: 'dateOfBirth', label: 'ថ្ងៃខែឆ្នាំកំណើត (DOB)' },
                { key: 'placeOfBirth', label: 'ទីកន្លែងកំណើត' },
                { key: 'class', label: 'ថ្នាក់ទី (Class)' },
                { key: 'academicYear', label: 'ឆ្នាំសិក្សា (Academic Year)' },
                { key: 'fatherName', label: 'ឪពុកឈ្មោះ' },
                { key: 'fatherOccupation', label: 'មុខរបរឪពុក' },
                { key: 'motherName', label: 'ម្តាយឈ្មោះ' },
                { key: 'motherOccupation', label: 'មុខរបរម្តាយ' },
                { key: 'address', label: 'ទីលំនៅបច្ចុប្បន្ន' },
                { key: 'phone', label: 'លេខទូរស័ព្ទ' },
                { key: 'cardNumber', label: 'លេខកាត (Card No)' },
                { key: 'nameEn', label: 'ឈ្មោះឡាតាំង (English)' },
              ].map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="font-medium text-[#1d1d1f] flex items-center justify-between">
                    <span>{field.label}</span>
                    {field.required && <span className="text-red-500 font-bold">*</span>}
                  </label>
                  <select
                    value={(mapping as any)[field.key] || ''}
                    onChange={(e) =>
                      setMapping({ ...mapping, [field.key]: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                  >
                    <option value="">-- ជ្រើសរើសជួរឈរ Excel --</option>
                    {currentHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-black/[0.06]">
              <AppleButton variant="secondary" onClick={() => setStep('upload')}>
                ត្រឡប់ក្រោយ
              </AppleButton>
              <AppleButton
                variant="primary"
                onClick={handleValidate}
                icon={<ArrowRight size={14} />}
              >
                ផ្ទៀងផ្ទាត់ទិន្នន័យ (Validate)
              </AppleButton>
            </div>
          </div>
        </AppleCard>
      )}

      {/* STEP 3: VALIDATION PREVIEW */}
      {step === 'preview' && validation && (
        <AppleCard
          title="លទ្ធផលនៃការផ្ទៀងផ្ទាត់ទិន្នន័យ (Validation Summary)"
          subtitle={`ត្រៀមនាំចូល: ${validation.validRecords.length} នាក់ | មិនត្រឹមត្រូវ: ${validation.invalidRecords.length} នាក់ | ស្ទួន: ${validation.duplicateIds.length} នាក់`}
        >
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                <CheckCircle2 size={24} className="text-[#34c759]" />
                <div>
                  <div className="text-lg font-bold text-emerald-950">
                    {toKhmerNumerals(validation.validRecords.length)} នាក់
                  </div>
                  <div className="text-[11px] text-emerald-800">ទិន្នន័យត្រឹមត្រូវ ត្រៀមនាំចូល</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                <AlertTriangle size={24} className="text-[#ff9500]" />
                <div>
                  <div className="text-lg font-bold text-amber-950">
                    {toKhmerNumerals(validation.duplicateIds.length)} នាក់
                  </div>
                  <div className="text-[11px] text-amber-800">អត្តលេខស្ទួន (Duplicate ID)</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3">
                <AlertTriangle size={24} className="text-[#ff3b30]" />
                <div>
                  <div className="text-lg font-bold text-red-950">
                    {toKhmerNumerals(validation.invalidRecords.length)} នាក់
                  </div>
                  <div className="text-[11px] text-red-800">ខ្វះព័ត៌មានចាំបាច់ (ឈ្មោះ)</div>
                </div>
              </div>
            </div>

            {/* Valid Records Preview Table */}
            <div>
              <h4 className="text-xs font-semibold text-[#1d1d1f] mb-2">
                គំរូទិន្នន័យដែលនឹងត្រូវនាំចូល (បង្ហាញ ៥ នាក់ដំបូង):
              </h4>
              <div className="overflow-x-auto border border-black/[0.06] rounded-xl">
                <table className="w-full text-left text-xs font-battambang">
                  <thead className="bg-[#f5f5f7] text-[#86868b] border-b border-black/[0.06]">
                    <tr>
                      <th className="py-2.5 px-3">អត្តលេខ</th>
                      <th className="py-2.5 px-3">ឈ្មោះខ្មែរ</th>
                      <th className="py-2.5 px-3">ភេទ</th>
                      <th className="py-2.5 px-3">ថ្ងៃកំណើត</th>
                      <th className="py-2.5 px-3">ថ្នាក់</th>
                      <th className="py-2.5 px-3">ឪពុក/ម្តាយ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {validation.validRecords.slice(0, 5).map((s, idx) => (
                      <tr key={idx} className="hover:bg-[#f5f5f7]">
                        <td className="py-2 px-3 font-sans font-medium">{s.studentId}</td>
                        <td className="py-2 px-3 font-semibold">{s.nameKm}</td>
                        <td className="py-2 px-3">{s.gender}</td>
                        <td className="py-2 px-3">{s.dateOfBirth || '-'}</td>
                        <td className="py-2 px-3">ថ្នាក់ {s.class}</td>
                        <td className="py-2 px-3 text-[#86868b] truncate max-w-[150px]">
                          {s.fatherName || s.motherName || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-black/[0.06]">
              <AppleButton variant="secondary" onClick={() => setStep('mapping')}>
                ត្រឡប់ទៅផ្គូផ្គង
              </AppleButton>

              <AppleButton
                variant="primary"
                onClick={handleConfirmImport}
                disabled={isProcessing || validation.validRecords.length === 0}
                icon={<CheckCircle2 size={15} />}
              >
                {isProcessing
                  ? 'កំពុងនាំចូល...'
                  : `បញ្ជាក់នាំចូល (${toKhmerNumerals(validation.validRecords.length)} នាក់)`}
              </AppleButton>
            </div>
          </div>
        </AppleCard>
      )}
    </div>
  );
};
