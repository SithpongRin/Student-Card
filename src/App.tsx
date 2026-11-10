import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { initializeDatabase } from './db/database';
import { AppleSidebar } from './components/layout/AppleSidebar';
import { AppleHeader } from './components/layout/AppleHeader';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { StudentListView } from './components/students/StudentListView';
import { ExcelImportView } from './components/import/ExcelImportView';
import { TemplateDesigner } from './components/designer/TemplateDesigner';
import { CardGenerateView } from './components/generate/CardGenerateView';
import { PdfExportView } from './components/print/PdfExportView';
import { BackupRestoreView } from './components/backup/BackupRestoreView';
import { SettingsView } from './components/settings/SettingsView';
import { MOEYS_EMBLEM_DATA_URI } from './utils/assets';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const App: React.FC = () => {
  const { activeView, toasts, removeToast } = useAppStore();
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    initializeDatabase().then(() => {
      setIsDbReady(true);
    });
  }, []);

  if (!isDbReady) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#f5f5f7]">
        <div className="w-16 h-16 rounded-3xl bg-white shadow-md p-3 flex items-center justify-center mb-4 border border-black/[0.04] animate-pulse">
          <img
            src={MOEYS_EMBLEM_DATA_URI}
            alt="MoEYS Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="text-base font-semibold text-[#1d1d1f] font-moul tracking-wide">
          Card សិស្ស
        </h2>
        <p className="text-xs text-[#86868b] mt-1 font-battambang">
          កំពុងរៀបចំប្រព័ន្ធ និងទិន្នន័យក្នុងម៉ាស៊ីន (IndexedDB)...
        </p>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'students':
        return <StudentListView />;
      case 'import':
        return <ExcelImportView />;
      case 'designer':
        return <TemplateDesigner />;
      case 'generate':
        return <CardGenerateView />;
      case 'print':
        return <PdfExportView />;
      case 'backup':
        return <BackupRestoreView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f5f5f7] select-none">
      {/* Sleek Apple Sidebar */}
      <AppleSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Apple Translucent Sticky Header */}
        <AppleHeader />

        {/* Scrollable View Content (pb-20 for mobile bottom navigation clearance) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0">
          {renderActiveView()}
        </main>
      </div>

      {/* Sleek Mobile Bottom Navigation Bar (< md) */}
      <MobileBottomNav />

      {/* Floating Apple Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-black/[0.06] animate-in fade-in slide-in-from-bottom-3 duration-200"
          >
            {toast.type === 'success' && (
              <CheckCircle2 size={18} className="text-[#34c759] shrink-0 mt-0.5" />
            )}
            {toast.type === 'error' && (
              <AlertCircle size={18} className="text-[#ff3b30] shrink-0 mt-0.5" />
            )}
            {toast.type === 'info' && (
              <Info size={18} className="text-[#0071e3] shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#1d1d1f]">{toast.title}</div>
              {toast.message && (
                <div className="text-[11px] text-[#86868b] mt-0.5 leading-snug">
                  {toast.message}
                </div>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#86868b] hover:text-[#1d1d1f] shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
