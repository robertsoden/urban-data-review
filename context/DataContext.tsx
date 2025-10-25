import React, { createContext, useContext, ReactNode, useMemo, useCallback, useEffect, useState } from 'react';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, writeBatch, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { DataType, Dataset, DataTypeDataset, Category, Notification } from '../types';

// State and Action Types
interface AppState {
  dataTypes: DataType[];
  datasets: Dataset[];
  dataTypeDatasets: DataTypeDataset[];
  categories: Category[];
  notifications: Notification[];
  loading: boolean;
}

// Context Definition
interface DataContextProps {
  state: AppState;
  addDataType: (payload: { dataType: Omit<DataType, 'id' | 'created_at'>; linkedDatasetIds: number[] }) => Promise<void>;
  updateDataType: (payload: { dataType: DataType; linkedDatasetIds: number[] }) => Promise<void>;
  deleteDataType: (id: string) => Promise<void>;
  addDataset: (payload: { dataset: Omit<Dataset, 'id' | 'created_at'>; linkedDataTypeIds: number[] }) => Promise<void>;
  updateDataset: (payload: { dataset: Dataset; linkedDataTypeIds: number[] }) => Promise<void>;
  deleteDataset: (id: string) => Promise<void>;
  addCategory: (payload: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (payload: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getDataTypeById: (id: string) => DataType | undefined;
  getDatasetById: (id: string) => Dataset | undefined;
  getDatasetsForDataType: (dataTypeId: string) => Dataset[];
  getDataTypesForDataset: (datasetId: string) => DataType[];
  getDataTypeCountForDataset: (datasetId: string) => number;
  addNotification: (message: string, type: 'success' | 'error') => void;
  loadData: (payload: { dataTypes: any[], datasets: any[], dataTypeDatasets: any[] }) => Promise<void>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

// Provider Component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<AppState>({
    dataTypes: [],
    datasets: [],
    dataTypeDatasets: [],
    categories: [],
    notifications: [],
    loading: true,
  });

