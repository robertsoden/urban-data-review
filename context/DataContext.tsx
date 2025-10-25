import React, { createContext, useContext, useReducer, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { DataType, Dataset, DataTypeDataset, Category, Notification } from '../types';

// State and Action Types
interface AppState {
  dataTypes: DataType[];
  datasets: Dataset[];
  dataTypeDatasets: DataTypeDataset[];
  categories: Category[];
  notifications: Notification[];
}

type Action =
  | { type: 'LOAD_DATA'; payload: { dataTypes: DataType[], datasets: Dataset[], dataTypeDatasets: DataTypeDataset[] } }
  | { type: 'ADD_DATATYPE'; payload: { dataType: Omit<DataType, 'id' | 'created_at'>; linkedDatasetIds: number[] } }
  | { type: 'UPDATE_DATATYPE'; payload: { dataType: DataType; linkedDatasetIds: number[] } }
  | { type: 'DELETE_DATATYPE'; payload: number }
  | { type: 'ADD_DATASET'; payload: { dataset: Omit<Dataset, 'id' | 'created_at'>; linkedDataTypeIds: number[] } }
  | { type: 'UPDATE_DATASET'; payload: { dataset: Dataset; linkedDataTypeIds: number[] } }
  | { type: 'DELETE_DATASET'; payload: number }
  | { type: 'ADD_CATEGORY'; payload: Omit<Category, 'id'> }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: { message: string; type: 'success' | 'error' } }
  | { type: 'REMOVE_NOTIFICATION'; payload: number };

const generateCategoriesFromDataTypes = (dataTypes: DataType[]): Category[] => {
    const uniqueCategoryNames = [...new Set(dataTypes.map(dt => dt.category).filter(Boolean))].sort();
    return uniqueCategoryNames.map((name, index) => ({
        id: index + 1, // Simple ID generation
        name,
        description: '', // Description can be added later via management
    }));
};

