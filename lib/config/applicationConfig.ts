import type {
  Employee,
  FilePolicy,
  MetadataField,
  RoleId,
  RouteConfig,
  VettingQuestion,
} from '../types/domain';

export const metadataFields: MetadataField[] = [
  {
    key: 'document_title',
    label: 'Document title',
    type: 'text',
    required: true,
  },
  {
    key: 'document_description',
    label: 'Description',
    type: 'textarea',
    required: true,
  },
  {
    key: 'document_date',
    label: 'Document date',
    type: 'date',
    required: true,
  },
  {
    key: 'business_unit',
    label: 'Business unit',
    type: 'select',
    required: true,
    options: ['Finance', 'Operations', 'HR', 'Procurement'],
  },
  { key: 'process_name', label: 'Process name', type: 'text', required: true },
  {
    key: 'document_owner',
    label: 'Document owner',
    type: 'text',
    required: true,
  },
  {
    key: 'source_system',
    label: 'Source system',
    type: 'text',
    required: true,
  },
  {
    key: 'confidentiality',
    label: 'Confidentiality',
    type: 'select',
    required: true,
    options: ['Internal', 'Confidential', 'Restricted'],
  },
  {
    key: 'effective_date',
    label: 'Effective date',
    type: 'date',
    required: true,
  },
  {
    key: 'tags',
    label: 'Tags',
    type: 'tags',
    required: false,
    helpText: 'Comma-separated keywords',
  },
];

export const vettingQuestions: VettingQuestion[] = [
  {
    questionId: 'Q1',
    key: 'business_process',
    label: 'What business process does this document support?',
    type: 'select',
    required: true,
    options: [
      'Record to Report',
      'Procure to Pay',
      'Hire to Retire',
      'General Operations',
    ],
    displayOrder: 1,
    active: true,
    version: 1,
  },
  {
    questionId: 'Q2',
    key: 'document_type',
    label: 'What type of document is this?',
    type: 'select',
    required: true,
    options: ['Input', 'Output', 'Financial Statement', 'Policy / Procedure'],
    displayOrder: 2,
    active: true,
    version: 1,
  },
  {
    questionId: 'Q3',
    key: 'business_function',
    label: 'Which business function owns the content?',
    type: 'select',
    required: true,
    options: ['Finance', 'Operations', 'HR', 'Procurement'],
    displayOrder: 3,
    active: true,
    version: 1,
  },
  {
    questionId: 'Q4',
    key: 'confidentiality_classification',
    label: 'What is the confidentiality classification?',
    type: 'select',
    required: true,
    options: ['Internal', 'Confidential', 'Restricted'],
    displayOrder: 4,
    active: true,
    version: 1,
  },
  {
    questionId: 'Q5',
    key: 'change_type',
    label: 'Is this a new document or a correction?',
    type: 'select',
    required: true,
    options: ['New', 'Correction'],
    displayOrder: 5,
    active: true,
    version: 1,
  },
  {
    questionId: 'Q6',
    key: 'policy_scope',
    label: 'Which teams are governed by this policy?',
    type: 'text',
    required: true,
    displayOrder: 6,
    active: true,
    version: 1,
    showWhen: { key: 'document_type', equals: 'Policy / Procedure' },
  },
];

function configuredRoute(
  routeKey: string,
  businessFunction: string,
  documentType: string,
  dataSummaryTab: string,
  allowedRoles: RoleId[] = ['EMPLOYEE', 'CONTENT_MANAGER', 'ADMIN'],
): RouteConfig {
  return {
    routeKey,
    conditions: [
      { key: 'business_function', equals: businessFunction },
      { key: 'document_type', equals: documentType },
    ],
    dataSummarySpreadsheetId: 'configured-data-summary',
    dataSummaryTab,
    driveFolderId: `configured-folder-${routeKey.toLowerCase()}`,
    allowedRoles,
    active: true,
    version: 1,
  };
}

export const routes: RouteConfig[] = [
  configuredRoute(
    'FINANCE_FINANCIAL_STATEMENT',
    'Finance',
    'Financial Statement',
    'Financial Statements',
  ),
  configuredRoute('FINANCE_INPUT', 'Finance', 'Input', 'Finance Inputs'),
  configuredRoute('FINANCE_OUTPUT', 'Finance', 'Output', 'Finance Outputs'),
  configuredRoute(
    'OPERATIONS_INPUT',
    'Operations',
    'Input',
    'Operations Inputs',
  ),
  configuredRoute(
    'OPERATIONS_OUTPUT',
    'Operations',
    'Output',
    'Operations Outputs',
  ),
  configuredRoute('HR_POLICY', 'HR', 'Policy / Procedure', 'HR Policies'),
  configuredRoute(
    'PROCUREMENT_INPUT',
    'Procurement',
    'Input',
    'Procurement Inputs',
  ),
  configuredRoute(
    'GENERAL_POLICY',
    'Operations',
    'Policy / Procedure',
    'General Policies',
  ),
];

export const employees: Employee[] = [
  {
    employeeId: 'E001',
    name: 'Content Employee',
    email: 'content.employee@aboitiz.com',
    active: true,
    roleId: 'EMPLOYEE',
  },
  {
    employeeId: 'E002',
    name: 'Finance Viewer',
    email: 'finance.viewer@aboitiz.com',
    active: true,
    roleId: 'FINANCE_VIEWER',
  },
  {
    employeeId: 'E003',
    name: 'Operations Viewer',
    email: 'operations.viewer@aboitiz.com',
    active: true,
    roleId: 'OPERATIONS_VIEWER',
  },
  {
    employeeId: 'E004',
    name: 'Content Manager',
    email: 'content.manager@aboitiz.com',
    active: true,
    roleId: 'CONTENT_MANAGER',
  },
  {
    employeeId: 'E005',
    name: 'Administrator',
    email: 'content.admin@aboitiz.com',
    active: true,
    roleId: 'ADMIN',
  },
  {
    employeeId: 'E006',
    name: 'Inactive Employee',
    email: 'inactive.employee@aboitiz.com',
    active: false,
    roleId: 'EMPLOYEE',
  },
];

export const localConfiguredEmployee = employees[0];

export const filePolicy: FilePolicy = {
  allowedMimeTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
  allowedExtensions: ['pdf', 'docx', 'xlsx', 'txt'],
  maxFileSizeBytes: 10 * 1024 * 1024,
  maxFileCount: 5,
  maxTotalSizeBytes: 25 * 1024 * 1024,
};
