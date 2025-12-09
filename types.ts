export type Page =
  | { name: 'home' }
  | { name: 'dashboard' }
  | { name: 'data-types', initialTheme?: string }
  | { name: 'data-type-detail', id: string }
  | { name: 'data-type-add' }
  | { name: 'data-type-edit', id: string }
  | { name: 'datasets' }
  | { name: 'dataset-detail', id: string }
  | { name: 'dataset-add' }
  | { name: 'dataset-edit', id: string }
  | { name: 'inspire-themes' }
  | { name: 'manage-categories' }
  | { name: 'progress-report' }
  | { name: 'import-export' };

export interface InspireTheme {
  id: string;
  name: string;
  description: string;
}

export interface DataType {
  id: string;
  name: string;
  inspire_theme: string;
  inspire_annex: string;
  inspire_spec: string;
  description: string;
  applicable_standards: string;
  minimum_criteria: string;
  rdls_coverage: string;
  rdls_extension_module: string;
  notes: string;
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
