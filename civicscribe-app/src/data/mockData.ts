// src/data/mockData.ts
import { FormSearchResult, FormAnalysis, FormField } from '@/types/formTypes';

export const mockFormSearchResults: FormSearchResult[] = [
  {
    id: 'snap-001',
    title: 'SNAP Benefits Application',
    formNumber: 'SNAP-001',
    source: 'USDA.gov',
    downloadUrl: 'https://fns.usda.gov/snap/application-form',
    lastUpdated: '2023-12-15',
    estimatedTime: '15 minutes',
    requirements: ['Income verification', 'Household size', 'Citizenship status'],
    status: 'available'
  },
  {
    id: 'wic-2024',
    title: 'WIC Application',
    formNumber: 'WIC-2024',
    source: 'USDA.gov',
    downloadUrl: 'https://fns.usda.gov/wic/application-form',
    lastUpdated: '2024-01-10',
    estimatedTime: '12 minutes',
    requirements: ['Income verification', 'Pregnancy status', 'Child age'],
    status: 'available'
  },
  {
    id: 'efa-001',
    title: 'Emergency Food Assistance',
    formNumber: 'EFA-001',
    source: 'FEMA.gov',
    downloadUrl: 'https://fema.gov/emergency-food-assistance',
    lastUpdated: '2023-11-20',
    estimatedTime: '8 minutes',
    requirements: ['Emergency status', 'Income verification', 'Address proof'],
    status: 'available'
  },
  {
    id: 'medicaid-001',
    title: 'Medicaid Application',
    formNumber: 'MED-001',
    source: 'CMS.gov',
    downloadUrl: 'https://cms.gov/medicaid/application-form',
    lastUpdated: '2024-01-05',
    estimatedTime: '20 minutes',
    requirements: ['Income verification', 'Citizenship status', 'Medical history', 'Insurance information'],
    status: 'available'
  },
  {
    id: 'chip-2024',
    title: 'Children\'s Health Insurance Program',
    formNumber: 'CHIP-2024',
    source: 'CMS.gov',
    downloadUrl: 'https://cms.gov/chip/application-form',
    lastUpdated: '2024-01-08',
    estimatedTime: '18 minutes',
    requirements: ['Child\'s birth certificate', 'Income verification', 'Proof of residence'],
    status: 'available'
  },
  {
    id: 'aca-001',
    title: 'Affordable Care Act Marketplace Application',
    formNumber: 'ACA-001',
    source: 'Healthcare.gov',
    downloadUrl: 'https://healthcare.gov/marketplace/application',
    lastUpdated: '2024-01-12',
    estimatedTime: '25 minutes',
    requirements: ['Social Security Number', 'Income information', 'Tax filing status'],
    status: 'available'
  },
  {
    id: 'housing-001',
    title: 'Section 8 Housing Assistance Application',
    formNumber: 'HUD-001',
    source: 'HUD.gov',
    downloadUrl: 'https://hud.gov/section8/application-form',
    lastUpdated: '2023-12-20',
    estimatedTime: '30 minutes',
    requirements: ['Income verification', 'Background check', 'Proof of citizenship', 'Rental history'],
    status: 'available'
  },
  {
    id: 'unemployment-001',
    title: 'Unemployment Benefits Application',
    formNumber: 'UI-001',
    source: 'DOL.gov',
    downloadUrl: 'https://dol.gov/unemployment/application',
    lastUpdated: '2024-01-15',
    estimatedTime: '15 minutes',
    requirements: ['Employment history', 'Reason for separation', 'Bank account information'],
    status: 'available'
  },
  {
    id: 'tax-1040',
    title: 'Individual Income Tax Return',
    formNumber: '1040',
    source: 'IRS.gov',
    downloadUrl: 'https://irs.gov/forms/1040',
    lastUpdated: '2024-01-10',
    estimatedTime: '45 minutes',
    requirements: ['W-2 forms', '1099 forms', 'Bank statements', 'Receipts for deductions'],
    status: 'available'
  }
];

