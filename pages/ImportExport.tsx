import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/Card';
import { useData } from '../context/DataContext';
import { Page } from '../types';

interface ImportExportProps {
  navigate: (page: Page) => void;
}


const ImportExport: React.FC<ImportExportProps> = ({ navigate }) => {
    const { exportData, importData, addNotification, dataTypes, datasets, inspireThemes, dataTypeDatasets } = useData();
    const [isImporting, setIsImporting] = useState(false);

    const exportAsCSV = () => {
        const csvRows: string[] = [];

        const escapeCsvField = (field: any): string => {
            if (field === null || field === undefined) {
                return '';
            }
            const str = String(field);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        // Helper to get datasets for a data type
        const getDatasetsForDataType = (dataTypeId: string) => {
            const linkedDatasetIds = dataTypeDatasets
                .filter(dtd => dtd.data_type_id === dataTypeId)
                .map(dtd => dtd.dataset_id);
            return datasets.filter(ds => linkedDatasetIds.includes(ds.id));
        };

        // Combined header row with all fields from both data types and datasets
        const headers = [
            'row_type',
            'id',
            'data_type_id', // For datasets: which data type this is linked to
            // Data Type fields
            'name',
            'category',
            'inspire_annex',
            'inspire_spec',
            'description',
            'applicable_standards',
            'minimum_criteria',
            'rdls_coverage',
            'rdls_extension_module',
            // Dataset fields
            'url',
            'source_organization',
            'source_type',
            'geographic_coverage',
            'temporal_coverage',
            'format',
            'resolution',
            'access_type',
            'license',
            'is_validated',
            'is_primary_example',
            'quality_notes',
            'used_in_projects',
            // Shared
            'notes'
        ];
        csvRows.push(headers.join(','));

        // Process each data type with its associated datasets
        dataTypes.forEach(dt => {
            // Add data type row with all its fields
            csvRows.push([
                'DATA_TYPE',
                escapeCsvField(dt.id),
                '', // data_type_id (not applicable for data types)
                escapeCsvField(dt.name),
                escapeCsvField(dt.inspire_theme),
                escapeCsvField(dt.inspire_annex),
                escapeCsvField(dt.inspire_spec),
                escapeCsvField(dt.description),
                escapeCsvField(dt.applicable_standards),
                escapeCsvField(dt.minimum_criteria),
                escapeCsvField(dt.rdls_coverage),
                escapeCsvField(dt.rdls_extension_module),
                '', // url
                '', // source_organization
                '', // source_type
                '', // geographic_coverage
                '', // temporal_coverage
                '', // format
                '', // resolution
                '', // access_type
                '', // license
                '', // is_validated
                '', // is_primary_example
                '', // quality_notes
                '', // used_in_projects
                escapeCsvField(dt.notes)
            ].join(','));

            // Add associated dataset rows with all their fields
            const linkedDatasets = getDatasetsForDataType(dt.id);
            linkedDatasets.forEach(ds => {
                csvRows.push([
                    'DATASET',
                    escapeCsvField(ds.id),
                    escapeCsvField(dt.id), // data_type_id - links this dataset to the data type
                    escapeCsvField(ds.name),
                    '', // category
                    '', // inspire_annex
                    '', // inspire_spec
                    escapeCsvField(ds.description),
                    '', // applicable_standards
                    '', // minimum_criteria
                    '', // rdls_coverage
                    '', // rdls_extension_module
                    escapeCsvField(ds.url),
                    escapeCsvField(ds.source_organization),
                    escapeCsvField(ds.source_type),
                    escapeCsvField(ds.geographic_coverage),
                    escapeCsvField(ds.temporal_coverage),
                    escapeCsvField(ds.format),
                    escapeCsvField(ds.resolution),
                    escapeCsvField(ds.access_type),
                    escapeCsvField(ds.license),
                    escapeCsvField(ds.is_validated),
                    escapeCsvField(ds.is_primary_example),
                    escapeCsvField(ds.quality_notes),
                    escapeCsvField(ds.used_in_projects),
                    escapeCsvField(ds.notes)
                ].join(','));
            });
        });

        // Add categories at the end
        inspireThemes.forEach(theme => {
            csvRows.push([
                'CATEGORY',
                escapeCsvField(theme.id),
                '', // data_type_id
                escapeCsvField(theme.name),
                '', // category
                '', // inspire_annex
                '', // inspire_spec
                escapeCsvField(theme.description),
                '', '', '', '', // data type fields
                '', '', '', '', '', '', '', '', '', '', '', '', '', // dataset fields
                '' // notes
            ].join(','));
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
                            <span>Full backup in spreadsheet format. Edit in Excel and re-import.</span>
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
                        Import data from a JSON or CSV file that was previously exported from this application.
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
                        {isImporting ? 'Importing...' : 'Choose File to Import (JSON or CSV)'}
                    </label>
                    <input
                        type="file"
                        id="import-file"
                        accept=".json,.csv"
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