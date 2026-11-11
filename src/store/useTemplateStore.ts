import { create } from 'zustand';
import { CardTemplate } from '../types/template';
import { PrintSettings } from '../types/print';
import { defaultReferenceTemplate } from '../db/defaultTemplates';
import { defaultPrintSettings, db } from '../db/database';
import { calculateA4GridLayout } from '../utils/cardSizes';

export interface CardExactSizeOptions {
  whiteMarginMm?: number;
  photoWidthMm?: number;
  photoHeightMm?: number;
}

interface TemplateStoreState {
  currentTemplate: CardTemplate;
  printSettings: PrintSettings;
  isCustomized: boolean;

  setTemplate: (template: CardTemplate) => void;
  updateTemplateField: <K extends keyof CardTemplate>(key: K, value: CardTemplate[K]) => void;
  setCardDimensions: (widthMm: number, heightMm: number, exact?: CardExactSizeOptions) => void;
  resetToReferenceTemplate: () => Promise<void>;
  saveTemplate: () => Promise<void>;

  setPrintSettings: (settings: PrintSettings) => void;
  updatePrintSetting: <K extends keyof PrintSettings>(key: K, value: PrintSettings[K]) => void;
  savePrintSettings: () => Promise<void>;
  resetPrintSettings: () => void;
}

export const useTemplateStore = create<TemplateStoreState>((set, get) => ({
  currentTemplate: { ...defaultReferenceTemplate },
  printSettings: { ...defaultPrintSettings },
  isCustomized: false,

  setTemplate: (template) =>
    set({
      currentTemplate: template,
      isCustomized: template.id !== defaultReferenceTemplate.id,
    }),

  updateTemplateField: (key, value) => {
    const updated = {
      ...get().currentTemplate,
      [key]: value,
      updatedAt: Date.now(),
    };
    set({
      currentTemplate: updated,
      isCustomized: true,
    });
  },

  setCardDimensions: (widthMm: number, heightMm: number, exact?: CardExactSizeOptions) => {
    const layout = calculateA4GridLayout(widthMm, heightMm);
    const updatedTemplate: CardTemplate = {
      ...get().currentTemplate,
      cardWidthMm: widthMm,
      cardHeightMm: heightMm,
      whiteMarginMm: exact?.whiteMarginMm,
      useExactPhotoSize: !!(exact?.photoWidthMm && exact?.photoHeightMm),
      ...(exact?.photoWidthMm && exact?.photoHeightMm
        ? { photoBoxWidthMm: exact.photoWidthMm, photoBoxHeightMm: exact.photoHeightMm }
        : {}),
      updatedAt: Date.now(),
    };
    const updatedPrintSettings = {
      ...get().printSettings,
      cardWidthMm: widthMm,
      cardHeightMm: heightMm,
      gridColumns: layout.cols as any,
      gridRows: layout.rows as any,
      cardsPerPage: layout.cardsPerPage as any,
      marginLeftMm: layout.marginLeftMm,
      marginTopMm: layout.marginTopMm,
    };
    set({
      currentTemplate: updatedTemplate,
      printSettings: updatedPrintSettings,
      isCustomized: true,
    });
  },

  resetToReferenceTemplate: async () => {
    const freshRef = { ...defaultReferenceTemplate, updatedAt: Date.now() };
    await db.templates.put(freshRef);
    set({
      currentTemplate: freshRef,
      isCustomized: false,
    });
  },

  saveTemplate: async () => {
    const current = get().currentTemplate;
    await db.templates.put(current);
  },

  setPrintSettings: (settings) => set({ printSettings: settings }),

  updatePrintSetting: (key, value) => {
    const updated = {
      ...get().printSettings,
      [key]: value,
    };
    set({ printSettings: updated });
  },

  savePrintSettings: async () => {
    const current = get().printSettings;
    await db.settings.put({ key: 'printSettings', value: current });
  },

  resetPrintSettings: () => set({ printSettings: { ...defaultPrintSettings } }),
}));
