import { create } from 'zustand';
import { FormData } from './types';

interface AvailableTimeSlots {
  date: string;
  timeSlots: string[];
}

interface FormStore {
  // Form data
  formData: FormData & {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  setFormData: (data: Partial<FormData & { street: string; city: string; state: string; zip: string; }>) => void;
  
  // Service selection
  selectedService: string | null;
  selectedSubService: string | null;
  details: string;
  setSelectedService: (service: string | null) => void;
  setSelectedSubService: (subService: string | null) => void;
  setDetails: (details: string) => void;
  
  // Time slots
  availableTimeSlots: AvailableTimeSlots[];
  selectedDate: string | null;
  isLoading: boolean;
  setAvailableTimeSlots: (slots: AvailableTimeSlots[]) => void;
  setSelectedDate: (date: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  
  // Reset form
  resetForm: () => void;
}

const initialState = {
  formData: {
    name: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zip: '',
  },
  selectedService: null,
  selectedSubService: null,
  details: '',
  availableTimeSlots: [],
  selectedDate: null,
  isLoading: true,
};

export const useFormStore = create<FormStore>((set) => ({
  ...initialState,
  
  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),
  
  setSelectedService: (service) => set({ selectedService: service }),
  setSelectedSubService: (subService) => set({ selectedSubService: subService }),
  setDetails: (details) => set({ details }),
  
  setAvailableTimeSlots: (slots) => set({ availableTimeSlots: slots }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  resetForm: () => set(initialState),
})); 