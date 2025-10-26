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
  Priority,
  CompletionStatus,
  RdlsStatus,
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
  exportData: () => void;
  importData: (file: File) => Promise<void>;
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
        setCategories(data);
      }),
      onSnapshot(query(collection(db, getCollectionPath('data_type_datasets'))), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DataTypeDataset));
        setDataTypeDatasets(data);
      }),
    ];
    
    const timer = setTimeout(() => setLoading(false), 1500);

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
    
    const q = query(linksCollectionRef, where(fieldToQuery, "==", itemId));
    const existingLinksSnapshot = await getDocs(q);
    existingLinksSnapshot.forEach(doc => batch.delete(doc.ref));

    linkedIds.forEach(linkedId => {
      const newLinkDocRef = doc(linksCollectionRef);
      const linkData = itemType === 'dataType' 
        ? { data_type_id: itemId, dataset_id: linkedId }
        : { data_type_id: linkedId, dataset_id: itemId };
      batch.set(newLinkDocRef, linkData);
    });

    await batch.commit();
  }

  const addDataType = async ({ dataType, linkedDatasetIds }: { dataType: Omit<DataType, 'id' | 'created_at'>; linkedDatasetIds: string[] }) => {
    if (!user) throw new Error("No user logged in");
    const newDataType = { ...dataType, created_at: new Date().toISOString() };
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
    await manageLinks(id, [], 'dataType');
  };
  
  const addDataset = async ({ dataset, linkedDataTypeIds }: { dataset: Omit<Dataset, 'id' | 'created_at'>; linkedDataTypeIds: string[] }) => {
    if (!user) throw new Error("No user logged in");
    const newDataset = { ...dataset, created_at: new Date().toISOString() };
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
    
    const dataTypesToUpdateQuery = query(collection(db, getCollectionPath('data_types')), where("category", "==", categoryToDelete.name));
    const dataTypesSnapshot = await getDocs(dataTypesToUpdateQuery);
    dataTypesSnapshot.forEach(doc => {
      batch.update(doc.ref, { category: 'Uncategorized' });
    });
    
    batch.delete(doc(db, getCollectionPath('categories'), id));
    
    await batch.commit();
  };

    const exportData = () => {
        const data = { dataTypes, datasets, categories: categories.filter(c => c.id !== 'uncategorized'), dataTypeDatasets };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const link = document.createElement('a');
        link.href = jsonString;
        link.download = `urban_data_catalog_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        addNotification("Data exported successfully.", "success");
    };

    const sanitizeDataType = (dt: any): Omit<DataType, 'id'> => {
        let sanitizedDT = { ...dt };
        delete sanitizedDT.id;

        if (!Object.values(Priority).includes(sanitizedDT.priority)) {
            sanitizedDT.priority = Priority.Unassigned;
        }
        if (!Object.values(CompletionStatus).includes(sanitizedDT.completion_status)) {
            sanitizedDT.completion_status = CompletionStatus.NotStarted;
        }
        
        // Handle abbreviations and invalid values for rdls_can_handle
        const rdlsMap: { [key: string]: RdlsStatus } = {
            "Y": RdlsStatus.Yes,
            "N": RdlsStatus.No,
            "P": RdlsStatus.Partial,
            "C": RdlsStatus.Check,
        };

        if (rdlsMap[sanitizedDT.rdls_can_handle]) {
            sanitizedDT.rdls_can_handle = rdlsMap[sanitizedDT.rdls_can_handle];
        } else if (!Object.values(RdlsStatus).includes(sanitizedDT.rdls_can_handle)) {
            sanitizedDT.rdls_can_handle = RdlsStatus.Unassigned;
        }

        return sanitizedDT;
    }

    const importData = async (file: File) => {
        if (!user) throw new Error("No user logged in");

        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.dataTypes || !data.datasets || !data.categories || !data.dataTypeDatasets) {
            throw new Error("Invalid JSON structure. Missing required keys.");
        }

        // 1. Clear all existing data
        const collections = ['data_types', 'datasets', 'categories', 'data_type_datasets'];
        const deleteBatch = writeBatch(db);
        for (const coll of collections) {
            const snapshot = await getDocs(collection(db, getCollectionPath(coll)));
            snapshot.forEach(doc => deleteBatch.delete(doc.ref));
        }
        await deleteBatch.commit();

        // 2. Import new data with ID mapping
        const batch = writeBatch(db);
        const oldToNewIdMap = new Map<string, string>();

        // Process Data Types
        for (const dt of data.dataTypes) {
            // FIX: Use String() for safer type conversion from potentially untrusted JSON.
            const oldId = String(dt.id);
            const sanitizedData = sanitizeDataType(dt);
            const newDocRef = doc(collection(db, getCollectionPath('data_types')));
            batch.set(newDocRef, sanitizedData);
            oldToNewIdMap.set(oldId, newDocRef.id);
        }

        // Process Datasets
        for (const ds of data.datasets) {
            // FIX: Use String() for safer type conversion from potentially untrusted JSON.
            const oldId = String(ds.id);
            const { id, ...rest } = ds;
            const newDocRef = doc(collection(db, getCollectionPath('datasets')));
            batch.set(newDocRef, rest);
            oldToNewIdMap.set(oldId, newDocRef.id);
        }
        
        // Process Categories
        const importedCategories = data.categories.map((c: any) => c.name);
        for (const cat of data.categories) {
            const { id, ...rest } = cat;
            const newDocRef = doc(collection(db, getCollectionPath('categories')));
            batch.set(newDocRef, rest);
        }

        // Sanitize data types to ensure their categories exist
        for (const dt of data.dataTypes) {
             if (!importedCategories.includes(dt.category)) {
                 // FIX: Use String() for safer type conversion from potentially untrusted JSON.
                 const newId = oldToNewIdMap.get(String(dt.id));
                 if (newId) {
                     const docRef = doc(db, getCollectionPath('data_types'), newId);
                     batch.update(docRef, { category: 'Uncategorized' });
                 }
             }
        }

        await batch.commit();
        
        // 3. Process links using the ID map
        const linkBatch = writeBatch(db);
        for (const link of data.dataTypeDatasets) {
            // FIX: Use String() for safer type conversion from potentially untrusted JSON.
            const newDataTypeId = oldToNewIdMap.get(String(link.data_type_id));
            // FIX: Use String() for safer type conversion from potentially untrusted JSON.
            const newDatasetId = oldToNewIdMap.get(String(link.dataset_id));

            if (newDataTypeId && newDatasetId) {
                const newLinkRef = doc(collection(db, getCollectionPath('data_type_datasets')));
                linkBatch.set(newLinkRef, {
                    data_type_id: newDataTypeId,
                    dataset_id: newDatasetId,
                    relationship_notes: link.relationship_notes || ""
                });
            }
        }
        await linkBatch.commit();
    };


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
    exportData,
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
