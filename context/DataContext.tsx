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
  addDataType: (dataType: Omit<DataType, 'id' | 'created_at'>, linkedDatasetIds?: string[]) => Promise<void>;
  updateDataType: (id: string, dataType: Partial<DataType>, linkedDatasetIds?: string[]) => Promise<void>;
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
  getDataTypeById: (id: string) => DataType | undefined;
  getDatasetById: (id: string) => Dataset | undefined;
  getDatasetsForDataType: (dataTypeId: string) => Dataset[];
  getDataTypesForDataset: (datasetId: string) => DataType[];
  getDataTypeCountForDataset: (datasetId: string) => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ===== TEMPORARY: localStorage support (remove when migrating to Firebase) =====
const LOCALSTORAGE_KEY = 'urban-data-review-data';

const saveToLocalStorage = (data: { dataTypes: DataType[], datasets: Dataset[], categories: Category[], dataTypeDatasets: DataTypeDataset[] }) => {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
    console.log('[localStorage] Data saved successfully');
  } catch (e) {
    console.error('[localStorage] Failed to save:', e);
  }
};

const loadFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem(LOCALSTORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      console.log('[localStorage] Data loaded successfully');
      return data;
    }
  } catch (e) {
    console.error('[localStorage] Failed to load:', e);
  }
  return null;
};
// ===== END TEMPORARY =====

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

        // Check if Firebase is configured
        if (!db) {
          // TEMPORARY: Try localStorage first when Firebase is not configured
          const localData = loadFromLocalStorage();
          if (localData) {
            console.log('Firebase not configured, loading from localStorage');
            setDataTypes(localData.dataTypes || []);
            setDatasets(localData.datasets || []);
            setCategories(localData.categories || []);
            setDataTypeDatasets(localData.dataTypeDatasets || []);
            setError(null);
            setLoading(false);
            return;
          }

          console.log('Firebase not configured, using mock data');
          setDataTypes(mockDataTypes);
          setDatasets(mockDatasets);
          setCategories(mockCategories);
          setDataTypeDatasets([]);
          setError(null);
          setLoading(false);
          return;
        }

        // Try to load from Firestore first
        const dataTypesSnapshot = await getDocs(collection(db, 'dataTypes'));
        const datasetsSnapshot = await getDocs(collection(db, 'datasets'));
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const dataTypeDatasetsSnapshot = await getDocs(collection(db, 'dataTypeDatasets'));

        console.log('[DataContext] Firestore snapshot sizes:', {
          dataTypes: dataTypesSnapshot.size,
          datasets: datasetsSnapshot.size,
          categories: categoriesSnapshot.size,
          dataTypeDatasets: dataTypeDatasetsSnapshot.size
        });

        // Check if any collection has data
        const hasAnyData = !dataTypesSnapshot.empty || !datasetsSnapshot.empty || !categoriesSnapshot.empty || !dataTypeDatasetsSnapshot.empty;

        console.log('[DataContext] hasAnyData:', hasAnyData);

        if (hasAnyData) {
          // Load from Firestore (use empty arrays for empty collections)
          const loadedDataTypes = dataTypesSnapshot.docs.map(doc => doc.data() as DataType);
          const loadedDatasets = datasetsSnapshot.docs.map(doc => doc.data() as Dataset);
          const loadedCategories = categoriesSnapshot.docs.map(doc => doc.data() as Category);
          const loadedDataTypeDatasets = dataTypeDatasetsSnapshot.docs.map(doc => doc.data() as DataTypeDataset);

          console.log('[DataContext] Loaded from Firestore:', {
            dataTypes: loadedDataTypes.length,
            datasets: loadedDatasets.length,
            categories: loadedCategories.length,
            dataTypeDatasets: loadedDataTypeDatasets.length
          });

          setDataTypes(loadedDataTypes);
          setDatasets(loadedDatasets);
          setCategories(loadedCategories);
          setDataTypeDatasets(loadedDataTypeDatasets);
        } else {
          // Use mock data as fallback only if ALL collections are empty
          console.log('[DataContext] Using mock data as fallback');
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
      } finally{
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

  // TEMPORARY: Helper to persist state changes to localStorage when Firebase is not configured
  const persistIfNeeded = (newDataTypes: DataType[], newDatasets: Dataset[], newCategories: Category[], newDataTypeDatasets: DataTypeDataset[]) => {
    if (!db) {
      saveToLocalStorage({
        dataTypes: newDataTypes,
        datasets: newDatasets,
        categories: newCategories,
        dataTypeDatasets: newDataTypeDatasets
      });
    }
  };

  const addDataType = async (dataType: Omit<DataType, 'id' | 'created_at'>, linkedDatasetIds?: string[]) => {
    // Check for duplicate names (case-insensitive)
    const trimmedName = dataType.name.trim();
    const isDuplicate = dataTypes.some(dt =>
      dt.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      throw new Error(`A data type named "${trimmedName}" already exists. Please choose a different name.`);
    }

    const newDataType: DataType = {
      ...dataType,
      name: trimmedName,
      id: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    const newDataTypes = [...dataTypes, newDataType];

    // Handle linked datasets if provided
    let newDataTypeDatasets = dataTypeDatasets;
    if (linkedDatasetIds && linkedDatasetIds.length > 0) {
      const newLinks = linkedDatasetIds.map(datasetId => ({
        id: `${newDataType.id}-${datasetId}`,
        data_type_id: newDataType.id,
        dataset_id: datasetId
      }));
      newDataTypeDatasets = [...dataTypeDatasets, ...newLinks];
      setDataTypeDatasets(newDataTypeDatasets);
    }

    setDataTypes(newDataTypes);
    persistIfNeeded(newDataTypes, datasets, categories, newDataTypeDatasets);
    addNotification('Data type added successfully', 'success');
  };

  const updateDataType = async (id: string, dataType: Partial<DataType>, linkedDatasetIds?: string[]) => {
    // Check for duplicate names (case-insensitive, excluding self)
    if (dataType.name) {
      const trimmedName = dataType.name.trim();
      const isDuplicate = dataTypes.some(dt =>
        dt.name.toLowerCase() === trimmedName.toLowerCase() &&
        dt.id !== id
      );

      if (isDuplicate) {
        throw new Error(`A data type named "${trimmedName}" already exists. Please choose a different name.`);
      }

      dataType = { ...dataType, name: trimmedName };
    }

    const newDataTypes = dataTypes.map(dt => dt.id === id ? { ...dt, ...dataType } : dt);

    // Handle linked datasets if provided
    let newDataTypeDatasets = dataTypeDatasets;
    if (linkedDatasetIds !== undefined) {
      // Remove existing links for this data type
      newDataTypeDatasets = dataTypeDatasets.filter(link => link.data_type_id !== id);

      // Add new links
      if (linkedDatasetIds.length > 0) {
        const newLinks = linkedDatasetIds.map(datasetId => ({
          id: `${id}-${datasetId}`,
          data_type_id: id,
          dataset_id: datasetId
        }));
        newDataTypeDatasets = [...newDataTypeDatasets, ...newLinks];
      }
      setDataTypeDatasets(newDataTypeDatasets);
    }

    setDataTypes(newDataTypes);
    persistIfNeeded(newDataTypes, datasets, categories, newDataTypeDatasets);
    addNotification('Data type updated successfully', 'success');
  };

  const deleteDataType = async (id: string) => {
    const newDataTypes = dataTypes.filter(dt => dt.id !== id);

    // CASCADE: Remove all junction table links for this data type
    const removedLinks = dataTypeDatasets.filter(link => link.data_type_id === id);
    const newDataTypeDatasets = dataTypeDatasets.filter(link => link.data_type_id !== id);

    setDataTypes(newDataTypes);
    setDataTypeDatasets(newDataTypeDatasets);
    persistIfNeeded(newDataTypes, datasets, categories, newDataTypeDatasets);

    if (removedLinks.length > 0) {
      console.log(`[Cascade] Removed ${removedLinks.length} dataset link(s) for deleted data type`);
    }
    addNotification('Data type deleted successfully', 'success');
  };

  const addDataset = async (dataset: Omit<Dataset, 'id' | 'created_at'>) => {
    const newDataset: Dataset = {
      ...dataset,
      id: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    const newDatasets = [...datasets, newDataset];
    setDatasets(newDatasets);
    persistIfNeeded(dataTypes, newDatasets, categories, dataTypeDatasets);
    addNotification('Dataset added successfully', 'success');
  };

  const updateDataset = async (id: string, dataset: Partial<Dataset>) => {
    const newDatasets = datasets.map(ds => ds.id === id ? { ...ds, ...dataset } : ds);
    setDatasets(newDatasets);
    persistIfNeeded(dataTypes, newDatasets, categories, dataTypeDatasets);
    addNotification('Dataset updated successfully', 'success');
  };

  const deleteDataset = async (id: string) => {
    const newDatasets = datasets.filter(ds => ds.id !== id);

    // CASCADE: Remove all junction table links for this dataset
    const removedLinks = dataTypeDatasets.filter(link => link.dataset_id === id);
    const newDataTypeDatasets = dataTypeDatasets.filter(link => link.dataset_id !== id);

    setDatasets(newDatasets);
    setDataTypeDatasets(newDataTypeDatasets);
    persistIfNeeded(dataTypes, newDatasets, categories, newDataTypeDatasets);

    if (removedLinks.length > 0) {
      console.log(`[Cascade] Removed ${removedLinks.length} data type link(s) for deleted dataset`);
    }
    addNotification('Dataset deleted successfully', 'success');
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    // Check for duplicate names (case-insensitive)
    const trimmedName = category.name.trim();
    const isDuplicate = categories.some(c =>
      c.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      throw new Error(`A category named "${trimmedName}" already exists. Please choose a different name.`);
    }

    const newCategory: Category = {
      ...category,
      name: trimmedName,
      id: new Date().toISOString(),
    };
    const newCategories = [...categories, newCategory];
    setCategories(newCategories);
    persistIfNeeded(dataTypes, datasets, newCategories, dataTypeDatasets);
    addNotification('Category added successfully', 'success');
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    const oldCategory = categories.find(c => c.id === id);
    if (!oldCategory) {
      throw new Error('Category not found');
    }

    // Check for duplicate names (case-insensitive, excluding self)
    if (category.name) {
      const trimmedName = category.name.trim();
      const isDuplicate = categories.some(c =>
        c.name.toLowerCase() === trimmedName.toLowerCase() &&
        c.id !== id
      );

      if (isDuplicate) {
        throw new Error(`A category named "${trimmedName}" already exists. Please choose a different name.`);
      }
    }

    const newCategories = categories.map(c => c.id === id ? { ...c, ...category } : c);

    // CASCADE: If category name changed, update all data types that reference it
    let newDataTypes = dataTypes;
    if (category.name && category.name !== oldCategory.name) {
      const trimmedName = category.name.trim();
      newDataTypes = dataTypes.map(dt =>
        dt.category === oldCategory.name
          ? { ...dt, category: trimmedName }
          : dt
      );
      setDataTypes(newDataTypes);
      console.log(`[Cascade] Updated ${newDataTypes.filter(dt => dt.category === trimmedName).length} data types from category "${oldCategory.name}" to "${trimmedName}"`);
    }

    setCategories(newCategories);
    persistIfNeeded(newDataTypes, datasets, newCategories, dataTypeDatasets);
    addNotification('Category updated successfully', 'success');
  };

  const deleteCategory = async (id: string) => {
    const categoryToDelete = categories.find(c => c.id === id);
    if (!categoryToDelete) {
      throw new Error('Category not found');
    }

    const UNCATEGORIZED = "Uncategorized";

    // CASCADE: Move all data types to "Uncategorized"
    const affectedDataTypes = dataTypes.filter(dt => dt.category === categoryToDelete.name);
    const newDataTypes = dataTypes.map(dt =>
      dt.category === categoryToDelete.name
        ? { ...dt, category: UNCATEGORIZED }
        : dt
    );

    // Remove the category
    let newCategories = categories.filter(c => c.id !== id);

    // Ensure "Uncategorized" category exists if there were affected data types
    if (affectedDataTypes.length > 0 && !newCategories.some(c => c.name === UNCATEGORIZED)) {
      newCategories.push({
        id: new Date().toISOString(),
        name: UNCATEGORIZED,
        description: "Data types without a specific category"
      });
    }

    setDataTypes(newDataTypes);
    setCategories(newCategories);
    persistIfNeeded(newDataTypes, datasets, newCategories, dataTypeDatasets);

    if (affectedDataTypes.length > 0) {
      console.log(`[Cascade] Moved ${affectedDataTypes.length} data types from "${categoryToDelete.name}" to "${UNCATEGORIZED}"`);
      addNotification(`Category deleted. ${affectedDataTypes.length} data type(s) moved to "Uncategorized".`, 'success');
    } else {
      addNotification('Category deleted successfully', 'success');
    }
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

  // Helper functions
  const getDataTypeById = (id: string): DataType | undefined => {
    return dataTypes.find(dt => dt.id === id);
  };

  const getDatasetById = (id: string): Dataset | undefined => {
    return datasets.find(ds => ds.id === id);
  };

  const getDatasetsForDataType = (dataTypeId: string): Dataset[] => {
    const links = dataTypeDatasets.filter(link => link.data_type_id === dataTypeId);
    return links.map(link => datasets.find(ds => ds.id === link.dataset_id)).filter(Boolean) as Dataset[];
  };

  const getDataTypesForDataset = (datasetId: string): DataType[] => {
    const links = dataTypeDatasets.filter(link => link.dataset_id === datasetId);
    return links.map(link => dataTypes.find(dt => dt.id === link.data_type_id)).filter(Boolean) as DataType[];
  };

  const getDataTypeCountForDataset = (datasetId: string): number => {
    return dataTypeDatasets.filter(link => link.dataset_id === datasetId).length;
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
          const dataTypeDatasets = data.dataTypeDatasets || [];

          // Auto-generate categories from data types
          const uniqueCategoryNames = new Set<string>();
          data.dataTypes.forEach((dt: any) => {
            if (dt.category && typeof dt.category === 'string' && dt.category.trim()) {
              uniqueCategoryNames.add(dt.category.trim());
            }
          });

          // Create category objects from unique names
          const autoGeneratedCategories: Category[] = Array.from(uniqueCategoryNames).map((name, index) => ({
            id: `cat-${index + 1}`,
            name: name,
            description: `Auto-generated category for ${name} data types`
          }));

          // Merge with any categories from the import file (if present)
          const importedCategories = data.categories || [];
          const categoryMap = new Map<string, Category>();

          // First, add auto-generated categories
          autoGeneratedCategories.forEach(cat => {
            categoryMap.set(cat.name.toLowerCase(), cat);
          });

          // Then, override with imported categories (which may have better descriptions)
          importedCategories.forEach((cat: any) => {
            categoryMap.set(cat.name.toLowerCase(), cat);
          });

          const categories = Array.from(categoryMap.values());

          console.log(`[Import] Data to import: ${data.dataTypes.length} dataTypes, ${data.datasets.length} datasets, ${categories.length} categories (${autoGeneratedCategories.length} auto-generated, ${importedCategories.length} from file), ${dataTypeDatasets.length} dataTypeDatasets`);

          // Validate individual DataType items
          const requiredDataTypeFields = [
            'id', 'name', 'category', 'description', 'priority',
            'completion_status', 'minimum_criteria', 'notes', 'key_attributes',
            'applicable_standards', 'rdls_can_handle',
            'rdls_component', 'rdls_notes', 'created_at',
            'iso_sector', 'inspire_spec', 'rdls_coverage', 'rdls_extension_module'
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

          console.log('[Import] Validation complete');

          // TEMPORARY: If Firebase is not configured, use localStorage instead
          if (!db) {
            console.log('[Import] Firebase not configured, saving to localStorage...');

            // Update state
            setDataTypes(data.dataTypes);
            setDatasets(data.datasets);
            setCategories(categories);
            setDataTypeDatasets(dataTypeDatasets);

            // Persist to localStorage
            saveToLocalStorage({
              dataTypes: data.dataTypes,
              datasets: data.datasets,
              categories: categories,
              dataTypeDatasets: dataTypeDatasets
            });

            console.log('[Import] Import completed successfully (localStorage)!');
            resolve();
            return;
          }
          // END TEMPORARY

          console.log('[Import] Starting Firestore operations...');

          // Delete existing data from Firestore
          // Use smaller batch size and add delays to avoid rate limiting
          const BATCH_LIMIT = 400; // Reduced from 500 to be more conservative
          const collectionsToDelete = ['dataTypes', 'datasets', 'categories', 'dataTypeDatasets'];

          console.log('[Import] Deleting existing data...');
          for (const collectionName of collectionsToDelete) {
            const snapshot = await getDocs(collection(db, collectionName));
            const totalDocs = snapshot.docs.length;
            console.log(`[Import] Deleting ${totalDocs} documents from ${collectionName}...`);

            let deleteBatch = writeBatch(db);
            let deleteCount = 0;
            let totalDeleted = 0;

            for (const docSnapshot of snapshot.docs) {
              deleteBatch.delete(docSnapshot.ref);
              deleteCount++;
              totalDeleted++;

              if (deleteCount >= BATCH_LIMIT) {
                console.log(`[Import] Committing batch delete (${totalDeleted}/${totalDocs})...`);
                await deleteBatch.commit();
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                deleteBatch = writeBatch(db);
                deleteCount = 0;
              }
            }

            // Commit any remaining deletes
            if (deleteCount > 0) {
              console.log(`[Import] Committing final batch delete for ${collectionName} (${totalDeleted}/${totalDocs})...`);
              await deleteBatch.commit();
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            console.log(`[Import] Completed deletion of ${collectionName}`);
          }

          console.log('[Import] Deletion complete, starting data import...');

          // Save to Firestore using batch writes
          // Split into chunks to avoid Firestore's 500 operation limit
          let batch = writeBatch(db);
          let operationCount = 0;
          let totalOperations = data.dataTypes.length + data.datasets.length + categories.length + dataTypeDatasets.length;
          let completedOperations = 0;

          const commitBatchIfNeeded = async (force: boolean = false) => {
            if (force || operationCount >= BATCH_LIMIT) {
              if (operationCount > 0) {
                console.log(`[Import] Committing batch (${completedOperations}/${totalOperations} operations)...`);
                await batch.commit();
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                batch = writeBatch(db);
                operationCount = 0;
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
          console.log('[Import] DataTypes saved');

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
          console.log('[Import] Datasets saved');

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
          console.log('[Import] Categories saved');

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
          console.log('[Import] DataTypeDatasets saved');

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
      getDataTypeById,
      getDatasetById,
      getDatasetsForDataType,
      getDataTypesForDataset,
      getDataTypeCountForDataset,
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