  // Real-time listeners for Firestore collections
  useEffect(() => {
    if (!user) {
        setState(s => ({...s, loading: false}));
        return;
    }

    setState(s => ({ ...s, loading: true }));
    
    const collections = ['dataTypes', 'datasets', 'dataTypeDatasets', 'categories'];
    const unsubscribes = collections.map(coll => 
        onSnapshot(collection(db, coll), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setState(prevState => ({ ...prevState, [coll]: data }));
        }, (error) => {
            console.error(`Error fetching ${coll}:`, error);
            addNotification(`Failed to load ${coll}.`, 'error');
        })
    );

    // Set loading to false after a short delay to allow initial data to populate
    const timer = setTimeout(() => {
        setState(s => ({...s, loading: false}));
    }, 1500);

    return () => {
        unsubscribes.forEach(unsub => unsub());
        clearTimeout(timer);
    };
  }, [user]);

  // Notification Management
  const addNotification = useCallback((message: string, type: 'success' | 'error') => {
    const newNotification = { id: Date.now(), message, type };
    setState(s => ({ ...s, notifications: [newNotification] }));
    setTimeout(() => {
        setState(s => ({...s, notifications: s.notifications.filter(n => n.id !== newNotification.id)}));
    }, 3000);
  }, []);
  
  // CRUD Operations
  const addDataType = async (payload: { dataType: Omit<DataType, 'id' | 'created_at'>; linkedDatasetIds: number[] }) => {
     const newDataType = { ...payload.dataType, created_at: new Date().toISOString() };
     const docRef = await addDoc(collection(db, 'dataTypes'), newDataType);
     // This is not efficient, but simple for this structure.
     // In a real app, relationships might be stored as an array in the document.
     const batch = writeBatch(db);
     payload.linkedDatasetIds.forEach(dsId => {
         const linkRef = doc(collection(db, 'dataTypeDatasets'));
         batch.set(linkRef, { data_type_id: docRef.id, dataset_id: dsId });
     });
     await batch.commit();
  };

  const updateDataType = async (payload: { dataType: DataType; linkedDatasetIds: number[] }) => {
    const { id, ...dataToUpdate } = payload.dataType;
    await updateDoc(doc(db, 'dataTypes', id), dataToUpdate);
    
    const linksQuery = query(collection(db, "dataTypeDatasets"), where("data_type_id", "==", id));
    const querySnapshot = await getDocs(linksQuery);
    const batch = writeBatch(db);
    querySnapshot.forEach(doc => batch.delete(doc.ref));
    
    payload.linkedDatasetIds.forEach(dsId => {
        const newLinkRef = doc(collection(db, 'dataTypeDatasets'));
        batch.set(newLinkRef, { data_type_id: id, dataset_id: dsId });
    });
    await batch.commit();
  };

  const deleteDataType = async (id: string) => {
    await deleteDoc(doc(db, 'dataTypes', id));
    // Also delete links
    const linksQuery = query(collection(db, "dataTypeDatasets"), where("data_type_id", "==", id));
    const querySnapshot = await getDocs(linksQuery);
    const batch = writeBatch(db);
    querySnapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  };
  
  const addDataset = async (payload: { dataset: Omit<Dataset, 'id' | 'created_at'>; linkedDataTypeIds: number[] }) => {
      const newDataset = { ...payload.dataset, created_at: new Date().toISOString() };
      const docRef = await addDoc(collection(db, 'datasets'), newDataset);
      const batch = writeBatch(db);
      payload.linkedDataTypeIds.forEach(dtId => {
          const linkRef = doc(collection(db, 'dataTypeDatasets'));
          batch.set(linkRef, { data_type_id: dtId, dataset_id: docRef.id });
      });
      await batch.commit();
  };
  
  const updateDataset = async (payload: { dataset: Dataset; linkedDataTypeIds: number[] }) => {
    const { id, ...dataToUpdate } = payload.dataset;
    await updateDoc(doc(db, 'datasets', id), dataToUpdate);

    const linksQuery = query(collection(db, "dataTypeDatasets"), where("dataset_id", "==", id));
    const querySnapshot = await getDocs(linksQuery);
    const batch = writeBatch(db);
    querySnapshot.forEach(doc => batch.delete(doc.ref));
    
    payload.linkedDataTypeIds.forEach(dtId => {
        const newLinkRef = doc(collection(db, 'dataTypeDatasets'));
        batch.set(newLinkRef, { data_type_id: dtId, dataset_id: id });
    });
    await batch.commit();
  };

  const deleteDataset = async (id: string) => {
     await deleteDoc(doc(db, 'datasets', id));
     // Also delete links
    const linksQuery = query(collection(db, "dataTypeDatasets"), where("dataset_id", "==", id));
    const querySnapshot = await getDocs(linksQuery);
    const batch = writeBatch(db);
    querySnapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  };
  
  const addCategory = async (payload: Omit<Category, 'id'>) => {
      if (state.categories.some(c => c.name.toLowerCase() === payload.name.toLowerCase())) {
        addNotification(`Category "${payload.name}" already exists.`, 'error');
        return;
      }
      await addDoc(collection(db, 'categories'), payload);
  };
  
  const updateCategory = async (payload: Category) => {
    const { id, ...dataToUpdate } = payload;
    const oldCategoryName = state.categories.find(c => c.id === id)?.name;
    
    if (!oldCategoryName) return;

    await updateDoc(doc(db, 'categories', id), dataToUpdate);

    // Update all dataTypes using this category
    const q = query(collection(db, 'dataTypes'), where('category', '==', oldCategoryName));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { category: dataToUpdate.name });
    });
    await batch.commit();
  };
  
  const deleteCategory = async (id: string) => {
      const categoryToDelete = state.categories.find(c => c.id === id);
      if (!categoryToDelete) return;
      
      // Reassign data types
      const q = query(collection(db, 'dataTypes'), where('category', '==', categoryToDelete.name));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
          batch.update(doc.ref, { category: "Uncategorized" });
      });
      await batch.commit();
      
      await deleteDoc(doc(db, 'categories', id));
  };

  const loadData = async (payload: { dataTypes: any[], datasets: any[], dataTypeDatasets: any[] }) => {
      const batch = writeBatch(db);
      payload.dataTypes.forEach(dt => {
        const {id, ...data} = dt;
        const ref = doc(collection(db, 'dataTypes'));
        batch.set(ref, data);
      });
      payload.datasets.forEach(ds => {
        const {id, ...data} = ds;
        const ref = doc(collection(db, 'datasets'));
        batch.set(ref, data);
      });
      // This simple mapping won't work for links, as IDs change.
      // This function would need to be much more complex for a real import, mapping old IDs to new doc IDs.
      // For now, it will just import the core data.
      await batch.commit();
      addNotification("Bulk data import is complex. Data types and datasets imported, but links need manual re-creation.", "error");
  }

  // Data retrieval helpers
  const getDataTypeById = useCallback((id: string) => state.dataTypes.find(dt => dt.id === id), [state.dataTypes]);
  const getDatasetById = useCallback((id: string) => state.datasets.find(ds => ds.id === id), [state.datasets]);
  
  const getDatasetsForDataType = useCallback((dataTypeId: string) => {
    const datasetIds = new Set(state.dataTypeDatasets.filter(link => link.data_type_id === dataTypeId).map(link => link.dataset_id));
    return state.datasets.filter(ds => datasetIds.has(ds.id));
  }, [state.dataTypeDatasets, state.datasets]);

  const getDataTypesForDataset = useCallback((datasetId: string) => {
    const dataTypeIds = new Set(state.dataTypeDatasets.filter(link => link.dataset_id === datasetId).map(link => link.data_type_id));
    return state.dataTypes.filter(dt => dataTypeIds.has(dt.id));
  }, [state.dataTypeDatasets, state.dataTypes]);

  const getDataTypeCountForDataset = useCallback((datasetId: string) => {
      return state.dataTypeDatasets.filter(link => link.dataset_id === datasetId).length;
  }, [state.dataTypeDatasets]);

  const value = useMemo(() => ({
    state,
    addDataType, updateDataType, deleteDataType,
    addDataset, updateDataset, deleteDataset,
    addCategory, updateCategory, deleteCategory,
    getDataTypeById, getDatasetById, getDatasetsForDataType, getDataTypesForDataset, getDataTypeCountForDataset,
    addNotification, loadData
  }), [state, addNotification]);

  return (
    <DataContext.Provider value={value}>
      {!state.loading ? children : <div className="flex items-center justify-center min-h-screen"><div>Loading Data...</div></div>}
    </DataContext.Provider>
  );
};

// Custom Hook
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return { ...context.state, ...context };
};