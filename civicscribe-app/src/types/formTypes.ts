// src/types/formTypes.ts
export interface FormSearchResult {
  id: string;
  title: string;
  formNumber: string;
  source: string;
  downloadUrl: string;
  lastUpdated: string;
  estimatedTime: string;
  requirements: string[];
  status: 'available' | 'unavailable' | 'error';
}

export interface FormAnalysis {
  formId: string;
  totalFields: number;
  requiredFields: number;
  sections: FormSection[];
  estimatedTime: string;
  requiredDocuments: string[];
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
  completed: boolean;
}

export interface FormField {
  id: string;
  formField: string;
  type: 'text' | 'ssn' | 'date' | 'number' | 'radio' | 'checkbox' | 'email' | 'phone';
  question: string;
  helpText: string;
  validation: ValidationRules;
  mapping: FieldMapping;
  options?: Option[];
}

export interface ValidationRules {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
}

export interface FieldMapping {
  formField: string;
  formSection: string;
  fieldType: string;
}

export interface Option {
  value: string;
  label: string;
}

export interface SubmissionResult {
  applicationId: string;
  status: 'submitted' | 'pending' | 'error';
  confirmation: ConfirmationDetails;
  trackingUrl: string;
  nextSteps: string[];
}

export interface ConfirmationDetails {
  email: string;
  sms: string;
  submittedAt: string;
  expectedResponse: string;
}

export interface UserAnswers {
  [fieldId: string]: any;
}

export interface AppState {
  formDiscovery: {
    searchQuery: string;
    searchResults: FormSearchResult[];
    selectedForm: FormSearchResult | null;
    isLoading: boolean;
    error: string | null;
  };
  formAnalysis: {
    currentForm: FormAnalysis | null;
    parsingStatus: 'idle' | 'parsing' | 'complete' | 'error';
    error: string | null;
  };
  formFilling: {
    currentSection: string;
    currentField: string;
    userAnswers: UserAnswers;
    progress: number;
    validationErrors: Record<string, string>;
  };
  submission: {
    submissionStatus: 'idle' | 'submitting' | 'complete' | 'error';
    applicationId: string | null;
    trackingUrl: string | null;
    confirmationDetails: ConfirmationDetails | null;
  };
  ui: {
    currentPage: 'discovery' | 'analysis' | 'filling' | 'review' | 'submission' | 'tracking';
    isLoading: boolean;
    error: string | null;
  };
}