// Reducer
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOAD_DATA': {
        const newCategories = generateCategoriesFromDataTypes(action.payload.dataTypes);
        return {
            ...state,
            dataTypes: action.payload.dataTypes,
            datasets: action.payload.datasets,
            dataTypeDatasets: action.payload.dataTypeDatasets,
            categories: newCategories,
        };
    }
    
    // DataType actions
    case 'ADD_DATATYPE': {
      const newId = (state.dataTypes.reduce((max, dt) => Math.max(dt.id, max), 0) || 0) + 1;
      const newDataType: DataType = { ...action.payload.dataType, id: newId, created_at: new Date().toISOString() };
      const newLinks: DataTypeDataset[] = action.payload.linkedDatasetIds.map(dsId => ({
        id: Date.now() + dsId,
        data_type_id: newId,
        dataset_id: dsId,
      }));
      const newState = { ...state, dataTypes: [...state.dataTypes, newDataType], dataTypeDatasets: [...state.dataTypeDatasets, ...newLinks] };
      // Check if new category needs to be added
      if (!newState.categories.some(c => c.name === newDataType.category)) {
          newState.categories = generateCategoriesFromDataTypes(newState.dataTypes);
      }
      return newState;
    }
    case 'UPDATE_DATATYPE': {
      const updatedDataTypes = state.dataTypes.map(dt => dt.id === action.payload.dataType.id ? action.payload.dataType : dt);
      const otherLinks = state.dataTypeDatasets.filter(link => link.data_type_id !== action.payload.dataType.id);
      const newLinks: DataTypeDataset[] = action.payload.linkedDatasetIds.map(dsId => ({
        id: Date.now() + dsId,
        data_type_id: action.payload.dataType.id,
        dataset_id: dsId
      }));
       const newState = { ...state, dataTypes: updatedDataTypes, dataTypeDatasets: [...otherLinks, ...newLinks] };
       // Regenerate categories in case a data type's category was changed to a new one
       newState.categories = generateCategoriesFromDataTypes(newState.dataTypes);
       return newState;
    }
    case 'DELETE_DATATYPE': {
      const dtId = action.payload;
      const newState = {
        ...state,
        dataTypes: state.dataTypes.filter(dt => dt.id !== dtId),
        dataTypeDatasets: state.dataTypeDatasets.filter(link => link.data_type_id !== dtId),
      };
      // Regenerate categories in case the last item of a category was deleted
      newState.categories = generateCategoriesFromDataTypes(newState.dataTypes);
      return newState;
    }
    
    // Dataset actions
    case 'ADD_DATASET': {
      const newId = (state.datasets.reduce((max, ds) => Math.max(ds.id, max), 0) || 0) + 1;
      const newDataset: Dataset = { ...action.payload.dataset, id: newId, created_at: new Date().toISOString() };
      const newLinks: DataTypeDataset[] = action.payload.linkedDataTypeIds.map(dtId => ({
        id: Date.now() + dtId,
        data_type_id: dtId,
        dataset_id: newId,
      }));
      return { ...state, datasets: [...state.datasets, newDataset], dataTypeDatasets: [...state.dataTypeDatasets, ...newLinks] };
    }
    case 'UPDATE_DATASET': {
      const updatedDatasets = state.datasets.map(ds => ds.id === action.payload.dataset.id ? action.payload.dataset : ds);
      const otherLinks = state.dataTypeDatasets.filter(link => link.dataset_id !== action.payload.dataset.id);
      const newLinks: DataTypeDataset[] = action.payload.linkedDataTypeIds.map(dtId => ({
        id: Date.now() + dtId,
        data_type_id: dtId,
        dataset_id: action.payload.dataset.id
      }));
      return { ...state, datasets: updatedDatasets, dataTypeDatasets: [...otherLinks, ...newLinks] };
    }
    case 'DELETE_DATASET': {
      const dsId = action.payload;
      return {
        ...state,
        datasets: state.datasets.filter(ds => ds.id !== dsId),
        dataTypeDatasets: state.dataTypeDatasets.filter(link => link.dataset_id !== dsId),
      };
    }
    
    // Category actions
    case 'ADD_CATEGORY': {
      const newId = (state.categories.reduce((max, cat) => Math.max(cat.id, max), 0) || 0) + 1;
      const newCategory: Category = { ...action.payload, id: newId };
      // Prevent adding duplicate category names
      if (state.categories.some(c => c.name.toLowerCase() === newCategory.name.toLowerCase())) {
          return {
              ...state,
              notifications: [...state.notifications, { id: Date.now(), message: `Category "${newCategory.name}" already exists.`, type: 'error' }]
          }
      }
      return { ...state, categories: [...state.categories, newCategory].sort((a,b) => a.name.localeCompare(b.name)) };
    }
    case 'UPDATE_CATEGORY': {
        const updatedCategory = action.payload;
        const oldCategory = state.categories.find(c => c.id === updatedCategory.id);
        if (!oldCategory) return state;

        const updatedDataTypes = state.dataTypes.map(dt => {
            if (dt.category === oldCategory.name) {
                return { ...dt, category: updatedCategory.name };
            }
            return dt;
        });
        return {
            ...state,
            categories: state.categories.map(c => c.id === updatedCategory.id ? updatedCategory : c),
            dataTypes: updatedDataTypes
        };
    }
    case 'DELETE_CATEGORY': {
        const categoryId = action.payload;
        const categoryToDelete = state.categories.find(c => c.id === categoryId);
        if (!categoryToDelete) return state;

        const updatedDataTypes = state.dataTypes.map(dt => {
            if (dt.category === categoryToDelete.name) {
                return { ...dt, category: "Uncategorized" };
            }
            return dt;
        });
        
        const newState = {
             ...state, 
             categories: state.categories.filter(c => c.id !== categoryId),
             dataTypes: updatedDataTypes
        };
        
        // If we moved items to Uncategorized, ensure it exists
        if (updatedDataTypes.some(dt => dt.category === "Uncategorized") && !newState.categories.some(c => c.name === "Uncategorized")) {
             const newId = (newState.categories.reduce((max, cat) => Math.max(cat.id, max), 0) || 0) + 1;
             newState.categories.push({ id: newId, name: "Uncategorized", description: "Items not assigned to a category." });
        }
        
        return newState;
    }

    // Notification actions
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, { ...action.payload, id: Date.now() }],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    default:
      return state;
  }
};

