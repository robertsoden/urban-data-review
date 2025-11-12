import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/Card';
import { useData } from '../context/DataContext';
import { Page } from '../types';

interface ImportExportProps {
  navigate: (page: Page) => void;
}


const ImportExport: React.FC<ImportExportProps> = ({ navigate }) => {
    const { exportData, importData, addNotification, dataTypes, datasets } = useData();
    const [isImporting, setIsImporting] = useState(false);

    const exportAsCSV = () => {
        // Create a combined CSV with data types and datasets
        const csvRows: string[] = [];

        // Header row
        csvRows.push('Type,Name,Category,Description,Priority,Source Organization,URL,Format,Coverage,Resolution');

        // Add data types
        dataTypes.forEach(dt => {
            const row = [
                'Data Type',
                `"${dt.name.replace(/"/g, '""')}"`,
                `"${dt.category.replace(/"/g, '""')}"`,
                `"${(dt.description || '').replace(/"/g, '""')}"`,
                dt.priority,
                '', // no source org for data types
                '', // no URL for data types
                '', // no format
                '', // no coverage
                '' // no resolution
            ];
            csvRows.push(row.join(','));
        });

        // Add datasets
        datasets.forEach(ds => {
            const row = [
                'Dataset',
                `"${ds.name.replace(/"/g, '""')}"`,
                '', // no category for datasets
                `"${(ds.description || '').replace(/"/g, '""')}"`,
                '', // no priority
                `"${(ds.source_organization || '').replace(/"/g, '""')}"`,
                `"${(ds.url || '').replace(/"/g, '""')}"`,
                `"${(ds.format || '').replace(/"/g, '""')}"`,
                `"${(ds.geographic_coverage || '').replace(/"/g, '""')}"`,
                `"${(ds.resolution || '').replace(/"/g, '""')}"`,
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `urban-data-catalog-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        addNotification('Data exported as CSV successfully', 'success');
    };

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
            <div>
                <h1 className="text-3xl font-bold text-neutral-800">Import / Export</h1>
                <p className="mt-1 text-neutral-600">Manage your data catalog backups and exports.</p>
            </div>

            <Card>
                <CardHeader>Export Data</CardHeader>
                <CardContent>
                    <p className="text-neutral-600 mb-4">
                        Export all your data into a file format of your choice:
                    </p>
                    <ul className="text-neutral-600 mb-6 space-y-2">
                        <li className="flex items-start">
                            <span className="font-semibold text-neutral-800 min-w-[60px]">JSON:</span>
                            <span>Full backup including all relationships. Can be re-imported.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="font-semibold text-neutral-800 min-w-[60px]">CSV:</span>
                            <span>Simple spreadsheet format for data analysis in Excel or other tools.</span>
                        </li>
                    </ul>
                    <div className="flex gap-3">
                        <button
                            onClick={exportData}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium"
                        >
                            Export as JSON
                        </button>
                        <button
                            onClick={exportAsCSV}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
                        >
                            Export as CSV
                        </button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>Import Data</CardHeader>
                <CardContent>
                    <p className="text-neutral-600 mb-4">
                        Import data from a JSON file that was previously exported from this application.
                    </p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-md">
                        <p className="font-semibold text-yellow-900 mb-1">⚠️ Warning</p>
                        <p className="text-yellow-800 text-sm">
                            Importing a file will completely <strong>delete and overwrite</strong> all current data in the catalog. This action cannot be undone. Please be certain before proceeding.
                        </p>
                    </div>
                    <label htmlFor="import-file" className={`
                        inline-block px-4 py-2 rounded-lg shadow-sm cursor-pointer font-medium
                        ${isImporting ? 'bg-neutral-300 text-neutral-600 cursor-not-allowed' : 'bg-yellow-500 text-white hover:bg-yellow-600 transition-colors'}
                    `}>
                        {isImporting ? 'Importing...' : 'Choose JSON File to Import'}
                    </label>
                    <input
                        type="file"
                        id="import-file"
                        accept=".json"
                        className="hidden"
                        onChange={handleImport}
                        disabled={isImporting}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

export default ImportExport;