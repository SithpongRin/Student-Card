import React, { useState, useEffect } from 'react';
import { Student } from '../../types/student';
import { AppleModal } from '../common/AppleModal';
import { AppleButton } from '../common/AppleButton';
import { db } from '../../db/database';
import { Upload, X, User } from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  studentToEdit?: Student;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  studentToEdit,
}) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    studentId: '',
    cardNumber: '',
    nameKm: '',
    nameEn: '',
    gender: 'ប្រុស',
    nationality: 'ខ្មែរ',
    dateOfBirth: '',
    placeOfBirth: '',
    class: '១០A',
    academicYear: '២០២៤ - ២០២៥',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    address: '',
    phone: '',
    photoUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (studentToEdit) {
      setFormData({ ...studentToEdit });
    } else {
      setFormData({
        studentId: '',
        cardNumber: '',
        nameKm: '',
        nameEn: '',
        gender: 'ប្រុស',
        nationality: 'ខ្មែរ',
        dateOfBirth: '',
        placeOfBirth: '',
        class: '១០A',
        academicYear: '២០២៤ - ២០២៥',
        fatherName: '',
        fatherOccupation: '',
        motherName: '',
        motherOccupation: '',
        address: '',
        phone: '',
        photoUrl: '',
      });
    }
    setErrors({});
  }, [studentToEdit, isOpen]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('សូមជ្រើសរើសឯកសាររូបភាព (Image file) ប៉ុណ្ណោះ');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, photoUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.nameKm?.trim()) {
      newErrors.nameKm = 'សូមបញ្ចូលឈ្មោះជាភាសាខ្មែរ';
    }
    if (!formData.studentId?.trim()) {
      newErrors.studentId = 'សូមបញ្ចូលអត្តលេខសិស្ស';
    } else {
      // Check duplicate ID
      const existing = await db.students.where('studentId').equals(formData.studentId.trim()).first();
      if (existing && existing.id !== studentToEdit?.id) {
        newErrors.studentId = 'អត្តលេខនេះមានក្នុងប្រព័ន្ធរួចហើយ';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const now = Date.now();
      const payload: Student = {
        studentId: formData.studentId!.trim(),
        cardNumber: formData.cardNumber?.trim() || '',
        nameKm: formData.nameKm!.trim(),
        nameEn: formData.nameEn?.trim() || '',
        gender: formData.gender || 'ប្រុស',
        nationality: formData.nationality || 'ខ្មែរ',
        dateOfBirth: formData.dateOfBirth?.trim() || '',
        placeOfBirth: formData.placeOfBirth?.trim() || '',
        class: formData.class?.trim() || '១០A',
        academicYear: formData.academicYear?.trim() || '២០២៤ - ២០២៥',
        fatherName: formData.fatherName?.trim() || '',
        fatherOccupation: formData.fatherOccupation?.trim() || '',
        motherName: formData.motherName?.trim() || '',
        motherOccupation: formData.motherOccupation?.trim() || '',
        address: formData.address?.trim() || '',
        phone: formData.phone?.trim() || '',
        photoUrl: formData.photoUrl || '',
        createdAt: studentToEdit?.createdAt || now,
        updatedAt: now,
      };

      if (studentToEdit?.id) {
        payload.id = studentToEdit.id;
        await db.students.put(payload);
      } else {
        await db.students.add(payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error('Save student error:', err);
      alert('មានបញ្ហាក្នុងការរក្សាទុក');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppleModal
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? 'កែសម្រួលព័ត៌មានសិស្ស' : 'បន្ថែមសិស្សថ្មី'}
      subtitle={studentToEdit ? `កែសម្រួលទិន្នន័យ ${studentToEdit.nameKm}` : 'បញ្ចូលព័ត៌មានលម្អិតសិស្សសម្រាប់បង្កើតកាត'}
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <AppleButton variant="secondary" onClick={onClose} type="button">
            បោះបង់
          </AppleButton>
          <AppleButton variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកទិន្នន័យ'}
          </AppleButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload & Basic Info Row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-4 bg-[#f5f5f7] rounded-2xl border border-black/[0.04]">
          {/* Photo Placeholder Box (3x4 proportion) */}
          <div className="relative w-24 h-32 bg-white rounded-xl border border-dashed border-[#86868b] flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {formData.photoUrl ? (
              <>
                <img
                  src={formData.photoUrl}
                  alt="Student Photo"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center p-2 text-center w-full h-full text-[#86868b] hover:text-[#0071e3] transition-colors">
                <User size={28} className="mb-1 opacity-50" />
                <span className="text-[10px] font-medium">ជ្រើសរូបថត</span>
                <span className="text-[9px] text-[#86868b]">(មិនតម្រូវ)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex-1 space-y-3 w-full">
            <p className="text-xs text-[#6e6e73]">
              * រូបថតសិស្សជាជម្រើសមិនតម្រូវ។ បើគ្មានរូបថត ប្រព័ន្ធនឹងទុកប្រអប់ទទេ "3 x 4" ដើម្បីបិទរូបថតជាក់ស្តែងក្រោយពេលបោះពុម្ព។
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
                  អត្តលេខសិស្ស (ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.studentId || ''}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="ឧ. KDL-2024-001"
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${
                    errors.studentId ? 'border-red-500' : 'border-black/[0.1]'
                  } focus:outline-none focus:ring-2 focus:ring-[#0071e3]`}
                />
                {errors.studentId && <p className="text-[10px] text-red-500 mt-0.5">{errors.studentId}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
                  លេខកាត (Card No.)
                </label>
                <input
                  type="text"
                  value={formData.cardNumber || ''}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  placeholder="ឧ. ០០១"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Student Primary Information */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
            ព័ត៌មានផ្ទាល់ខ្លួន (Personal Info)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
                គោត្តនាម និងនាម (ខ្មែរ) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nameKm || ''}
                onChange={(e) => setFormData({ ...formData, nameKm: e.target.value })}
                placeholder="ឧ. សុខ សុវណ្ណារ៉ា"
                className={`w-full px-3 py-2 rounded-xl text-xs border ${
                  errors.nameKm ? 'border-red-500' : 'border-black/[0.1]'
                } focus:outline-none focus:ring-2 focus:ring-[#0071e3] font-battambang`}
              />
              {errors.nameKm && <p className="text-[10px] text-red-500 mt-0.5">{errors.nameKm}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
                ឈ្មោះជាអក្សរឡាតាំង (English Name)
              </label>
              <input
                type="text"
                value={formData.nameEn || ''}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="SOKH SOVANNARA"
                className="w-full px-3 py-2 rounded-xl text-xs border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1">ភេទ (Gender)</label>
              <select
                value={formData.gender || 'ប្រុស'}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#0071e3] bg-white"
              >
                <option value="ប្រុស">ប្រុស (Male)</option>
                <option value="ស្រី">ស្រី (Female)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1">សញ្ជាតិ (Nationality)</label>
              <input
                type="text"
                value={formData.nationality || 'ខ្មែរ'}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
                ថ្ងៃខែឆ្នាំកំណើត (Date of Birth)
              </label>
              <input
                type="text"
                value={formData.dateOfBirth || ''}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                placeholder="ឧ. ១៥/០៤/២០០៨"
                className="w-full px-3 py-2 rounded-xl text-xs border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
                ទីកន្លែងកំណើត (Place of Birth)
              </label>
              <input
                type="text"
                value={formData.placeOfBirth || ''}
                onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                placeholder="ឧ. ឃុំព្រែកតាពៅ ស្រុកកៀនស្វាយ ខេត្តកណ្ដាល"
                className="w-full px-3 py-2 rounded-xl text-xs border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              />
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
            ព័ត៌មានសិក្សា (Academic Info)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1">ថ្នាក់ទី (Class)</label>
              <input
                type="text"
                value={formData.class || ''}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                placeholder="ឧ. ១០A"
                className="w-full px-3 py-2 rounded-xl text-xs border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
                ឆ្នាំសិក្សា (Academic Year)
              </label>
              <input
                type="text"
                value={formData.academicYear || ''}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder="ឧ. ២០២៤ - ២០២៥"
                className="w-full px-3 py-2 rounded-xl text-xs border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              />
            </div>
          </div>
        </div>

        {/* Parents and Contact */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
            ព័ត៌មានអាណាព្យាបាល & ទំនាក់ទំនង
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1">ឪពុកឈ្មោះ</label>
              <input
                type="text"
                value={formData.fatherName || ''}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="ឈ្មោះឪពុក"
                className="w-full px-3 py-2 rounded-xl text-xs border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1">មុខរបរឪពុក</label>
              <input
                type="text"
                value={formData.fatherOccupation || ''}
                onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                placeholder="ឧ. កសិករ, គ្រូបង្រៀន..."
                className="w-full px-3 py-2 rounded-xl text-xs border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1">ម្តាយឈ្មោះ</label>
              <input
                type="text"
                value={formData.motherName || ''}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                placeholder="ឈ្មោះម្តាយ"
                className="w-full px-3 py-2 rounded-xl text-xs border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1">មុខរបរម្តាយ</label>
              <input
                type="text"
                value={formData.motherOccupation || ''}
                onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                placeholder="ឧ. មេផ្ទះ, អាជីវករ..."
                className="w-full px-3 py-2 rounded-xl text-xs border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
                ទីលំនៅបច្ចុប្បន្ន (Current Address)
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="ភូមិ ឃុំ ស្រុក ខេត្ត"
                className="w-full px-3 py-2 rounded-xl text-xs border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#1d1d1f] mb-1">លេខទូរស័ព្ទ (Phone)</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="012 345 678"
                className="w-full px-3 py-2 rounded-xl text-xs border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              />
            </div>
          </div>
        </div>
      </form>
    </AppleModal>
  );
};