// Initial State and localStorage logic
const emptyState: AppState = {
  dataTypes: [],
  datasets: [],
  dataTypeDatasets: [],
  categories: [],
  notifications: [],
};

const getInitialState = (): AppState => {
  try {
    const serializedState = localStorage.getItem('urbanDataCatalogState');
    if (serializedState === null) {
      return emptyState;
    }
    const storedState = JSON.parse(serializedState);
    
    if (storedState.dataTypes && storedState.datasets && storedState.dataTypeDatasets) {
        // Always derive categories from dataTypes on load to ensure consistency
        const derivedCategories = generateCategoriesFromDataTypes(storedState.dataTypes);
        // Preserve descriptions if possible
        storedState.categories = derivedCategories.map(derivedCat => {
            const existingCat = (storedState.categories as Category[]).find(c => c.name === derivedCat.name);
            return existingCat ? { ...derivedCat, description: existingCat.description } : derivedCat;
        });
        return storedState;
    }
    return emptyState;
  } catch (err) {
    console.error("Could not load state from localStorage", err);
    return emptyState;
  }
};


// Context Definition
interface DataContextProps {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getDataTypeById: (id: number) => DataType | undefined;
  getDatasetById: (id: number) => Dataset | undefined;
  getDatasetsForDataType: (dataTypeId: number) => Dataset[];
  getDataTypesForDataset: (datasetId: number) => DataType[];
  getDataTypeCountForDataset: (datasetId: number) => number;
  addNotification: (message: string, type: 'success' | 'error') => void;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);


// Provider Component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, getInitialState());

  useEffect(() => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('urbanDataCatalogState', serializedState);
    } catch (err) {
      console.error("Could not save state to localStorage", err);
    }
  }, [state]);

  const getDataTypeById = useCallback((id: number) => state.dataTypes.find(dt => dt.id === id), [state.dataTypes]);
  const getDatasetById = useCallback((id: number) => state.datasets.find(ds => ds.id === id), [state.datasets]);
  
  const getDatasetsForDataType = useCallback((dataTypeId: number) => {
    const datasetIds = new Set(state.dataTypeDatasets.filter(link => link.data_type_id === dataTypeId).map(link => link.dataset_id));
    return state.datasets.filter(ds => datasetIds.has(ds.id));
  }, [state.dataTypeDatasets, state.datasets]);

  const getDataTypesForDataset = useCallback((datasetId: number) => {
    const dataTypeIds = new Set(state.dataTypeDatasets.filter(link => link.dataset_id === datasetId).map(link => link.data_type_id));
    return state.dataTypes.filter(dt => dataTypeIds.has(dt.id));
  }, [state.dataTypeDatasets, state.dataTypes]);

  const getDataTypeCountForDataset = useCallback((datasetId: number) => {
      return state.dataTypeDatasets.filter(link => link.dataset_id === datasetId).length;
  }, [state.dataTypeDatasets]);

  const addNotification = useCallback((message: string, type: 'success' | 'error') => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message, type } });
  }, []);

  const value = useMemo(() => ({
    state,
    dispatch,
    getDataTypeById,
    getDatasetById,
    getDatasetsForDataType,
    getDataTypesForDataset,
    getDataTypeCountForDataset,
    addNotification,
  }), [state, getDataTypeById, getDatasetById, getDatasetsForDataType, getDataTypesForDataset, getDataTypeCountForDataset, addNotification]);

  return (
    <DataContext.Provider value={value}>
      {children}
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