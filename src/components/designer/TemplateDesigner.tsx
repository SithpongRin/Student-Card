import React, { useState } from 'react';
import { useTemplateStore } from '../../store/useTemplateStore';
import { useAppStore } from '../../store/useAppStore';
import { AppleCard } from '../common/AppleCard';
import { AppleButton } from '../common/AppleButton';
import { AppleBadge } from '../common/AppleBadge';
import { AppleSegmentedControl } from '../common/AppleSegmentedControl';
import { StudentCardFront } from '../card/StudentCardFront';
import { StudentCardBack } from '../card/StudentCardBack';
import { initialSeedStudents } from '../../db/seedData';
import {
  PREDEFINED_TEMPLATES,
  defaultReferenceTemplate,
  templateBattambangBottomPhoto,
} from '../../db/defaultTemplates';
import { CARD_SIZE_PRESETS } from '../../utils/cardSizes';
import { resolveFlourishUrl } from '../../utils/assets';
import {
  RotateCcw,
  Save,
  CheckCircle2,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const TemplateDesigner: React.FC = () => {
  const { currentTemplate, setTemplate, updateTemplateField, setCardDimensions, resetToReferenceTemplate, saveTemplate } =
    useTemplateStore();
  const { addToast } = useAppStore();

  const [activeSide, setActiveSide] = useState<'front' | 'back' | 'split'>('split');
  const [activeTab, setActiveTab] = useState<'institution' | 'card' | 'watermark' | 'dimensions'>('institution');
  const [sampleIndex, setSampleIndex] = useState<number>(0);

  const sampleStudent = initialSeedStudents[sampleIndex] || initialSeedStudents[0];

  const handleSelectPredefined = (tpl: typeof defaultReferenceTemplate) => {
    setTemplate({ ...tpl });
    addToast({
      type: 'info',
      title: 'បានប្តូរគំរូ',
      message: `បានជ្រើសរើស: ${tpl.name}`,
    });
  };

  const handleReset = async () => {
    if (confirm('តើអ្នកចង់កំណត់គំរូកាតឡើងវិញទៅកាន់ "គំរូដើមផ្លូវការ (Reference Template)" មែនទេ?')) {
      await resetToReferenceTemplate();
      addToast({
        type: 'info',
        title: 'បានកំណត់ឡើងវិញ',
        message: 'គំរូកាតត្រូវបានស្តារទៅកាន់គំរូដើមផ្លូវការ',
      });
    }
  };

  const handleSave = async () => {
    await saveTemplate();
    addToast({
      type: 'success',
      title: 'បានរក្សាទុក!',
      message: 'គំរូកាតត្រូវបានរក្សាទុកក្នុងម៉ាស៊ីនដោយជោគជ័យ',
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1d1d1f] font-moul tracking-wide">
            កែសម្រួលគំរូកាត (Card Template Designer)
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            ជ្រើសរើសរវាងគំរូផ្លូវការទាំងពីរ ឬកែសម្រួលឈ្មោះសាលា ក្រសួង ពណ៌ និង Watermark
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AppleButton
            variant="secondary"
            size="sm"
            icon={<RotateCcw size={14} />}
            onClick={handleReset}
          >
            ស្តារគំរូដើម (Reset to Reference)
          </AppleButton>

          <AppleButton
            variant="primary"
            size="sm"
            icon={<Save size={14} />}
            onClick={handleSave}
          >
            រក្សាទុកគំរូ (Save)
          </AppleButton>
        </div>
      </div>

      {/* TEMPLATE PICKER (គំរូផ្លូវការទាំងពីរសម្រាប់ជ្រើសរើស) */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
          ជ្រើសរើសគំរូកាត (Select Card Template):
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PREDEFINED_TEMPLATES.map((tpl, idx) => {
            const isSelected = currentTemplate.id === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => handleSelectPredefined(tpl)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-[#0071e3] bg-blue-50/50 shadow-sm'
                    : 'border-black/[0.06] bg-white hover:border-black/20'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected ? 'bg-[#0071e3] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'
                    }`}
                  >
                    T{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#1d1d1f] font-battambang truncate">
                      {tpl.name}
                    </div>
                    <div className="text-[11px] text-[#86868b] mt-0.5 truncate">
                      {tpl.variant === 'top-photo'
                        ? `${tpl.cardWidthMm}×${tpl.cardHeightMm}mm | ${tpl.cardTitleKm}`
                        : 'រូបថតខាងក្រោម | ប័ណ្ណសម្គាល់ខ្លួនសិស្ស'}
                    </div>
                  </div>
                </div>

                {isSelected ? (
                  <CheckCircle2 size={20} className="text-[#0071e3] shrink-0" />
                ) : (
                  <span className="text-xs text-[#86868b] hover:text-[#0071e3] shrink-0">ជ្រើសរើស</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Live Preview (Left) + Editor Controls (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Live Preview */}
        <div className="lg:col-span-6 space-y-4">
          <AppleCard
            title="ទិដ្ឋភាពជាក់ស្តែង (Live Preview)"
            subtitle="កាតនឹងបង្ហាញបែបនេះពេលបង្កើត និងបោះពុម្ពចេញ"
            headerAction={
              <AppleSegmentedControl
                size="sm"
                options={[
                  { value: 'split', label: 'សងខាង' },
                  { value: 'front', label: 'មុខ' },
                  { value: 'back', label: 'ក្រោយ' },
                ]}
                value={activeSide}
                onChange={(v) => setActiveSide(v as any)}
              />
            }
          >
            <div className="p-3 sm:p-6 bg-[#f5f5f7] rounded-2xl flex flex-wrap items-center justify-center gap-4 sm:gap-6 min-h-[420px] sm:min-h-[480px] overflow-x-auto">
              {(activeSide === 'split' || activeSide === 'front') && (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#86868b]">
                    ខាងមុខ (FRONT)
                  </span>
                  <div className="shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-sm bg-white overflow-hidden transition-all">
                    <StudentCardFront
                      student={sampleStudent}
                      template={currentTemplate}
                      scale={0.88}
                      showCuttingBorder={false}
                    />
                  </div>
                </div>
              )}

              {(activeSide === 'split' || activeSide === 'back') && (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#86868b]">
                    ខាងក្រោយ (BACK)
                  </span>
                  <div className="shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-sm bg-white overflow-hidden transition-all">
                    <StudentCardBack
                      template={currentTemplate}
                      scale={0.88}
                      showCuttingBorder={false}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Change Sample Student */}
            <div className="mt-4 flex items-center justify-between text-xs text-[#86868b] pt-3 border-t border-black/[0.04]">
              <span>ទិន្នន័យតេស្ត: {sampleStudent.nameKm} (ថ្នាក់ {sampleStudent.class})</span>
              <button
                type="button"
                onClick={() => setSampleIndex((i) => (i + 1) % initialSeedStudents.length)}
                className="text-[#0071e3] font-medium hover:underline"
              >
                ប្តូរសិស្សតេស្តផ្សេង
              </button>
            </div>
          </AppleCard>
        </div>

        {/* Right: Customization Panels */}
        <div className="lg:col-span-6 space-y-4">
          <AppleCard
            title="ការកំណត់ព័ត៌មានកាត (Template Settings)"
            subtitle="កែប្រែទិន្នន័យស្ថាប័ន ឬការរចនា"
          >
            {/* Tabs */}
            <div className="flex border-b border-black/[0.06] mb-5">
              {[
                { id: 'institution', label: 'ស្ថាប័ន & សាលា' },
                { id: 'card', label: 'ចំណងជើង & ហត្ថលេខា' },
                { id: 'watermark', label: 'ផ្ទៃខាងក្រោយ & Watermark' },
                { id: 'dimensions', label: 'ខ្នាត & ពណ៌' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 text-xs font-medium border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-[#0071e3] text-[#0071e3]'
                      : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: INSTITUTION */}
            {activeTab === 'institution' && (
              <div className="space-y-4 text-xs font-battambang">
                <div>
                  <label className="block font-medium text-[#1d1d1f] mb-1">
                    ពាក្យស្លោកទី១ (Country Header 1)
                  </label>
                  <input
                    type="text"
                    value={currentTemplate.countryHeaderKm1}
                    onChange={(e) => updateTemplateField('countryHeaderKm1', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06] focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#1d1d1f] mb-1">
                    ពាក្យស្លោកទី២ (Country Header 2)
                  </label>
                  <input
                    type="text"
                    value={currentTemplate.countryHeaderKm2}
                    onChange={(e) => updateTemplateField('countryHeaderKm2', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06] focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#1d1d1f] mb-1">
                    មន្ទីរអប់រំ ឬស្ថាប័នគ្រប់គ្រង (Department)
                  </label>
                  <input
                    type="text"
                    value={currentTemplate.ministryDepartment}
                    onChange={(e) => updateTemplateField('ministryDepartment', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06] focus:ring-2 focus:ring-[#0071e3] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#1d1d1f] mb-1">
                    ឈ្មោះសាលារៀនជាក់លាក់ (School Name)
                  </label>
                  <input
                    type="text"
                    value={currentTemplate.schoolNameOnly || ''}
                    onChange={(e) => updateTemplateField('schoolNameOnly', e.target.value)}
                    placeholder="ឧ. អនុវិទ្យាល័យដំណាក់ព្រីង ឬ ដំណាក់ព្រីង"
                    className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06] focus:ring-2 focus:ring-[#0071e3] focus:outline-none font-bold"
                  />
                  <p className="text-[10px] text-[#86868b] mt-1">
                    លំនាំដើម: អនុវិទ្យាល័យដំណាក់ព្រីង (នឹងបង្ហាញនៅលើបន្ទាត់ "អនុ/វិទ្យាល័យ")
                  </p>
                </div>

                {/* ផ្នែកខាងក្រោមព្រះរាជា (Flourish Selection) */}
                <div className="pt-2 border-t border-black/[0.04]">
                  <label className="block font-medium text-[#1d1d1f] mb-1.5">
                    ក្បាច់រចនាផ្នែកខាងក្រោមព្រះរាជា (Flourish / Divider)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: '1', url: resolveFlourishUrl('1'), label: 'ក្បាច់ទី១ (Royal Floral with Dots)' },
                      { id: '2', url: resolveFlourishUrl('2'), label: 'ក្បាច់ទី២ (Calligraphic Scroll)' },
                      { id: '3', url: resolveFlourishUrl('3'), label: 'ក្បាច់ទី៣ (Ribbon Rose Scroll)' },
                      { id: '4', url: resolveFlourishUrl('4'), label: 'ក្បាច់ទី៤ (Floral Star Wave)' },
                      { id: '5', url: resolveFlourishUrl('5'), label: 'ក្បាច់ទី៥ (Khmer Royal Crest)' },
                    ].map((f) => {
                      const isSelected =
                        resolveFlourishUrl(currentTemplate.flourishUrl) === f.url;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => updateTemplateField('flourishUrl', f.url)}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all ${
                            isSelected
                              ? 'border-[#0071e3] bg-blue-50/60 shadow-sm'
                              : 'border-black/[0.06] bg-[#f5f5f7] hover:bg-[#ebebed]'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-semibold text-[#1d1d1f] block truncate mb-1">
                              {f.label}
                            </span>
                            <div className="h-6 flex items-center justify-center bg-white rounded-lg p-1 border border-black/[0.04]">
                              <img
                                src={f.url}
                                alt=""
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 size={16} className="text-[#0071e3] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CARD TITLE & SIGNATURE */}
            {activeTab === 'card' && (
              <div className="space-y-4 text-xs font-battambang">
                <div>
                  <label className="block font-medium text-[#1d1d1f] mb-1">
                    ចំណងជើងកាត (Card Title)
                  </label>
                  <input
                    type="text"
                    value={currentTemplate.cardTitleKm}
                    onChange={(e) => updateTemplateField('cardTitleKm', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06] focus:ring-2 focus:ring-[#0071e3] focus:outline-none font-moul"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#1d1d1f] mb-1">
                    បន្ទាត់កាលបរិច្ឆេទចេញកាត (Issue Date Line)
                  </label>
                  <input
                    type="text"
                    value={currentTemplate.issueDateLine}
                    onChange={(e) => updateTemplateField('issueDateLine', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06] focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#1d1d1f] mb-1">
                      តួនាទីអ្នកចុះហត្ថលេខា (Director Title)
                    </label>
                    <input
                      type="text"
                      value={currentTemplate.directorTitle}
                      onChange={(e) => updateTemplateField('directorTitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06] focus:ring-2 focus:ring-[#0071e3] focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#1d1d1f] mb-1">
                      ឈ្មោះនាយក (Director Name)
                    </label>
                    <input
                      type="text"
                      value={currentTemplate.directorName || ''}
                      onChange={(e) => updateTemplateField('directorName', e.target.value)}
                      placeholder="ឧ. ជា សារ៉ា"
                      className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06] focus:ring-2 focus:ring-[#0071e3] focus:outline-none font-bold text-[#1d1d1f]"
                    />
                    <label className="mt-1.5 flex items-center gap-2 text-[11px] text-[#1d1d1f] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!currentTemplate.showDirectorName}
                        onChange={(e) => updateTemplateField('showDirectorName', e.target.checked)}
                        className="w-4 h-4 accent-[#0071e3]"
                      />
                      បង្ហាញឈ្មោះនាយកលើកាត (Show director name)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[#1d1d1f] mb-1">
                    ចំណងជើងហត្ថលេខាសាមីខ្លួន (Student Signature Label)
                  </label>
                  <input
                    type="text"
                    value={currentTemplate.signatureTitle}
                    onChange={(e) => updateTemplateField('signatureTitle', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06] focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: BACK SIDE & WATERMARK */}
            {activeTab === 'watermark' && (
              <div className="space-y-4 text-xs font-battambang">
                {/* Back side layout selector */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                  <span className="font-semibold text-[#1d1d1f] block">
                    ទម្រង់ផ្នែកខាងក្រោយកាត (Back Side Format):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateTemplateField('backLayout', 'rules-and-emblem')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        (currentTemplate.backLayout || 'rules-and-emblem') === 'rules-and-emblem'
                          ? 'border-[#0071e3] bg-blue-50/70 font-bold text-[#0071e3]'
                          : 'border-black/[0.06] bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs">📜 ឡូហ្គោ + បទបញ្ជាសាលា</div>
                      <div className="text-[10px] opacity-75 font-normal mt-0.5">
                        មានបទបញ្ជា ៥ ចំណុច & លេខទូរស័ព្ទ
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateTemplateField('backLayout', 'emblem-only')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        currentTemplate.backLayout === 'emblem-only'
                          ? 'border-[#0071e3] bg-blue-50/70 font-bold text-[#0071e3]'
                          : 'border-black/[0.06] bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs">🏛️ ឡូហ្គោក្រសួងកណ្ដាល</div>
                      <div className="text-[10px] opacity-75 font-normal mt-0.5">
                        គំរូដើមរដ្ឋផ្លូវការ (Reference MoEYS)
                      </div>
                    </button>
                  </div>
                </div>

                {/* Barcode / QR Code for Back Side */}
                {(currentTemplate.backLayout || 'rules-and-emblem') !== 'emblem-only' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f5f5f7]">
                      <div>
                        <span className="font-semibold text-[#1d1d1f]">
                          បង្ហាញបាកូដ / QR កូដសម្គាល់កាត
                        </span>
                        <p className="text-[11px] text-[#86868b]">សម្រាប់ម៉ាស៊ីនស្កេនបណ្ណាល័យ ឬវត្តមាន</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={currentTemplate.showBackBarcodeOrQr ?? true}
                        onChange={(e) => updateTemplateField('showBackBarcodeOrQr', e.target.checked)}
                        className="w-4 h-4 accent-[#0071e3] rounded"
                      />
                    </div>
                  </div>
                )}

                {/* Watermark Controls */}
                <div className="pt-2 border-t border-black/[0.06]">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]">
                    <div>
                      <span className="font-semibold text-[#1d1d1f]">
                        បង្ហាញ Watermark នៅផ្ទៃខាងមុខ
                      </span>
                      <p className="text-[11px] text-[#86868b]">និមិត្តសញ្ញាក្រសួងអប់រំនៅចំកណ្តាលកាត</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentTemplate.showWatermark}
                      onChange={(e) => updateTemplateField('showWatermark', e.target.checked)}
                      className="w-4 h-4 accent-[#0071e3] rounded"
                    />
                  </div>

                  {currentTemplate.showWatermark && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-medium text-[#1d1d1f]">
                          កម្រិតភាពច្បាស់ Watermark ({Math.round(currentTemplate.watermarkOpacity * 100)}%)
                        </label>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.40"
                        step="0.01"
                        value={currentTemplate.watermarkOpacity}
                        onChange={(e) =>
                          updateTemplateField('watermarkOpacity', parseFloat(e.target.value))
                        }
                        className="w-full accent-[#0071e3]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: DIMENSIONS, PHOTO BOX & COLOR */}
            {activeTab === 'dimensions' && (
              <div className="space-y-5 text-xs font-battambang">
                {/* 1. Quick Sheet Layout Switcher (9 on A4 vs 4 on A4) */}
                <div className="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#163d7e]">
                      ប្លង់បោះពុម្ពលើក្រដាស A4 (A4 Sheet Layout):
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCardDimensions(64, 92);
                        addToast({
                          type: 'info',
                          title: 'បានជ្រើសរើស ៩ កាតលើ A4',
                          message: 'ទំហំស្តង់ដារ MoEYS ៦៤ × ៩២ mm (៣ ជួរ × ៣ ជួរ = ៩ កាត)',
                        });
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        currentTemplate.cardWidthMm === 64 && currentTemplate.cardHeightMm === 92
                          ? 'border-[#0071e3] bg-white shadow-sm ring-2 ring-[#0071e3]/20'
                          : 'border-blue-200 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div className="font-bold text-xs text-[#1d1d1f]">១ សន្លឹក ៩ កាត</div>
                      <div className="text-[10px] text-[#0071e3] font-sans font-semibold">64 × 92 mm (3×3)</div>
                      <div className="text-[9.5px] text-[#86868b] mt-0.5">គំរូដើមក្រសួង សន្សំក្រដាស</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCardDimensions(95, 135);
                        addToast({
                          type: 'info',
                          title: 'បានជ្រើសរើស ៤ កាតលើ A4',
                          message: 'ខ្នាតធំ ៩៥ × ១៣៥ mm (២ ជួរ × ២ ជួរ = ៤ កាត)',
                        });
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        currentTemplate.cardWidthMm === 95 && currentTemplate.cardHeightMm === 135
                          ? 'border-[#0071e3] bg-white shadow-sm ring-2 ring-[#0071e3]/20'
                          : 'border-blue-200 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div className="font-bold text-xs text-[#1d1d1f]">១ សន្លឹក ៤ កាត</div>
                      <div className="text-[10px] text-[#0071e3] font-sans font-semibold">95 × 135 mm (2×2)</div>
                      <div className="text-[9.5px] text-[#86868b] mt-0.5">ខ្នាតធំច្បាស់ បិទរូប 3x4 ទូលាយ</div>
                    </button>
                  </div>
                </div>

                {/* 2. Card Size Presets */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                      <span>ទំហំខ្នាតកាតសិស្សលម្អិត (All Size Presets)</span>
                      <AppleBadge variant="blue" size="sm">
                        {currentTemplate.cardWidthMm} × {currentTemplate.cardHeightMm} mm
                      </AppleBadge>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {CARD_SIZE_PRESETS.map((preset) => {
                      const isSelected =
                        currentTemplate.cardWidthMm === preset.widthMm &&
                        currentTemplate.cardHeightMm === preset.heightMm;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setCardDimensions(preset.widthMm, preset.heightMm, {
                              whiteMarginMm: preset.whiteMarginMm,
                              photoWidthMm: preset.photoWidthMm,
                              photoHeightMm: preset.photoHeightMm,
                            });
                            addToast({
                              type: 'info',
                              title: 'បានប្តូរទំហំកាត',
                              message: `បានជ្រើសរើស: ${preset.nameKm} (${preset.widthMm} × ${preset.heightMm} mm)`,
                            });
                          }}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-[#0071e3] bg-blue-50/70 shadow-sm'
                              : 'border-black/[0.06] bg-[#f5f5f7] hover:bg-[#ebebed]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#1d1d1f] text-xs">
                              {preset.nameKm}
                            </span>
                            {isSelected && (
                              <CheckCircle2 size={16} className="text-[#0071e3]" />
                            )}
                          </div>
                          <div className="text-[11px] font-semibold text-[#0071e3] mt-0.5 font-sans">
                            {preset.whiteMarginMm
                              ? `ស៊ុម ${preset.widthMm - 2 * preset.whiteMarginMm} × ${preset.heightMm - 2 * preset.whiteMarginMm} mm (+ គែមស ${preset.whiteMarginMm} mm = ${preset.widthMm} × ${preset.heightMm})`
                              : `${preset.widthMm} mm × ${preset.heightMm} mm`}
                          </div>
                          <p className="text-[10px] text-[#86868b] mt-1 line-clamp-1">
                            {preset.descriptionKm}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Dimensions Input */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                  <span className="text-[11px] font-semibold text-[#1d1d1f] block">
                    កំណត់ទំហំដោយដៃ (Custom Dimensions in mm):
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#86868b] mb-1">
                        ទទឹងកាត (Width in mm)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={currentTemplate.cardWidthMm}
                        onChange={(e) => {
                          const w = parseFloat(e.target.value) || 64;
                          setCardDimensions(w, currentTemplate.cardHeightMm);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.1] focus:ring-2 focus:ring-[#0071e3] focus:outline-none text-xs font-sans font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#86868b] mb-1">
                        កម្ពស់កាត (Height in mm)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={currentTemplate.cardHeightMm}
                        onChange={(e) => {
                          const h = parseFloat(e.target.value) || 92;
                          setCardDimensions(currentTemplate.cardWidthMm, h);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.1] focus:ring-2 focus:ring-[#0071e3] focus:outline-none text-xs font-sans font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Photo Box Size (EXACT 3cm x 4cm) */}
                <div className="pt-2 border-t border-black/[0.04]">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                        <span>ប្រអប់បិទរូបថត (Photo Box Size)</span>
                        <AppleBadge variant="green" size="sm">
                          សុក្រិត {currentTemplate.photoBoxWidthMm || 30} × {currentTemplate.photoBoxHeightMm || 40} mm
                        </AppleBadge>
                      </label>
                      <p className="text-[10px] text-[#86868b] mt-0.5">
                        ស្តង់ដាររូបថត 3 x 4 សុក្រិត (3.0 cm × 4.0 cm) សម្រាប់បិទរូបថតពិតប្រាកដមិនហៀរ
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#86868b] mb-1">
                        ទទឹងរូបថត (Width in mm)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={currentTemplate.photoBoxWidthMm || 30}
                        onChange={(e) =>
                          updateTemplateField('photoBoxWidthMm', parseFloat(e.target.value) || 30)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06] text-xs font-sans font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#86868b] mb-1">
                        កម្ពស់រូបថត (Height in mm)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={currentTemplate.photoBoxHeightMm || 40}
                        onChange={(e) =>
                          updateTemplateField('photoBoxHeightMm', parseFloat(e.target.value) || 40)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06] text-xs font-sans font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Official Ink Blue Color */}
                <div className="pt-2 border-t border-black/[0.04]">
                  <label className="block font-medium text-[#1d1d1f] mb-1">
                    ពណ៌ទឹកថ្នាំផ្លូវការ (Ink Blue Color)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={currentTemplate.primaryColor}
                      onChange={(e) => updateTemplateField('primaryColor', e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-black/10"
                    />
                    <input
                      type="text"
                      value={currentTemplate.primaryColor}
                      onChange={(e) => updateTemplateField('primaryColor', e.target.value)}
                      className="px-3 py-2 rounded-xl bg-[#f5f5f7] border border-black/[0.06] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </AppleCard>
        </div>
      </div>
    </div>
  );
};
