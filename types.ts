export type Page =
  | { name: 'review' }
  | { name: 'review-item', index: number };

export interface DataType {
  id: string;
  category: string;
  name: string;
  rdls_coverage: string;
  rdls_component: string;
  inspire_spec: string;
  description: string;
  requirements: string;
  example_dataset: string;
  example_url: string;
  comments: string;
  reviewed: boolean;
  review_notes: string;
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error';
}
