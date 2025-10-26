import { DataType, Dataset, Category, Priority, CompletionStatus, RdlsStatus } from '../types';

export const mockDataTypes: DataType[] = [
  {
    id: '1',
    name: 'Core Business Subscribers',
    description: 'A dataset of core business subscribers with detailed information.',
    categoryId: '1',
    owner: 'Core Data Team',
    priority: Priority.HIGH,
    completionStatus: CompletionStatus.COMPLETED,
    rdlsStatus: RdlsStatus.GREEN,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Customer Feedback',
    description: 'Collection of customer feedback and survey responses.',
    categoryId: '2',
    owner: 'Sales Team',
    priority: Priority.MEDIUM,
    completionStatus: CompletionStatus.IN_PROGRESS,
    rdlsStatus: RdlsStatus.YELLOW,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockDatasets: Dataset[] = [
  {
    id: '1',
    name: 'Q1 2023 Core Subscribers',
    description: 'Snapshot of core business subscribers for the first quarter of 2023.',
    dataTypeId: '1',
    url: 'http://example.com/datasets/q1-2023-subscribers',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Q2 2023 Core Subscribers',
    description: 'Snapshot of core business subscribers for the second quarter of 2023.',
    dataTypeId: '1',
    url: 'http://example.com/datasets/q2-2023-subscribers',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockCategories: Category[] = [
  { id: '1', name: 'Business' },
  { id: '2', name: 'Customer' },
  { id: '3', name: 'Financial' },
];
