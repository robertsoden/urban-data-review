import React, { createContext, useContext, ReactNode, useMemo, useCallback, useEffect, useState } from 'react';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, writeBatch, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { DataType, Dataset, DataTypeDataset, Category, Notification } from '../types';

// Main application state
interface AppState {
  dataTypes: DataType[];
  datasets: Dataset[];
  dataTypeDatasets: DataTypeDataset[];
  categories: Category[];
  notifications: Notification[];
  loading: boolean;
}

// Functions to modify state (CRUD operations)
interface DataActions {
  addDataType: (payload: { dataType: Omit<DataType, 'id' | 'created_at'>; linkedDatasetIds: string[] }) => Promise<void>;
  updateDataType: (payload: { dataType: DataType; linkedDatasetIds: string[] }) => Promise<void>;
  deleteDataType: (id: string) => Promise<void>;
  addDataset: (payload: { dataset: Omit<Dataset, 'id' | 'created_at'>; linkedDataTypeIds: string[] }) => Promise<void>;
  updateDataset: (payload: { dataset: Dataset; linkedDataTypeIds: string[] }) => Promise<void>;
  deleteDataset: (id: string) => Promise<void>;
  addCategory: (payload: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (payload: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addNotification: (message: string, type: 'success' | 'error') => void;
  loadData: (payload: { dataTypes: any[], datasets: any[], dataTypeDatasets: any[] }) => Promise<void>;
}

// Functions to retrieve or compute derived state
interface DataGetters {
  getDataTypeById: (id: string) => DataType | undefined;
  getDatasetById: (id: string) => Dataset | undefined;
  getDatasetsForDataType: (dataTypeId: string) => Dataset[];
  getDataTypesForDataset: (datasetId: string) => DataType[];
  getDataTypeCountForDataset: (datasetId: string) => number;
  getCategoryByName: (name: string) => Category | undefined;
}

// The full context value
interface DataContextProps {
  state: AppState;
  actions: DataActions;
  getters: DataGetters;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

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

  const addNotification = useCallback((message: string, type: 'success' | 'error') => {
    const newNotification = { id: Date.now(), message, type };
    setState(s => ({ ...s, notifications: [newNotification, ...s.notifications] }));
    setTimeout(() => {
      setState(s => ({ ...s, notifications: s.notifications.filter(n => n.id !== newNotification.id) }));
    }, 4000);
  }, []);

  useEffect(() => {
    if (!user) {
      setState({ dataTypes: [], datasets: [], dataTypeDatasets: [], categories: [], notifications: [], loading: false });
      return;
    }

    setState(s => ({ ...s, loading: true }));

    const collections: (keyof AppState)[] = ['dataTypes', 'datasets', 'dataTypeDatasets', 'categories'];
    const unsubscribes = collections.map(coll =>
      onSnapshot(collection(db, coll), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setState(prevState => ({ ...prevState, [coll]: data as any }));
      }, (error) => {
        console.error(`Error fetching ${coll}:`, error);
        addNotification(`Failed to load ${coll}.`, 'error');
      })
    );

    const timer = setTimeout(() => setState(s => ({ ...s, loading: false })), 1500);

    return () => {
      unsubscribes.forEach(unsub => unsub());
      clearTimeout(timer);
    };
  }, [user, addNotification]);

  const actions = useMemo<DataActions>(() => ({
    addNotification,
    addDataType: async ({ dataType, linkedDatasetIds }) => {
      const newDataType = { ...dataType, created_at: new Date().toISOString() };
      const docRef = await addDoc(collection(db, 'dataTypes'), newDataType);
      const batch = writeBatch(db);
      linkedDatasetIds.forEach(dsId => {
        const linkRef = doc(collection(db, 'dataTypeDatasets'));
        batch.set(linkRef, { data_type_id: docRef.id, dataset_id: dsId });
      });
      await batch.commit();
      addNotification('Data Type added!', 'success');
    },
    updateDataType: async ({ dataType, linkedDatasetIds }) => {
      const { id, ...dataToUpdate } = dataType;
      await updateDoc(doc(db, 'dataTypes', id), dataToUpdate);
      const linksQuery = query(collection(db, "dataTypeDatasets"), where("data_type_id", "==", id));
      const querySnapshot = await getDocs(linksQuery);
      const batch = writeBatch(db);
      querySnapshot.forEach(doc => batch.delete(doc.ref));
      linkedDatasetIds.forEach(dsId => {
        const newLinkRef = doc(collection(db, 'dataTypeDatasets'));
        batch.set(newLinkRef, { data_type_id: id, dataset_id: dsId });
      });
      await batch.commit();
      addNotification('Data Type updated!', 'success');
    },
    deleteDataType: async (id) => {
      await deleteDoc(doc(db, 'dataTypes', id));
      const linksQuery = query(collection(db, "dataTypeDatasets"), where("data_type_id", "==", id));
      const querySnapshot = await getDocs(linksQuery);
      const batch = writeBatch(db);
      querySnapshot.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      addNotification('Data Type deleted.', 'success');
    },
    addDataset: async ({ dataset, linkedDataTypeIds }) => {
      const newDataset = { ...dataset, created_at: new Date().toISOString() };
      const docRef = await addDoc(collection(db, 'datasets'), newDataset);
      const batch = writeBatch(db);
      linkedDataTypeIds.forEach(dtId => {
        const linkRef = doc(collection(db, 'dataTypeDatasets'));
        batch.set(linkRef, { data_type_id: dtId, dataset_id: docRef.id });
      });
      await batch.commit();
      addNotification('Dataset added!', 'success');
    },
    updateDataset: async ({ dataset, linkedDataTypeIds }) => {
      const { id, ...dataToUpdate } = dataset;
      await updateDoc(doc(db, 'datasets', id), dataToUpdate);
      const linksQuery = query(collection(db, "dataTypeDatasets"), where("dataset_id", "==", id));
      const querySnapshot = await getDocs(linksQuery);
      const batch = writeBatch(db);
      querySnapshot.forEach(doc => batch.delete(doc.ref));
      linkedDataTypeIds.forEach(dtId => {
        const newLinkRef = doc(collection(db, 'dataTypeDatasets'));
        batch.set(newLinkRef, { data_type_id: dtId, dataset_id: id });
      });
      await batch.commit();
      addNotification('Dataset updated!', 'success');
    },
    deleteDataset: async (id) => {
      await deleteDoc(doc(db, 'datasets', id));
      const linksQuery = query(collection(db, "dataTypeDatasets"), where("dataset_id", "==", id));
      const querySnapshot = await getDocs(linksQuery);
      const batch = writeBatch(db);
      querySnapshot.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      addNotification('Dataset deleted.', 'success');
    },
    addCategory: async (payload) => {
      if (state.categories.some(c => c.name.toLowerCase() === payload.name.toLowerCase())) {
        addNotification(`Category "${payload.name}" already exists.`, 'error');
        return;
      }
      await addDoc(collection(db, 'categories'), payload);
      addNotification('Category added!', 'success');
    },
    updateCategory: async (payload) => {
      const { id, ...dataToUpdate } = payload;
      const oldCategory = state.categories.find(c => c.id === id);
      if (!oldCategory) return;
      await updateDoc(doc(db, 'categories', id), dataToUpdate);
      const q = query(collection(db, 'dataTypes'), where('category', '==', oldCategory.name));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => batch.update(doc.ref, { category: dataToUpdate.name }));
      await batch.commit();
      addNotification('Category updated!', 'success');
    },
    deleteCategory: async (id) => {
      const categoryToDelete = state.categories.find(c => c.id === id);
      if (!categoryToDelete) return;
      const q = query(collection(db, 'dataTypes'), where('category', '==', categoryToDelete.name));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => batch.update(doc.ref, { category: "Uncategorized" }));
      await batch.commit();
      await deleteDoc(doc(db, 'categories', id));
      addNotification('Category deleted.', 'success');
    },
    loadData: async (payload) => {
    const { dataTypes: importedDataTypes, datasets: importedDatasets, dataTypeDatasets: importedLinks } = payload;

    const batch = writeBatch(db);

    // 1. Clear existing data
    for (const coll of ['dataTypes', 'datasets', 'dataTypeDatasets', 'categories']) {
        const snapshot = await getDocs(collection(db, coll));
        snapshot.forEach(doc => batch.delete(doc.ref));
    }

    // 2. Import new data and create ID mappings
    const dataTypeIdMap: { [oldId: string]: string } = {};
    for (const dt of importedDataTypes) {
        const { id: oldId, ...data } = dt;
        const newDocRef = doc(collection(db, 'dataTypes'));
        batch.set(newDocRef, data);
        if (oldId) dataTypeIdMap[oldId] = newDocRef.id;
    }

    const datasetIdMap: { [oldId: string]: string } = {};
    for (const ds of importedDatasets) {
        const { id: oldId, ...data } = ds;
        const newDocRef = doc(collection(db, 'datasets'));
        batch.set(newDocRef, data);
        if (oldId) datasetIdMap[oldId] = newDocRef.id;
    }

    // 3. Re-create relationships with new IDs
    for (const link of importedLinks) {
        const newDataTypeId = dataTypeIdMap[link.data_type_id];
        const newDatasetId = datasetIdMap[link.dataset_id];
        if (newDataTypeId && newDatasetId) {
            const newLinkRef = doc(collection(db, 'dataTypeDatasets'));
            batch.set(newLinkRef, { data_type_id: newDataTypeId, dataset_id: newDatasetId });
        }
    }

    await batch.commit();
    addNotification("Data successfully imported!", "success");
    
    // Re-create categories from the imported dataTypes
    const uniqueCategories = [...new Set(importedDataTypes.map(dt => dt.category).filter(Boolean))];
    for (const categoryName of uniqueCategories) {
        if (!state.categories.some(c => c.name.toLowerCase() === categoryName.toLowerCase())) {
            await addDoc(collection(db, 'categories'), { name: categoryName, description: '' });
        }
    }
},

  }), [addNotification, state.categories]);

  const getters = useMemo<DataGetters>(() => ({
    getDataTypeById: (id) => state.dataTypes.find(dt => dt.id === id),
    getDatasetById: (id) => state.datasets.find(ds => ds.id === id),
    getDatasetsForDataType: (dataTypeId) => {
      const datasetIds = new Set(state.dataTypeDatasets.filter(link => link.data_type_id === dataTypeId).map(link => link.dataset_id));
      return state.datasets.filter(ds => datasetIds.has(ds.id));
    },
    getDataTypesForDataset: (datasetId) => {
      const dataTypeIds = new Set(state.dataTypeDatasets.filter(link => link.dataset_id === datasetId).map(link => link.data_type_id));
      return state.dataTypes.filter(dt => dataTypeIds.has(dt.id));
    },
    getDataTypeCountForDataset: (datasetId) => {
      return state.dataTypeDatasets.filter(link => link.dataset_id === datasetId).length;
    },
    getCategoryByName: (name) => state.categories.find(c => c.name.toLowerCase() === name.toLowerCase()),
  }), [state.dataTypes, state.datasets, state.dataTypeDatasets, state.categories]);

  const value = useMemo(() => ({ state, actions, getters }), [state, actions, getters]);

  return (
    <DataContext.Provider value={value}>
      {state.loading ? (
        <div className="flex items-center justify-center min-h-screen"><div>Loading Data...</div></div>
      ) : children}
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
