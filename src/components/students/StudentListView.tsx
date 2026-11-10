import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { Student } from '../../types/student';
import { useStudentStore } from '../../store/useStudentStore';
import { useAppStore } from '../../store/useAppStore';
import { useTemplateStore } from '../../store/useTemplateStore';
import { AppleCard } from '../common/AppleCard';
import { AppleButton } from '../common/AppleButton';
import { AppleBadge } from '../common/AppleBadge';
import { StudentFormModal } from './StudentFormModal';
import { CardPreviewModal } from '../card/CardPreviewModal';
import { toKhmerNumerals, toArabicNumerals } from '../../utils/khmerNumerals';
import {
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckSquare,
  Square,
  Printer,
  CreditCard,
  Filter,
  User,
  UserPlus,
  Users,
  FileSpreadsheet,
} from 'lucide-react';

export const StudentListView: React.FC = () => {
  const { setActiveView } = useAppStore();
  const { currentTemplate } = useTemplateStore();
  const {
    selectedStudentIds,
    toggleSelectStudent,
    selectAllStudents,
    clearSelection,
    filter,
    setSearchQuery,
    setSelectedClass,
    setSelectedGender,
  } = useStudentStore();

  const [students, setStudents] = useState<Student[]>([]);
  const [classList, setClassList] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | undefined>();
  const [previewStudent, setPreviewStudent] = useState<Student | undefined>();
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const all = await db.students.toArray();
      setStudents(all);

      // Extract unique classes
      const uniqueClasses = Array.from(new Set(all.map((s) => s.class).filter(Boolean)));
      setClassList(uniqueClasses);
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm('តើអ្នកពិតជាចង់លុបទិន្នន័យសិស្សនេះមែនទេ?')) return;
    try {
      await db.students.delete(id);
      await loadStudents();
      if (selectedStudentIds.includes(id)) {
        toggleSelectStudent(id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudentIds.length === 0) return;
    if (!confirm(`តើអ្នកពិតជាចង់លុបសិស្សចំនួន ${selectedStudentIds.length} នាក់ដែលបានជ្រើសរើសមែនទេ?`)) return;
    try {
      await db.students.bulkDelete(selectedStudentIds);
      clearSelection();
      await loadStudents();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAllStudents = async () => {
    if (students.length === 0) return;
    if (!confirm('តើអ្នកពិតជាចង់លុបទិន្នន័យសិស្សទាំងអស់ចេញពីប្រព័ន្ធមែនទេ? (Clear all student data)')) return;
    try {
      await db.students.clear();
      clearSelection();
      await loadStudents();
      useAppStore.getState().addToast({
        type: 'info',
        title: 'បានសម្អាតទិន្នន័យ',
        message: 'បានលុបទិន្នន័យសិស្សទាំងអស់ចេញពីប្រព័ន្ធដោយជោគជ័យ',
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const q = filter.searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.nameKm.toLowerCase().includes(q) ||
      (s.nameEn && s.nameEn.toLowerCase().includes(q)) ||
      s.studentId.toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q));

    const matchesClass = !filter.selectedClass || s.class === filter.selectedClass;
    const matchesGender = !filter.gender || s.gender === filter.gender;

    return matchesSearch && matchesClass && matchesGender;
  });

  const isAllSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => s.id && selectedStudentIds.includes(s.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      const allIds = filteredStudents.map((s) => s.id!).filter(Boolean);
      selectAllStudents(allIds);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1d1d1f] font-moul tracking-wide">
            បញ្ជីឈ្មោះសិស្ស (Students)
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            ចំនួនសិស្សសរុប {toKhmerNumerals(students.length)} នាក់ | បង្ហាញ {toKhmerNumerals(filteredStudents.length)} នាក់
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedStudentIds.length > 0 && (
            <>
              <AppleButton
                variant="danger"
                size="sm"
                icon={<Trash2 size={14} />}
                onClick={handleBulkDelete}
              >
                លុប ({toKhmerNumerals(selectedStudentIds.length)})
              </AppleButton>

              <AppleButton
                variant="primary"
                size="sm"
                icon={<Printer size={14} />}
                onClick={() => setActiveView('print')}
              >
                បោះពុម្ព ({toKhmerNumerals(selectedStudentIds.length)})
              </AppleButton>
            </>
          )}

          {students.length > 0 && selectedStudentIds.length === 0 && (
            <AppleButton
              variant="secondary"
              size="sm"
              icon={<Trash2 size={14} className="text-red-500" />}
              onClick={handleClearAllStudents}
            >
              សម្អាតទិន្នន័យ
            </AppleButton>
          )}

          <AppleButton
            variant="secondary"
            size="sm"
            icon={<UserPlus size={14} />}
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

          <AppleButton
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => {
              setStudentToEdit(undefined);
              setIsFormOpen(true);
            }}
          >
            បន្ថែមសិស្សថ្មី
          </AppleButton>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <AppleCard className="p-4" noPadding>
        <div className="p-4 flex flex-wrap items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]"
            />
            <input
              type="text"
              value={filter.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកតាមឈ្មោះ, អត្តលេខ, ទូរស័ព្ទ..."
              className="w-full pl-9 pr-4 py-2 rounded-full text-xs bg-[#f5f5f7] border border-black/[0.04] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Class Filter */}
            <select
              value={filter.selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3.5 py-2 rounded-full text-xs bg-[#f5f5f7] border border-black/[0.04] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            >
              <option value="">ថ្នាក់ទាំងអស់ (All Classes)</option>
              {classList.map((c) => (
                <option key={c} value={c}>
                  ថ្នាក់ទី {c}
                </option>
              ))}
            </select>

            {/* Gender Filter */}
            <select
              value={filter.gender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="px-3.5 py-2 rounded-full text-xs bg-[#f5f5f7] border border-black/[0.04] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            >
              <option value="">ភេទទាំងអស់ (All Genders)</option>
              <option value="ប្រុស">ប្រុស (Male)</option>
              <option value="ស្រី">ស្រី (Female)</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-t border-b border-black/[0.06] bg-[#fbfbfe] text-[#86868b] text-[11px] font-semibold">
                <th className="py-3 px-4 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-[#6e6e73] hover:text-[#1d1d1f]"
                  >
                    {isAllSelected ? (
                      <CheckSquare size={16} className="text-[#0071e3]" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">រូបថត</th>
                <th className="py-3 px-3">អត្តលេខ</th>
                <th className="py-3 px-3">គោត្តនាម-នាម</th>
                <th className="py-3 px-3">ភេទ</th>
                <th className="py-3 px-3">ថ្ងៃខែឆ្នាំកំណើត</th>
                <th className="py-3 px-3">ថ្នាក់</th>
                <th className="py-3 px-3">ឪពុក/ម្តាយ</th>
                <th className="py-3 px-3 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] text-xs font-battambang">
              {filteredStudents.map((s) => {
                const isSelected = s.id ? selectedStudentIds.includes(s.id) : false;
                return (
                  <tr
                    key={s.id || s.studentId}
                    className={`hover:bg-[#f5f5f7]/60 transition-colors ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => s.id && toggleSelectStudent(s.id)}
                        className="text-[#6e6e73]"
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-[#0071e3]" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-3">
                      <div className="w-8 h-10 rounded-md bg-[#f5f5f7] border border-black/[0.06] overflow-hidden flex items-center justify-center">
                        {s.photoUrl ? (
                          <img
                            src={s.photoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[9px] text-[#86868b] font-sans font-bold">
                            3×4
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-medium text-[#1d1d1f] font-sans">
                      {s.studentId}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#1d1d1f] text-[13px]">{s.nameKm}</div>
                      {s.nameEn && (
                        <div className="text-[10px] text-[#86868b] font-sans">{s.nameEn}</div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <AppleBadge
                        variant={s.gender === 'ស្រី' ? 'orange' : 'blue'}
                        size="sm"
                      >
                        {s.gender}
                      </AppleBadge>
                    </td>

                    <td className="py-3 px-3 text-[#1d1d1f] font-sans">
                      {s.dateOfBirth ? toArabicNumerals(s.dateOfBirth) : '-'}
                    </td>

                    <td className="py-3 px-3 font-semibold text-[#1d1d1f] font-sans">
                      ថ្នាក់ {s.class ? toArabicNumerals(s.class) : '-'}
                    </td>

                    <td className="py-3 px-3 text-[#6e6e73] max-w-[150px] truncate">
                      {s.fatherName || s.motherName || '-'}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setPreviewStudent(s);
                            setIsPreviewOpen(true);
                          }}
                          className="p-1.5 rounded-full hover:bg-black/5 text-[#6e6e73] hover:text-[#0071e3] transition-colors"
                          title="មើលគំរូកាត (Preview)"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setStudentToEdit(s);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 rounded-full hover:bg-black/5 text-[#6e6e73] hover:text-emerald-600 transition-colors"
                          title="កែសម្រួល (Edit)"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => s.id && handleDeleteStudent(s.id)}
                          className="p-1.5 rounded-full hover:bg-black/5 text-[#6e6e73] hover:text-red-500 transition-colors"
                          title="លុប (Delete)"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0071e3] flex items-center justify-center mx-auto">
                        <Users size={24} />
                      </div>
                      <div className="text-sm font-semibold text-[#1d1d1f]">
                        {students.length === 0 ? 'មិនទាន់មានទិន្នន័យសិស្សនៅឡើយទេ' : 'មិនមានទិន្នន័យសិស្សត្រូវនឹងលក្ខខណ្ឌស្វែងរកនេះទេ'}
                      </div>
                      <p className="text-xs text-[#86868b]">
                        {students.length === 0 ? 'អ្នកអាចនាំចូលទិន្នន័យសិស្សពីឯកសារ Excel ឬបន្ថែមសិស្សដោយផ្ទាល់' : 'សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬតម្រង'}
                      </p>
                      {students.length === 0 && (
                        <div className="flex items-center justify-center gap-3 pt-2">
                          <AppleButton
                            variant="primary"
                            size="sm"
                            icon={<FileSpreadsheet size={14} />}
                            onClick={() => setActiveView('import')}
                          >
                            នាំចូលពី Excel
                          </AppleButton>
                          <AppleButton
                            variant="secondary"
                            size="sm"
                            icon={<Plus size={14} />}
                            onClick={() => {
                              setStudentToEdit(undefined);
                              setIsFormOpen(true);
                            }}
                          >
                            បន្ថែមដោយផ្ទាល់
                          </AppleButton>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AppleCard>

      {/* Edit/Add Modal */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={loadStudents}
        studentToEdit={studentToEdit}
      />

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
