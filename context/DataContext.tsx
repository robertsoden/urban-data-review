import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataType, Dataset, Category, DataTypeDataset, Notification } from '../types';
import { mockDataTypes, mockDatasets, mockCategories } from '../data/mockData';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';

interface DataContextType {
  dataTypes: DataType[];
  datasets: Dataset[];
  categories: Category[];
  dataTypeDatasets: DataTypeDataset[];
  notifications: Notification[];
  loading: boolean;
  error: Error | null;
  addDataType: (dataType: Omit<DataType, 'id' | 'created_at'>) => Promise<void>;
  updateDataType: (id: string, dataType: Partial<DataType>) => Promise<void>;
  deleteDataType: (id: string) => Promise<void>;
  addDataset: (dataset: Omit<Dataset, 'id' | 'created_at'>) => Promise<void>;
  updateDataset: (id: string, dataset: Partial<Dataset>) => Promise<void>;
  deleteDataset: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addNotification: (message: string, type: 'success' | 'error') => void;
  clearNotification: (id: number) => void;
  exportData: () => void;
  importData: (file: File) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataTypeDatasets, setDataTypeDatasets] = useState<DataTypeDataset[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Try to load from Firestore first
        const dataTypesSnapshot = await getDocs(collection(db, 'dataTypes'));
        const datasetsSnapshot = await getDocs(collection(db, 'datasets'));
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const dataTypeDatasetsSnapshot = await getDocs(collection(db, 'dataTypeDatasets'));

        if (!dataTypesSnapshot.empty && !datasetsSnapshot.empty) {
          // Load from Firestore
          const loadedDataTypes = dataTypesSnapshot.docs.map(doc => doc.data() as DataType);
          const loadedDatasets = datasetsSnapshot.docs.map(doc => doc.data() as Dataset);
          const loadedCategories = categoriesSnapshot.docs.map(doc => doc.data() as Category);
          const loadedDataTypeDatasets = dataTypeDatasetsSnapshot.docs.map(doc => doc.data() as DataTypeDataset);

          setDataTypes(loadedDataTypes);
          setDatasets(loadedDatasets);
          setCategories(loadedCategories);
          setDataTypeDatasets(loadedDataTypeDatasets);
        } else {
          // Use mock data as fallback
          setDataTypes(mockDataTypes);
          setDatasets(mockDatasets);
          setCategories(mockCategories);
          setDataTypeDatasets([]);
        }

        setError(null);
      } catch (e) {
        console.error('Failed to load from Firestore, using mock data:', e);
        // Fall back to mock data on error
        setDataTypes(mockDataTypes);
        setDatasets(mockDatasets);
        setCategories(mockCategories);
        setDataTypeDatasets([]);
        setError(null); // Don't show error to user, just fall back silently
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addNotification = (message: string, type: 'success' | 'error') => {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      type,
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const clearNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addDataType = async (dataType: Omit<DataType, 'id' | 'created_at'>) => {
    const newDataType: DataType = {
      ...dataType,
      id: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    setDataTypes(prev => [...prev, newDataType]);
    addNotification('Data type added successfully', 'success');
  };

  const updateDataType = async (id: string, dataType: Partial<DataType>) => {
    setDataTypes(prev => prev.map(dt => dt.id === id ? { ...dt, ...dataType } : dt));
    addNotification('Data type updated successfully', 'success');
  };

  const deleteDataType = async (id: string) => {
    setDataTypes(prev => prev.filter(dt => dt.id !== id));
    addNotification('Data type deleted successfully', 'success');
  };

  const addDataset = async (dataset: Omit<Dataset, 'id' | 'created_at'>) => {
    const newDataset: Dataset = {
      ...dataset,
      id: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    setDatasets(prev => [...prev, newDataset]);
    addNotification('Dataset added successfully', 'success');
  };

  const updateDataset = async (id: string, dataset: Partial<Dataset>) => {
    setDatasets(prev => prev.map(ds => ds.id === id ? { ...ds, ...dataset } : ds));
    addNotification('Dataset updated successfully', 'success');
  };

  const deleteDataset = async (id: string) => {
    setDatasets(prev => prev.filter(ds => ds.id !== id));
    addNotification('Dataset deleted successfully', 'success');
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: new Date().toISOString(),
    };
    setCategories(prev => [...prev, newCategory]);
    addNotification('Category added successfully', 'success');
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...category } : c));
    addNotification('Category updated successfully', 'success');
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    addNotification('Category deleted successfully', 'success');
  };

  const exportData = () => {
    const data = {
      dataTypes,
      datasets,
      categories,
      dataTypeDatasets,
      exportedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `urban-data-catalog-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addNotification('Data exported successfully', 'success');
  };

  const importData = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const data = JSON.parse(content);

          // Validate required fields (dataTypes and datasets are required)
          const missingFields: string[] = [];
          if (!data.dataTypes) missingFields.push('dataTypes');
          if (!data.datasets) missingFields.push('datasets');

          if (missingFields.length > 0) {
            throw new Error(
              `Invalid data format: missing required fields: ${missingFields.join(', ')}. ` +
              `Expected format: { dataTypes: [], datasets: [], categories: [], dataTypeDatasets: [] }`
            );
          }

          // Validate that required fields are arrays
          const invalidFields: string[] = [];
          if (!Array.isArray(data.dataTypes)) invalidFields.push('dataTypes');
          if (!Array.isArray(data.datasets)) invalidFields.push('datasets');

          if (invalidFields.length > 0) {
            throw new Error(
              `Invalid data format: the following fields must be arrays: ${invalidFields.join(', ')}`
            );
          }

          // Validate optional fields are arrays if present
          if (data.categories && !Array.isArray(data.categories)) {
            throw new Error('Invalid data format: categories must be an array');
          }
          if (data.dataTypeDatasets && !Array.isArray(data.dataTypeDatasets)) {
            throw new Error('Invalid data format: dataTypeDatasets must be an array');
          }

          // Set defaults for optional fields
          const categories = data.categories || [];
          const dataTypeDatasets = data.dataTypeDatasets || [];

          // Validate individual DataType items
          const requiredDataTypeFields = [
            'id', 'uid', 'name', 'category', 'description', 'priority',
            'completion_status', 'minimum_criteria', 'notes', 'key_attributes',
            'applicable_standards', 'iso_indicators', 'rdls_can_handle',
            'rdls_component', 'rdls_notes', 'created_at'
          ];

          data.dataTypes.forEach((item: any, index: number) => {
            const missing = requiredDataTypeFields.filter(field => !(field in item));
            if (missing.length > 0) {
              throw new Error(
                `Invalid DataType at index ${index} (name: "${item.name || 'unknown'}"): ` +
                `missing required fields: ${missing.join(', ')}`
              );
            }
          });

          // Validate individual Dataset items
          const requiredDatasetFields = [
            'id', 'name', 'url', 'description', 'source_organization',
            'source_type', 'geographic_coverage', 'temporal_coverage',
            'format', 'resolution', 'access_type', 'license',
            'is_validated', 'is_primary_example', 'quality_notes',
            'used_in_projects', 'notes', 'created_at'
          ];

          data.datasets.forEach((item: any, index: number) => {
            const missing = requiredDatasetFields.filter(field => !(field in item));
            if (missing.length > 0) {
              throw new Error(
                `Invalid Dataset at index ${index} (name: "${item.name || 'unknown'}"): ` +
                `missing required fields: ${missing.join(', ')}`
              );
            }
          });

          // Validate individual Category items (if present)
          if (categories.length > 0) {
            const requiredCategoryFields = ['id', 'name', 'description'];

            categories.forEach((item: any, index: number) => {
              const missing = requiredCategoryFields.filter(field => !(field in item));
              if (missing.length > 0) {
                throw new Error(
                  `Invalid Category at index ${index} (name: "${item.name || 'unknown'}"): ` +
                  `missing required fields: ${missing.join(', ')}`
                );
              }
            });
          }

          // Validate individual DataTypeDataset items (if present)
          if (dataTypeDatasets.length > 0) {
            const requiredDataTypeDatasetFields = ['id', 'data_type_id', 'dataset_id'];

            dataTypeDatasets.forEach((item: any, index: number) => {
              const missing = requiredDataTypeDatasetFields.filter(field => !(field in item));
              if (missing.length > 0) {
                throw new Error(
                  `Invalid DataTypeDataset at index ${index}: ` +
                  `missing required fields: ${missing.join(', ')}`
                );
              }
            });
          }

          // Set the imported data in state
          setDataTypes(data.dataTypes);
          setDatasets(data.datasets);
          setCategories(categories);
          setDataTypeDatasets(dataTypeDatasets);

          // Save to Firestore using batch writes for better performance
          const batch = writeBatch(db);

          // Save dataTypes
          data.dataTypes.forEach((item: DataType) => {
            const docRef = doc(db, 'dataTypes', String(item.id));
            batch.set(docRef, item);
          });

          // Save datasets
          data.datasets.forEach((item: Dataset) => {
            const docRef = doc(db, 'datasets', String(item.id));
            batch.set(docRef, item);
          });

          // Save categories
          categories.forEach((item: Category) => {
            const docRef = doc(db, 'categories', String(item.id));
            batch.set(docRef, item);
          });

          // Save dataTypeDatasets
          dataTypeDatasets.forEach((item: DataTypeDataset) => {
            const docRef = doc(db, 'dataTypeDatasets', String(item.id));
            batch.set(docRef, item);
          });

          // Commit the batch
          await batch.commit();

          resolve();
        } catch (error) {
          // Handle JSON parsing errors specifically
          if (error instanceof SyntaxError) {
            reject(new Error('Invalid JSON file: unable to parse file content'));
          } else {
            reject(error);
          }
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  };

  return (
    <DataContext.Provider value={{
      dataTypes,
      datasets,
      categories,
      dataTypeDatasets,
      notifications,
      loading,
      error,
      addDataType,
      updateDataType,
      deleteDataType,
      addDataset,
      updateDataset,
      deleteDataset,
      addCategory,
      updateCategory,
      deleteCategory,
      addNotification,
      clearNotification,
      exportData,
      importData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
