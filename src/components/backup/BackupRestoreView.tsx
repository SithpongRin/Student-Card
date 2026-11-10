import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { useAppStore } from '../../store/useAppStore';
import { AppleCard } from '../common/AppleCard';
import { AppleButton } from '../common/AppleButton';
import { AppleBadge } from '../common/AppleBadge';
import {
  createFullBackupZip,
  restoreFromBackupZip,
  getStorageEstimate,
  StorageEstimate,
} from '../../services/backupService';
import { formatBytes, formatDateTime } from '../../utils/formatters';
import { toKhmerNumerals } from '../../utils/khmerNumerals';
import {
  HardDriveDownload,
  HardDriveUpload,
  Database,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
} from 'lucide-react';

export const BackupRestoreView: React.FC = () => {
  const { addToast } = useAppStore();

  const [storage, setStorage] = useState<StorageEstimate | null>(null);
  const [backupLogs, setBackupLogs] = useState<any[]>([]);
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  useEffect(() => {
    loadBackupData();
  }, []);

  const loadBackupData = async () => {
    try {
      const est = await getStorageEstimate();
      setStorage(est);

      const logs = await db.backupHistory.orderBy('createdAt').reverse().toArray();
      setBackupLogs(logs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    try {
      const { fileName, sizeBytes } = await createFullBackupZip();
      addToast({
        type: 'success',
        title: 'បម្រុងទុកជោគជ័យ!',
        message: `បានទាញយកឯកសារ ${fileName} (${formatBytes(sizeBytes)})`,
      });
      await loadBackupData();
    } catch (e: any) {
      console.error(e);
      alert('មានបញ្ហាក្នុងការបង្កើត Backup: ' + (e?.message || 'Error'));
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('ការស្តារទិន្នន័យពី Backup នឹងជំនួសទិន្នន័យបច្ចុប្បន្ន។ តើអ្នកពិតជាចង់បន្តមែនទេ?')) {
      e.target.value = '';
      return;
    }

    setIsRestoring(true);
    try {
      const res = await restoreFromBackupZip(file);
      addToast({
        type: 'success',
        title: 'ស្តារទិន្នន័យជោគជ័យ!',
        message: `បានស្តារសិស្សចំនួន ${res.studentCount} នាក់ និងគំរូចំនួន ${res.templateCount}`,
      });
      await loadBackupData();
    } catch (e: any) {
      console.error(e);
      alert('មានបញ្ហាក្នុងការស្តារទិន្នន័យ: ' + (e?.message || 'Error'));
    } finally {
      setIsRestoring(false);
      e.target.value = '';
    }
  };

  const handleClearDatabase = async () => {
    if (
      !confirm(
        'ប្រុងប្រយ័ត្ន! តើអ្នកពិតជាចង់សម្អាតទិន្នន័យសិស្សទាំងអស់មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ បើគ្មានឯកសារ Backup!'
      )
    ) {
      return;
    }
    await db.students.clear();
    await db.importHistory.clear();
    addToast({
      type: 'info',
      title: 'បានសម្អាតទិន្នន័យ',
      message: 'ទិន្នន័យសិស្សទាំងអស់ត្រូវបានលុបចេញពី IndexedDB',
    });
    await loadBackupData();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#1d1d1f] font-moul tracking-wide">
          បម្រុងទុក & ស្តារទិន្នន័យ (Backup & Restore)
        </h1>
        <p className="text-xs text-[#86868b] mt-0.5">
          ទាញយកឯកសារ ZIP ផ្ទុកទិន្នន័យទាំងអស់សម្រាប់រក្សាទុក ឬផ្ទេរទៅកាន់កុំព្យូទ័រផ្សេងដោយមិនប្រើអ៊ីនធឺណិត
        </p>
      </div>

      {/* Storage Monitoring Banner */}
      {storage && (
        <AppleCard>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0071e3] shrink-0">
                <Database size={24} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#1d1d1f]">
                  ទំហំផ្ទុក IndexedDB ក្នុងកម្មវិធីរុករក (Local Storage)
                </h3>
                <p className="text-xs text-[#86868b] mt-0.5">
                  បានប្រើ {formatBytes(storage.usageBytes)} នៃកូតា {formatBytes(storage.quotaBytes)} ({storage.percentUsed}%)
                </p>
              </div>
            </div>

            <div className="w-full sm:w-48 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#86868b]">
                <span>ការប្រើប្រាស់</span>
                <span>{storage.percentUsed}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#f5f5f7] overflow-hidden">
                <div
                  className="h-full bg-[#0071e3] rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(2, storage.percentUsed)}%` }}
                />
              </div>
            </div>
          </div>
        </AppleCard>
      )}

      {/* Main Actions: Backup & Restore */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Backup Card */}
        <AppleCard className="flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0071e3] mb-4">
              <HardDriveDownload size={24} />
            </div>
            <h3 className="text-base font-semibold text-[#1d1d1f]">
              ទាញយក Backup ពេញលេញ (Full Backup)
            </h3>
            <p className="text-xs text-[#86868b] mt-1.5 leading-relaxed">
              បង្កើតឯកសារ ZIP ដែលផ្ទុកទិន្នន័យសិស្សទាំងអស់ ថ្នាក់រៀន គំរូកាត និងការកំណត់ផ្សេងៗ
              ដើម្បីទុកជាឯកសារយោង ឬបម្រុងទុកសុវត្ថិភាព។
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-black/[0.04]">
            <AppleButton
              variant="primary"
              className="w-full"
              icon={<HardDriveDownload size={16} />}
              onClick={handleCreateBackup}
              disabled={isBackingUp}
            >
              {isBackingUp ? 'កំពុងបង្កើត ZIP...' : 'ទាញយក Backup ឥឡូវនេះ (ZIP)'}
            </AppleButton>
          </div>
        </AppleCard>

        {/* Restore Card */}
        <AppleCard className="flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
              <HardDriveUpload size={24} />
            </div>
            <h3 className="text-base font-semibold text-[#1d1d1f]">
              ស្តារទិន្នន័យពី Backup (Restore)
            </h3>
            <p className="text-xs text-[#86868b] mt-1.5 leading-relaxed">
              ជ្រើសរើសឯកសារ ZIP ដែលបានបម្រុងទុកពីមុន ដើម្បីបញ្ចូលទិន្នន័យសិស្ស
              និងគំរូកាតមកកាន់កុំព្យូទ័រនេះវិញ។
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-black/[0.04]">
            <label className="w-full block cursor-pointer">
              <input
                type="file"
                accept=".zip"
                onChange={handleRestoreFile}
                className="hidden"
                disabled={isRestoring}
              />
              <span className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#f5f5f7] hover:bg-[#ebebed] text-[#1d1d1f] text-sm font-medium border border-black/[0.04] transition-all">
                <HardDriveUpload size={16} />
                <span>{isRestoring ? 'កំពុងស្តារ...' : 'ជ្រើសឯកសារ ZIP ដើម្បីស្តារ'}</span>
              </span>
            </label>
          </div>
        </AppleCard>
      </div>

      {/* Backup History */}
      <AppleCard title="ប្រវត្តិនៃការបម្រុងទុក (Backup History)">
        <div className="space-y-3">
          {backupLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#f5f5f7] text-xs font-battambang"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-[#34c759]" />
                <div>
                  <div className="font-semibold text-[#1d1d1f] font-sans">{log.fileName}</div>
                  <div className="text-[11px] text-[#86868b] flex items-center gap-2 mt-0.5">
                    <span>{formatDateTime(log.createdAt)}</span>
                    <span>•</span>
                    <span>{toKhmerNumerals(log.recordCount)} សិស្ស</span>
                  </div>
                </div>
              </div>

              <span className="text-[#86868b] font-mono text-xs">
                {formatBytes(log.sizeBytes)}
              </span>
            </div>
          ))}

          {backupLogs.length === 0 && (
            <div className="py-8 text-center text-xs text-[#86868b]">
              មិនទាន់មានប្រវត្តិបម្រុងទុកនៅឡើយទេ។
            </div>
          )}
        </div>
      </AppleCard>

      {/* Danger Zone: Clear DB */}
      <div className="p-6 rounded-2xl border border-red-200 bg-red-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-red-900 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600" />
            <span>សម្អាតមូលដ្ឋានទិន្នន័យ (Clear Database)</span>
          </h4>
          <p className="text-xs text-red-700 mt-1">
            លុបកំណត់ត្រាសិស្សទាំងអស់ចេញពីកម្មវិធីរុករក។ សូមបម្រុងទុកទិន្នន័យជាមុន!
          </p>
        </div>

        <AppleButton variant="danger" size="sm" onClick={handleClearDatabase}>
          សម្អាតទិន្នន័យសិស្ស
        </AppleButton>
      </div>
    </div>
  );
};
