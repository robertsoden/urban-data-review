import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataType, Notification } from '../types';
import catalogData from '../data/catalog.json';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';

interface DataContextType {
  dataTypes: DataType[];
  notifications: Notification[];
  loading: boolean;
  isLocalOnly: boolean;
  updateDataType: (id: string, updates: Partial<DataType>) => void;
  deleteDataType: (id: string) => void;
  addNotification: (message: string, type: 'success' | 'error') => void;
  clearNotification: (id: number) => void;
  exportData: (format: 'json' | 'csv') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCALSTORAGE_KEY = 'urban-data-review-catalog';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLocalOnly, setIsLocalOnly] = useState<boolean>(false);

  // Load data: Firebase first, localStorage as fallback
  useEffect(() => {
    const loadData = async () => {
      // Try Firebase first
      if (db) {
        try {
          const querySnapshot = await getDocs(collection(db, 'dataTypes'));
          if (!querySnapshot.empty) {
            const firebaseData = querySnapshot.docs.map(doc => doc.data() as DataType);
            setDataTypes(firebaseData);
            // Also cache to localStorage
            localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(firebaseData));
            console.log(`[DataContext] Loaded ${firebaseData.length} items from Firebase`);
            setLoading(false);
            return;
          } else {
            // Firebase collection is empty - seed it from localStorage or catalog
            console.log('[DataContext] Firebase collection empty, seeding initial data...');
            const stored = localStorage.getItem(LOCALSTORAGE_KEY);
            let seedData: DataType[];
            if (stored) {
              seedData = JSON.parse(stored);
              console.log('[DataContext] Seeding Firebase from localStorage');
            } else {
              seedData = catalogData as DataType[];
              console.log('[DataContext] Seeding Firebase from catalog.json');
            }

            // Batch write to Firebase
            const batch = writeBatch(db);
            seedData.forEach(item => {
              batch.set(doc(db, 'dataTypes', item.id), item);
            });
            await batch.commit();
            console.log(`[DataContext] Seeded ${seedData.length} items to Firebase`);

            setDataTypes(seedData);
            localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(seedData));
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('[DataContext] Firebase load failed, falling back to localStorage:', e);
          setIsLocalOnly(true);
        }
      } else {
        console.warn('[DataContext] Firebase not configured, using local-only mode');
        setIsLocalOnly(true);
      }

      // Fallback to localStorage
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
          console.log(`[DataContext] Loaded ${data.length} items from localStorage (fallback)`);
        } catch (e) {
          console.error('[DataContext] Failed to parse localStorage, using catalog.json');
          setDataTypes(catalogData as DataType[]);
        }
      } else {
        setDataTypes(catalogData as DataType[]);
        console.log('[DataContext] Loaded from catalog.json (fallback)');
      }
      setLoading(false);
    };

    loadData();
  }, []);

  // Save to localStorage whenever dataTypes changes (as cache/backup)
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
        'example_url'
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

  return (
    <DataContext.Provider value={{
      dataTypes,
      notifications,
      loading,
      isLocalOnly,
      updateDataType,
      deleteDataType,
      addNotification,
      clearNotification,
      exportData,
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
