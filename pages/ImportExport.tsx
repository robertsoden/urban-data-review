import React, { useState } from 'react';
import Card, { CardHeader } from '../components/Card';
import { useData } from '../context/DataContext';
import { Page } from '../types';

interface ImportExportProps {
  navigate: (page: Page) => void;
}


const ImportExport: React.FC<ImportExportProps> = ({ navigate }) => {
    const { exportData, importData, addNotification } = useData();
    const [isImporting, setIsImporting] = useState(false);

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (window.confirm("Are you sure you want to import this file? This will overwrite all existing data.")) {
            setIsImporting(true);
            try {
                await importData(file);
                addNotification("Data imported successfully!", "success");
            } catch (error: any) {
                console.error("Import failed:", error);
                addNotification(`Import failed: ${error.message}`, "error");
            } finally {
                setIsImporting(false);
                // Reset file input
                if (event.target) {
                    event.target.value = '';
                }
            }
        } else {
             // Reset file input if user cancels
            if (event.target) {
                event.target.value = '';
            }
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>Export Data</CardHeader>
                <p className="text-slate-600 mb-4">
                    Export all your data (Data Types, Datasets, Categories, and their relationships) into a single JSON file. This file can be used as a backup or for importing into another instance of this application.
                </p>
                <button 
                    onClick={exportData}
                    className="bg-button-blue text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-sm"
                >
                    Export All Data as JSON
                </button>
            </Card>

            <Card>
                <CardHeader>Import Data</CardHeader>
                 <div className="prose prose-slate max-w-none prose-sm">
                    <p>
                        Import data from a JSON file that was previously exported from this application.
                    </p>
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-md">
                        <p className="font-bold text-red-800">Warning!</p>
                        <p className="text-red-700">Importing a file will completely <strong>delete and overwrite</strong> all current data in the catalog. This action cannot be undone. Please be certain before proceeding.</p>
                    </div>
                 </div>
                <div className="mt-4">
                    <label htmlFor="import-file" className={`
                        inline-block px-4 py-2 rounded-md shadow-sm cursor-pointer
                        ${isImporting ? 'bg-gray-400 text-gray-800' : 'bg-yellow-500 text-white hover:bg-yellow-600 transition-colors'}
                    `}>
                        {isImporting ? 'Importing...' : 'Choose JSON file to Import'}
                    </label>
                    <input 
                        type="file" 
                        id="import-file" 
                        accept=".json"
                        className="hidden"
                        onChange={handleImport}
                        disabled={isImporting}
                    />
                </div>
            </Card>
        </div>
    );
}

export default ImportExport;