import { create } from 'zustand';
import { StudentFilter } from '../types/student';

interface StudentStoreState {
  selectedStudentIds: number[];
  filter: StudentFilter;
  
  toggleSelectStudent: (id: number) => void;
  selectAllStudents: (ids: number[]) => void;
  clearSelection: () => void;
  
  setSearchQuery: (query: string) => void;
  setSelectedClass: (cls: string) => void;
  setSelectedAcademicYear: (year: string) => void;
  setSelectedGender: (gender: string) => void;
  resetFilter: () => void;
}

export const useStudentStore = create<StudentStoreState>((set) => ({
  selectedStudentIds: [],
  filter: {
    searchQuery: '',
    selectedClass: '',
    selectedAcademicYear: '',
    gender: '',
  },

  toggleSelectStudent: (id) =>
    set((state) => ({
      selectedStudentIds: state.selectedStudentIds.includes(id)
        ? state.selectedStudentIds.filter((item) => item !== id)
        : [...state.selectedStudentIds, id],
    })),

  selectAllStudents: (ids) => set({ selectedStudentIds: ids }),
  clearSelection: () => set({ selectedStudentIds: [] }),

  setSearchQuery: (query) =>
    set((state) => ({ filter: { ...state.filter, searchQuery: query } })),
  setSelectedClass: (cls) =>
    set((state) => ({ filter: { ...state.filter, selectedClass: cls } })),
  setSelectedAcademicYear: (year) =>
    set((state) => ({ filter: { ...state.filter, selectedAcademicYear: year } })),
  setSelectedGender: (gender) =>
    set((state) => ({ filter: { ...state.filter, gender } })),
  resetFilter: () =>
    set({
      filter: {
        searchQuery: '',
        selectedClass: '',
        selectedAcademicYear: '',
        gender: '',
      },
    }),
}));
