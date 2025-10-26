export type Page =
  | { name: 'dashboard' }
  | { name: 'data-types', initialCategory?: string, initialStatus?: CompletionStatus }
  | { name: 'data-type-detail', id: string }
  | { name: 'data-type-add' }
  | { name: 'data-type-edit', id: string }
  | { name: 'datasets' }
  | { name: 'dataset-detail', id: string }
  | { name: 'dataset-add' }
  | { name: 'dataset-edit', id: string }
  | { name: 'categories' }
  | { name: 'manage-categories' }
  | { name: 'progress-report' }
  | { name: 'import-export' };

export enum CompletionStatus {
  Complete = 'Complete',
  InProgress = 'In Progress',
  NotStarted = 'Not Started',
}

export enum Priority {
  Essential = 'Essential',
  Beneficial = 'Beneficial',
  Low = 'Low',
  Unassigned = 'Unassigned',
}

export enum RdlsStatus {
  Yes = 'Yes',
  No = 'No',
  Partial = 'Partial',
  Check = 'Check',
  Unassigned = 'Unassigned',
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface DataType {
  id: string;
  uid: string;
  name: string;
  category: string;
  description: string;
  priority: Priority;
  completion_status: CompletionStatus;
  minimum_criteria: string;
  notes: string;
  key_attributes: string; // JSON string
  applicable_standards: string;
  iso_indicators: string;
  rdls_can_handle: RdlsStatus;
  rdls_component: string;
  rdls_notes: string;
  created_at: string;
}

export interface Dataset {
  id: string;
  name: string;
  url: string;
  description: string;
  source_organization: string;
  source_type: string;
  geographic_coverage: string;
  temporal_coverage: string;
  format: string;
  resolution: string;
  access_type: string;
  license: string;
  is_validated: boolean;
  is_primary_example: boolean;
  quality_notes: string;
  used_in_projects: string;
  notes: string;
  created_at: string;
}

export interface DataTypeDataset {
  id: string;
  data_type_id: string;
  dataset_id: string;
  relationship_notes?: string;
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error';
}