import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataType, Notification } from '../types';
import catalogData from '../data/catalog.json';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

interface DataContextType {
  dataTypes: DataType[];
  notifications: Notification[];
  loading: boolean;
  updateDataType: (id: string, updates: Partial<DataType>) => void;
  deleteDataType: (id: string) => void;
  addNotification: (message: string, type: 'success' | 'error') => void;
  clearNotification: (id: number) => void;
  exportData: (format: 'json' | 'csv') => void;
  getReviewedCount: () => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCALSTORAGE_KEY = 'urban-data-review-catalog';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load data: localStorage first, then catalog.json as fallback
  useEffect(() => {
    const stored = localStorage.getItem(LOCALSTORAGE_KEY);
    if (stored) {
      try {
        let data = JSON.parse(stored);
        // Migrate old field name inspire_theme -> category
        data = data.map((item: any) => {
          if ('inspire_theme' in item && !('category' in item)) {
            const { inspire_theme, ...rest } = item;
            return { ...rest, category: inspire_theme };
          }
          return item;
        });
        setDataTypes(data);
        console.log(`[DataContext] Loaded ${data.length} items from localStorage`);
      } catch (e) {
        console.error('[DataContext] Failed to parse localStorage, using catalog.json');
        setDataTypes(catalogData as DataType[]);
      }
    } else {
      setDataTypes(catalogData as DataType[]);
      console.log('[DataContext] Loaded from catalog.json');
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever dataTypes changes
  useEffect(() => {
    if (!loading && dataTypes.length > 0) {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(dataTypes));
    }
  }, [dataTypes, loading]);

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

  const updateDataType = (id: string, updates: Partial<DataType>) => {
    const updatedDataTypes = dataTypes.map(dt =>
      dt.id === id ? { ...dt, ...updates } : dt
    );
    setDataTypes(updatedDataTypes);

    // Also sync to Firebase if configured (fire and forget)
    if (db) {
      const updated = updatedDataTypes.find(dt => dt.id === id);
      if (updated) {
        setDoc(doc(db, 'dataTypes', id), updated)
          .then(() => console.log(`[DataContext] Synced ${id} to Firebase`))
          .catch(e => console.warn('[DataContext] Firebase sync failed:', e));
      }
    }

    addNotification('Saved', 'success');
  };

  const deleteDataType = (id: string) => {
    setDataTypes(prev => prev.filter(dt => dt.id !== id));

    // Also sync to Firebase if configured (fire and forget)
    if (db) {
      deleteDoc(doc(db, 'dataTypes', id))
        .then(() => console.log(`[DataContext] Deleted ${id} from Firebase`))
        .catch(e => console.warn('[DataContext] Firebase delete failed:', e));
    }

    addNotification('Data type deleted', 'success');
  };

  const exportData = (format: 'json' | 'csv') => {
    const dateStr = new Date().toISOString().split('T')[0];
    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === 'csv') {
      const headers = [
        'id', 'category', 'name', 'rdls_coverage', 'rdls_component',
        'inspire_spec', 'description', 'requirements', 'example_dataset',
        'example_url', 'comments', 'reviewed', 'review_notes'
      ];

      const escapeCSV = (value: string | boolean) => {
        const str = String(value ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = dataTypes.map(dt =>
        headers.map(h => escapeCSV(dt[h as keyof DataType])).join(',')
      );

      content = [headers.join(','), ...rows].join('\n');
      mimeType = 'text/csv';
      extension = 'csv';
    } else {
      content = JSON.stringify(dataTypes, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `urban-data-review-${dateStr}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addNotification(`Data exported as ${extension.toUpperCase()}`, 'success');
  };

  const getReviewedCount = () => {
    return dataTypes.filter(dt => dt.reviewed).length;
  };

  return (
    <DataContext.Provider value={{
      dataTypes,
      notifications,
      loading,
      updateDataType,
      deleteDataType,
      addNotification,
      clearNotification,
      exportData,
      getReviewedCount,
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
