export interface Student {
  id?: number;
  studentId: string; // Unique student identifier (e.g. 2024001, KDL-1001)
  nameKm: string;    // គោត្តនាម-នាម ជាភាសាខ្មែរ
  nameEn?: string;   // English Name (optional)
  gender: 'ប្រុស' | 'ស្រី' | string; // ភេទ
  nationality?: string; // សញ្ជាតិ (default: ខ្មែរ)
  dateOfBirth: string; // ថ្ងៃខែឆ្នាំកំណើត (e.g. 15/04/2008)
  placeOfBirth?: string; // ទីកន្លែងកំណើត
  class: string;     // ថ្នាក់ទី (e.g. 10A, 7B)
  academicYear: string; // ឆ្នាំសិក្សា (e.g. 2024-2025 or ២០២៤-២០២៥)
  fatherName?: string; // ឪពុកឈ្មោះ
  fatherOccupation?: string; // មុខរបរឪពុក
  motherName?: string; // ម្តាយឈ្មោះ
  motherOccupation?: string; // មុខរបរម្តាយ
  address?: string;    // ទីលំនៅបច្ចុប្បន្ន
  phone?: string;      // លេខទូរស័ព្ទ
  photoUrl?: string;   // Data URL or object URL (optional)
  photoBlob?: Blob;    // Stored blob (optional)
  cardNumber?: string; // លេខកាត (e.g. 001)
  createdAt: number;
  updatedAt: number;
}

export type StudentFilter = {
  searchQuery: string;
  selectedClass: string;
  selectedAcademicYear: string;
  gender: string;
};