export const mockFormAnalysis: FormAnalysis = {
  formId: 'snap-001',
  totalFields: 12,
  requiredFields: 8,
  sections: [
    {
      id: 'personal-info',
      title: 'Personal Information',
      fields: [
        {
          id: 'full-name',
          formField: 'applicant_name',
          type: 'text',
          question: "What's your full name?",
          helpText: "This will go in the 'Full Name' field on the official form",
          validation: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: '^[a-zA-Z\\s]+$'
          },
          mapping: {
            formField: 'applicant_name',
            formSection: 'Section 1: Personal Information',
            fieldType: 'text'
          }
        },
        {
          id: 'ssn',
          formField: 'social_security_number',
          type: 'ssn',
          question: "What's your Social Security Number?",
          helpText: "This is required for the SNAP application",
          validation: {
            required: true,
            pattern: '^\\d{3}-\\d{2}-\\d{4}$'
          },
          mapping: {
            formField: 'social_security_number',
            formSection: 'Section 1: Personal Information',
            fieldType: 'ssn'
          }
        },
        {
          id: 'date-of-birth',
          formField: 'date_of_birth',
          type: 'date',
          question: "What's your date of birth?",
          helpText: "We need this to verify your age eligibility",
          validation: {
            required: true
          },
          mapping: {
            formField: 'date_of_birth',
            formSection: 'Section 1: Personal Information',
            fieldType: 'date'
          }
        },
        {
          id: 'email',
          formField: 'email_address',
          type: 'email',
          question: "What's your email address?",
          helpText: "We'll send you updates about your application",
          validation: {
            required: false,
            pattern: '^[^@]+@[^@]+\\.[^@]+$'
          },
          mapping: {
            formField: 'email_address',
            formSection: 'Section 1: Personal Information',
            fieldType: 'email'
          }
        }
      ],
      completed: false
    },
    {
      id: 'household-details',
      title: 'Household Details',
      fields: [
        {
          id: 'household-size',
          formField: 'household_size',
          type: 'number',
          question: "How many people live in your household?",
          helpText: "Include yourself and all family members who live with you",
          validation: {
            required: true,
            min: 1,
            max: 20
          },
          mapping: {
            formField: 'household_size',
            formSection: 'Section 2: Household Information',
            fieldType: 'number'
          }
        },
        {
          id: 'dependents',
          formField: 'number_of_dependents',
          type: 'number',
          question: "How many dependents under 18 do you have?",
          helpText: "This affects your benefit calculation",
          validation: {
            required: true,
            min: 0,
            max: 10
          },
          mapping: {
            formField: 'number_of_dependents',
            formSection: 'Section 2: Household Information',
            fieldType: 'number'
          }
        },
        {
          id: 'marital-status',
          formField: 'marital_status',
          type: 'radio',
          question: "What's your marital status?",
          helpText: "This helps determine your household composition",
          validation: {
            required: true
          },
          mapping: {
            formField: 'marital_status',
            formSection: 'Section 2: Household Information',
            fieldType: 'radio'
          },
          options: [
            { value: 'single', label: 'Single' },
            { value: 'married', label: 'Married' },
            { value: 'divorced', label: 'Divorced' },
            { value: 'widowed', label: 'Widowed' },
            { value: 'separated', label: 'Separated' }
          ]
        }
      ],
      completed: false
    },
    {
      id: 'financial-info',
      title: 'Financial Information',
      fields: [
        {
          id: 'monthly-income',
          formField: 'monthly_income',
          type: 'number',
          question: "What's your total monthly household income?",
          helpText: "Include all sources of income for everyone in your household",
          validation: {
            required: true,
            min: 0,
            max: 50000
          },
          mapping: {
            formField: 'monthly_income',
            formSection: 'Section 3: Financial Information',
            fieldType: 'number'
          }
        },
        {
          id: 'monthly-expenses',
          formField: 'monthly_expenses',
          type: 'number',
          question: "What are your total monthly expenses?",
          helpText: "Include rent, utilities, food, and other regular expenses",
          validation: {
            required: true,
            min: 0,
            max: 10000
          },
          mapping: {
            formField: 'monthly_expenses',
            formSection: 'Section 3: Financial Information',
            fieldType: 'number'
          }
        },
        {
          id: 'employment-status',
          formField: 'employment_status',
          type: 'radio',
          question: "What's your current employment status?",
          helpText: "This helps determine your eligibility",
          validation: {
            required: true
          },
          mapping: {
            formField: 'employment_status',
            formSection: 'Section 3: Financial Information',
            fieldType: 'radio'
          },
          options: [
            { value: 'employed', label: 'Employed' },
            { value: 'unemployed', label: 'Unemployed' },
            { value: 'self-employed', label: 'Self-employed' },
            { value: 'retired', label: 'Retired' },
            { value: 'disabled', label: 'Disabled' },
            { value: 'student', label: 'Student' }
          ]
        }
      ],
      completed: false
    }
  ],
  estimatedTime: '8-12 minutes',
  requiredDocuments: [
    'Photo ID',
    'Proof of Income',
    'Proof of Address'
  ]
};

export const mockSubmissionResult = {
  applicationId: 'SNAP-2024-001234',
  status: 'submitted' as const,
  confirmation: {
    email: 'john@email.com',
    sms: '(555) 123-4567',
    submittedAt: '2024-01-15T14:30:00Z',
    expectedResponse: '30 days'
  },
  trackingUrl: 'https://usda.gov/snap/status/SNAP-2024-001234',
  nextSteps: [
    'Receive confirmation letter within 7 days',
    'Schedule interview appointment',
    'Bring required documents to interview'
  ]
};
