import { create } from 'zustand';
import { FormData } from './types';
// import { JobType } from '@/app/api/servicetitan-api/types';
import { ServiceToJobTypeMapping, QuoteSkill } from '@/lib/utils/constants';

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

export type FormStep = 'service' | 'date' | 'contact' | 'checkout' | 'confirmation';

interface FormStore {
  // Step navigation
  currentStep: FormStep;
  setCurrentStep: (step: FormStep) => void;
  
  // Form data
  formData: FormData & {
    street: string;
    unit: string;
    city: string;
    state: string;
    zip: string;
  };
  setFormData: (data: Partial<FormData & { street: string; city: string; state: string; zip: string; }>) => void;
  
  // Job type selection
  availableJobTypes: ServiceToJobTypeMapping[];
  selectedJobType: ServiceToJobTypeMapping | null;
  details: string;
  setAvailableJobTypes: (jobTypes: ServiceToJobTypeMapping[]) => void;
  setSelectedJobType: (jobType: ServiceToJobTypeMapping | null) => void;
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

  // Selected skill
  selectedSkill: QuoteSkill | null;
  setSelectedSkill: (skill: QuoteSkill | null) => void;
}

const initialState = {
  currentStep: 'service' as FormStep,
  formData: {
    name: '',
    phone: '',
    email: '',
    street: '',
    unit: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    billToStreet: '',
    billToUnit: '',
    billToCity: '',
    billToState: '',
    billToZip: '',
    billToCountry: '',
    billToSameAsService: true,
  },
  availableJobTypes: [],
  selectedJobType: null,
  details: '',
  availableTimeSlots: [],
  selectedDate: null,
  selectedTimeSlot: null,
  selectedTechnician: null,
  isLoading: true,
  jobId: null,
  selectedSkill: null,
};

export const useFormStore = create<FormStore>((set) => ({
  ...initialState,
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),
  
  setAvailableJobTypes: (jobTypes) => set({ availableJobTypes: jobTypes }),
  setSelectedJobType: (jobType) => set({ selectedJobType: jobType }),
  setDetails: (details) => set({ details }),
  
  setAvailableTimeSlots: (slots) => set({ availableTimeSlots: slots }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
  setSelectedTechnician: (technician) => set({ selectedTechnician: technician }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setJobId: (id) => set({ jobId: id }),

  setSelectedSkill: (skill) => set({ selectedSkill: skill }),
  
  resetForm: () => set(initialState),
})); 