import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataType, Dataset, Category, DataTypeDataset, Notification } from '../types';
import { mockDataTypes, mockDatasets, mockCategories } from '../data/mockData';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, writeBatch, deleteDoc } from 'firebase/firestore';

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
          console.log('[Import] Starting import process...');
          const content = event.target?.result as string;
          console.log('[Import] File read successfully, parsing JSON...');
          const data = JSON.parse(content);
          console.log('[Import] JSON parsed successfully');

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

          console.log(`[Import] Data to import: ${data.dataTypes.length} dataTypes, ${data.datasets.length} datasets, ${categories.length} categories, ${dataTypeDatasets.length} dataTypeDatasets`);

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

          console.log('[Import] Validation complete, starting Firestore operations...');

          // Delete existing data from Firestore
          // Use smaller batch size and add delays to avoid rate limiting
          const BATCH_LIMIT = 250; // Further reduced to prevent hanging
          const BATCH_DELAY = 200; // Increased delay between batches
          const collectionsToDelete = ['dataTypes', 'datasets', 'categories', 'dataTypeDatasets'];

          console.log('[Import] Deleting existing data...');
          for (const collectionName of collectionsToDelete) {
            try {
              console.log(`[Import] Fetching documents from ${collectionName}...`);
              const snapshot = await getDocs(collection(db, collectionName));
              const totalDocs = snapshot.docs.length;
              console.log(`[Import] Found ${totalDocs} documents in ${collectionName}, starting deletion...`);

              if (totalDocs === 0) {
                console.log(`[Import] No documents to delete in ${collectionName}, skipping...`);
                continue;
              }

              let deleteBatch = writeBatch(db);
              let deleteCount = 0;
              let totalDeleted = 0;
              let batchNumber = 1;

              for (const docSnapshot of snapshot.docs) {
                deleteBatch.delete(docSnapshot.ref);
                deleteCount++;
                totalDeleted++;

                if (deleteCount >= BATCH_LIMIT) {
                  console.log(`[Import] Committing delete batch #${batchNumber} for ${collectionName} (${totalDeleted}/${totalDocs})...`);
                  try {
                    await deleteBatch.commit();
                    console.log(`[Import] Batch #${batchNumber} committed successfully`);
                  } catch (batchError) {
                    console.error(`[Import] Error committing batch #${batchNumber}:`, batchError);
                    throw batchError;
                  }
                  // Delay to avoid rate limiting
                  await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
                  deleteBatch = writeBatch(db);
                  deleteCount = 0;
                  batchNumber++;
                }
              }

              // Commit any remaining deletes
              if (deleteCount > 0) {
                console.log(`[Import] Committing final delete batch #${batchNumber} for ${collectionName} (${totalDeleted}/${totalDocs})...`);
                try {
                  await deleteBatch.commit();
                  console.log(`[Import] Final batch committed successfully`);
                } catch (batchError) {
                  console.error(`[Import] Error committing final batch:`, batchError);
                  throw batchError;
                }
                await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
              }
              console.log(`[Import] ✓ Completed deletion of ${totalDocs} documents from ${collectionName}`);
            } catch (error) {
              console.error(`[Import] Failed to delete from ${collectionName}:`, error);
              throw new Error(`Failed to delete existing ${collectionName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }

          console.log('[Import] Deletion complete, starting data import...');

          // Save to Firestore using batch writes
          // Split into chunks to avoid Firestore's 500 operation limit
          let batch = writeBatch(db);
          let operationCount = 0;
          let totalOperations = data.dataTypes.length + data.datasets.length + categories.length + dataTypeDatasets.length;
          let completedOperations = 0;
          let writeBatchNumber = 1;

          const commitBatchIfNeeded = async (force: boolean = false) => {
            if (force || operationCount >= BATCH_LIMIT) {
              if (operationCount > 0) {
                console.log(`[Import] Committing write batch #${writeBatchNumber} (${completedOperations}/${totalOperations} items)...`);
                try {
                  await batch.commit();
                  console.log(`[Import] Write batch #${writeBatchNumber} committed successfully`);
                } catch (batchError) {
                  console.error(`[Import] Error committing write batch #${writeBatchNumber}:`, batchError);
                  throw batchError;
                }
                // Delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
                batch = writeBatch(db);
                operationCount = 0;
                writeBatchNumber++;
              }
            }
          };

          // Save dataTypes
          console.log(`[Import] Saving ${data.dataTypes.length} dataTypes...`);
          for (const item of data.dataTypes) {
            await commitBatchIfNeeded();
            const docRef = doc(db, 'dataTypes', String(item.id));
            batch.set(docRef, item);
            operationCount++;
            completedOperations++;
          }
          await commitBatchIfNeeded(true);
          console.log('[Import] ✓ DataTypes saved');

          // Save datasets
          console.log(`[Import] Saving ${data.datasets.length} datasets...`);
          for (const item of data.datasets) {
            await commitBatchIfNeeded();
            const docRef = doc(db, 'datasets', String(item.id));
            batch.set(docRef, item);
            operationCount++;
            completedOperations++;
          }
          await commitBatchIfNeeded(true);
          console.log('[Import] ✓ Datasets saved');

          // Save categories
          console.log(`[Import] Saving ${categories.length} categories...`);
          for (const item of categories) {
            await commitBatchIfNeeded();
            const docRef = doc(db, 'categories', String(item.id));
            batch.set(docRef, item);
            operationCount++;
            completedOperations++;
          }
          await commitBatchIfNeeded(true);
          console.log('[Import] ✓ Categories saved');

          // Save dataTypeDatasets
          console.log(`[Import] Saving ${dataTypeDatasets.length} dataTypeDatasets...`);
          for (const item of dataTypeDatasets) {
            await commitBatchIfNeeded();
            const docRef = doc(db, 'dataTypeDatasets', String(item.id));
            batch.set(docRef, item);
            operationCount++;
            completedOperations++;
          }
          await commitBatchIfNeeded(true);
          console.log('[Import] ✓ DataTypeDatasets saved');

          console.log('[Import] All Firestore operations complete, updating state...');

          // Only update state AFTER successful Firestore write
          setDataTypes(data.dataTypes);
          setDatasets(data.datasets);
          setCategories(categories);
          setDataTypeDatasets(dataTypeDatasets);

          console.log('[Import] Import completed successfully!');
          resolve();
        } catch (error) {
          console.error('[Import] Import failed with error:', error);
          // Handle JSON parsing errors specifically
          if (error instanceof SyntaxError) {
            reject(new Error('Invalid JSON file: unable to parse file content'));
          } else {
            reject(error);
          }
        }
      };

      reader.onerror = () => {
        console.error('[Import] File read failed');
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
