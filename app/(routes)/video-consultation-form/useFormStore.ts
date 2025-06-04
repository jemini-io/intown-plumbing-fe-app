import { create } from 'zustand';
import { FormData } from './types';

interface Technician {
  id: string;
  name: string;
}

interface TimeSlot {
  time: string;
  technicians: Technician[];
}

interface AvailableTimeSlots {
  date: string;
  timeSlots: TimeSlot[];
}

export type FormStep = 'service' | 'date' | 'contact' | 'confirmation';

interface FormStore {
  // Step navigation
  currentStep: FormStep;
  setCurrentStep: (step: FormStep) => void;
  
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
  
  // Time slots and technician selection
  availableTimeSlots: AvailableTimeSlots[];
  selectedDate: string | null;
  selectedTimeSlot: TimeSlot | null;
  selectedTechnician: Technician | null;
  isLoading: boolean;
  setAvailableTimeSlots: (slots: AvailableTimeSlots[]) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTimeSlot: (slot: TimeSlot | null) => void;
  setSelectedTechnician: (technician: Technician | null) => void;
  setIsLoading: (loading: boolean) => void;
  
  // Confirmation
  jobId: string | null;
  setJobId: (id: string | null) => void;
  
  // Reset form
  resetForm: () => void;
}

const initialState = {
  currentStep: 'service' as FormStep,
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
  selectedTimeSlot: null,
  selectedTechnician: null,
  isLoading: true,
  jobId: null,
};

export const useFormStore = create<FormStore>((set) => ({
  ...initialState,
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),
  
  setSelectedService: (service) => set({ selectedService: service }),
  setSelectedSubService: (subService) => set({ selectedSubService: subService }),
  setDetails: (details) => set({ details }),
  
  setAvailableTimeSlots: (slots) => set({ availableTimeSlots: slots }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
  setSelectedTechnician: (technician) => set({ selectedTechnician: technician }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setJobId: (id) => set({ jobId: id }),
  
  resetForm: () => set(initialState),
})); 