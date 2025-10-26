import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  where,
  getDocs,
} from 'firebase/firestore';
import {
  DataType,
  Dataset,
  Category,
  DataTypeDataset,
  Notification,
} from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  dataTypes: DataType[];
  datasets: Dataset[];
  categories: Category[];
  notifications: Notification[];
  loading: boolean;
  getDataTypeById: (id: string) => DataType | undefined;
  getDatasetById: (id: string) => Dataset | undefined;
  getDatasetsForDataType: (dataTypeId: string) => Dataset[];
  getDataTypesForDataset: (datasetId: string) => DataType[];
  getDataTypeCountForDataset: (datasetId: string) => number;
  addDataType: (data: { dataType: Omit<DataType, 'id' | 'created_at'>; linkedDatasetIds: string[] }) => Promise<void>;
  updateDataType: (data: { dataType: DataType; linkedDatasetIds: string[] }) => Promise<void>;
  deleteDataType: (id: string) => Promise<void>;
  addDataset: (data: { dataset: Omit<Dataset, 'id' | 'created_at'>; linkedDataTypeIds: string[] }) => Promise<void>;
  updateDataset: (data: { dataset: Dataset; linkedDataTypeIds: string[] }) => Promise<void>;
  deleteDataset: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addNotification: (message: string, type: 'success' | 'error') => void;
  // For Import/Export
  getAllData: () => { dataTypes: DataType[], datasets: Dataset[], categories: Category[], dataTypeDatasets: DataTypeDataset[] };
  importData: (data: { dataTypes: DataType[], datasets: Dataset[], categories: Category[], dataTypeDatasets: DataTypeDataset[] }) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataTypeDatasets, setDataTypeDatasets] = useState<DataTypeDataset[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const getCollectionPath = (collectionName: string) => `users/${user?.uid}/${collectionName}`;

  useEffect(() => {
    if (!user) {
      setDataTypes([]);
      setDatasets([]);
      setCategories([]);
      setDataTypeDatasets([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribes = [
      onSnapshot(query(collection(db, getCollectionPath('data_types'))), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DataType));
        setDataTypes(data);
      }),
      onSnapshot(query(collection(db, getCollectionPath('datasets'))), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dataset));
        setDatasets(data);
      }),
      onSnapshot(query(collection(db, getCollectionPath('categories'))), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        // Ensure "Uncategorized" is always present if there are any data types, but don't save it to DB
        if (!data.find(c => c.name === 'Uncategorized')) {
            data.push({ id: 'uncategorized', name: 'Uncategorized', description: 'Default category for items without a specific category.' });
        }
        setCategories(data);
      }),
      onSnapshot(query(collection(db, getCollectionPath('data_type_datasets'))), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DataTypeDataset));
        setDataTypeDatasets(data);
      }),
    ];
    
    // Once all initial data is loaded, set loading to false.
    // This is a simplification; a more robust solution might use Promise.all over getDocs once.
    const timer = setTimeout(() => setLoading(false), 1500); // Failsafe loader hide

    return () => {
        unsubscribes.forEach(unsub => unsub());
        clearTimeout(timer);
    };
  }, [user]);

  const addNotification = (message: string, type: 'success' | 'error') => {
    const newNotification = { id: Date.now(), message, type };
    setNotifications(prev => [...prev, newNotification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  const getDataTypeById = useCallback((id: string) => dataTypes.find(dt => dt.id === id), [dataTypes]);
  const getDatasetById = useCallback((id: string) => datasets.find(ds => ds.id === id), [datasets]);

  const getDatasetsForDataType = useCallback((dataTypeId: string) => {
    const linkedDatasetIds = dataTypeDatasets.filter(dtd => dtd.data_type_id === dataTypeId).map(dtd => dtd.dataset_id);
    return datasets.filter(ds => linkedDatasetIds.includes(ds.id));
  }, [datasets, dataTypeDatasets]);

  const getDataTypesForDataset = useCallback((datasetId: string) => {
    const linkedDataTypeIds = dataTypeDatasets.filter(dtd => dtd.dataset_id === datasetId).map(dtd => dtd.data_type_id);
    return dataTypes.filter(dt => linkedDataTypeIds.includes(dt.id));
  }, [dataTypes, dataTypeDatasets]);
  
  const getDataTypeCountForDataset = useCallback((datasetId: string) => {
      return dataTypeDatasets.filter(dtd => dtd.dataset_id === datasetId).length;
  }, [dataTypeDatasets]);

  const manageLinks = async (itemId: string, linkedIds: string[], itemType: 'dataType' | 'dataset') => {
    if (!user) throw new Error("No user logged in");
    const batch = writeBatch(db);
    const linksCollectionRef = collection(db, getCollectionPath('data_type_datasets'));
    
    const fieldToQuery = itemType === 'dataType' ? 'data_type_id' : 'dataset_id';
    
    // Delete existing links for this item
    const q = query(linksCollectionRef, where(fieldToQuery, "==", itemId));
    const existingLinksSnapshot = await getDocs(q);
    existingLinksSnapshot.forEach(doc => batch.delete(doc.ref));

    // Add new links
    linkedIds.forEach(linkedId => {
      const newLinkDoc = doc(linksCollectionRef);
      const linkData = itemType === 'dataType' 
        ? { data_type_id: itemId, dataset_id: linkedId }
        : { data_type_id: linkedId, dataset_id: itemId };
      batch.set(newLinkDoc, linkData);
    });

    await batch.commit();
  }

  const addDataType = async ({ dataType, linkedDatasetIds }: { dataType: Omit<DataType, 'id' | 'created_at'>; linkedDatasetIds: string[] }) => {
    if (!user) throw new Error("No user logged in");
    const newDataType = {
      ...dataType,
      created_at: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, getCollectionPath('data_types')), newDataType);
    await manageLinks(docRef.id, linkedDatasetIds, 'dataType');
  };

  const updateDataType = async ({ dataType, linkedDatasetIds }: { dataType: DataType; linkedDatasetIds: string[] }) => {
    if (!user) throw new Error("No user logged in");
    const { id, ...dataToUpdate } = dataType;
    await updateDoc(doc(db, getCollectionPath('data_types'), id), dataToUpdate as any);
    await manageLinks(id, linkedDatasetIds, 'dataType');
  };

  const deleteDataType = async (id: string) => {
    if (!user) throw new Error("No user logged in");
    await deleteDoc(doc(db, getCollectionPath('data_types'), id));
    await manageLinks(id, [], 'dataType'); // This will delete all associated links
  };
  
  const addDataset = async ({ dataset, linkedDataTypeIds }: { dataset: Omit<Dataset, 'id' | 'created_at'>; linkedDataTypeIds: string[] }) => {
    if (!user) throw new Error("No user logged in");
    const newDataset = {
        ...dataset,
        created_at: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, getCollectionPath('datasets')), newDataset);
    await manageLinks(docRef.id, linkedDataTypeIds, 'dataset');
  };

  const updateDataset = async ({ dataset, linkedDataTypeIds }: { dataset: Dataset; linkedDataTypeIds: string[] }) => {
    if (!user) throw new Error("No user logged in");
    const { id, ...dataToUpdate } = dataset;
    await updateDoc(doc(db, getCollectionPath('datasets'), id), dataToUpdate as any);
    await manageLinks(id, linkedDataTypeIds, 'dataset');
  };
  
  const deleteDataset = async (id: string) => {
    if (!user) throw new Error("No user logged in");
    await deleteDoc(doc(db, getCollectionPath('datasets'), id));
    await manageLinks(id, [], 'dataset');
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!user) throw new Error("No user logged in");
    await addDoc(collection(db, getCollectionPath('categories')), category);
  };

  const updateCategory = async (category: Category) => {
    if (!user) throw new Error("No user logged in");
    const { id, ...dataToUpdate } = category;
    await updateDoc(doc(db, getCollectionPath('categories'), id), dataToUpdate);
  };

  const deleteCategory = async (id: string) => {
    if (!user) throw new Error("No user logged in");
    const batch = writeBatch(db);
    
    const categoryToDelete = categories.find(c => c.id === id);
    if (!categoryToDelete) return;
    
    // Find datatypes with this category and update them to 'Uncategorized'
    const dataTypesToUpdateQuery = query(collection(db, getCollectionPath('data_types')), where("category", "==", categoryToDelete.name));
    const dataTypesSnapshot = await getDocs(dataTypesToUpdateQuery);
    dataTypesSnapshot.forEach(doc => {
      batch.update(doc.ref, { category: 'Uncategorized' });
    });
    
    // Delete the category document
    batch.delete(doc(db, getCollectionPath('categories'), id));
    
    await batch.commit();
  };
  
    const getAllData = () => {
        return { dataTypes, datasets, categories, dataTypeDatasets };
    }

    const importData = async (data: { dataTypes: DataType[], datasets: Dataset[], categories: Category[], dataTypeDatasets: DataTypeDataset[] }) => {
        if (!user) throw new Error("No user logged in");
        
        const collections = ['data_types', 'datasets', 'categories', 'data_type_datasets'];
        
        // Clear all existing data
        const deleteBatch = writeBatch(db);
        for (const coll of collections) {
            const snapshot = await getDocs(collection(db, getCollectionPath(coll)));
            snapshot.forEach(doc => deleteBatch.delete(doc.ref));
        }
        await deleteBatch.commit();
        
        // Add new data
        const addBatch = writeBatch(db);
        
        data.dataTypes.forEach(item => {
            const { id, ...rest } = item;
            const docRef = doc(db, getCollectionPath('data_types'), id);
            addBatch.set(docRef, rest);
        });
        
        data.datasets.forEach(item => {
            const { id, ...rest } = item;
            const docRef = doc(db, getCollectionPath('datasets'), id);
            addBatch.set(docRef, rest);
        });

        data.categories.forEach(item => {
            const { id, ...rest } = item;
            // Don't save the 'uncategorized' placeholder
            if (id !== 'uncategorized') {
              const docRef = doc(db, getCollectionPath('categories'), id);
              addBatch.set(docRef, rest);
            }
        });

        data.dataTypeDatasets.forEach(item => {
            const { id, ...rest } = item;
            const docRef = doc(db, getCollectionPath('data_type_datasets'), id);
            addBatch.set(docRef, rest);
        });

        await addBatch.commit();
    }


  const value = {
    dataTypes,
    datasets,
    categories,
    notifications,
    loading,
    getDataTypeById,
    getDatasetById,
    getDatasetsForDataType,
    getDataTypesForDataset,
    getDataTypeCountForDataset,
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
    getAllData,
    importData,
  };

  return (
    <DataContext.Provider value={value}>
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
