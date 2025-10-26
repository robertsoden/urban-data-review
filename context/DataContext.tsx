import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataType, Dataset, Category, Notification } from '../types';
import { mockDataTypes, mockDatasets, mockCategories } from '../data/mockData';

interface DataContextType {
  dataTypes: DataType[];
  datasets: Dataset[];
  categories: Category[];
  notifications: Notification[];
  loading: boolean;
  error: Error | null;
  addDataType: (dataType: Omit<DataType, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDataType: (id: string, dataType: Partial<DataType>) => Promise<void>;
  deleteDataType: (id: string) => Promise<void>;
  addDataset: (dataset: Omit<Dataset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDataset: (id: string, dataset: Partial<Dataset>) => Promise<void>;
  deleteDataset: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  clearNotification: (id: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Simulate fetching data from a mock source
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDataTypes(mockDataTypes);
        setDatasets(mockDatasets);
        setCategories(mockCategories);
        setError(null);
      } catch (e) {
        setError(e as Error);
        addNotification('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
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

  const addDataType = async (dataType: Omit<DataType, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDataType: DataType = {
      ...dataType,
      id: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDataTypes(prev => [...prev, newDataType]);
    addNotification('Data type added successfully', 'success');
  };

  const updateDataType = async (id: string, dataType: Partial<DataType>) => {
    setDataTypes(prev => prev.map(dt => dt.id === id ? { ...dt, ...dataType, updatedAt: new Date() } : dt));
    addNotification('Data type updated successfully', 'success');
  };

  const deleteDataType = async (id: string) => {
    setDataTypes(prev => prev.filter(dt => dt.id !== id));
    addNotification('Data type deleted successfully', 'success');
  };

  const addDataset = async (dataset: Omit<Dataset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDataset: Dataset = {
      ...dataset,
      id: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDatasets(prev => [...prev, newDataset]);
    addNotification('Dataset added successfully', 'success');
  };

  const updateDataset = async (id: string, dataset: Partial<Dataset>) => {
    setDatasets(prev => prev.map(ds => ds.id === id ? { ...ds, ...dataset, updatedAt: new Date() } : ds));
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

  return (
    <DataContext.Provider value={{
      dataTypes,
      datasets,
      categories,
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
