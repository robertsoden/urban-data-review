import React, { useRef } from 'react';
import { useData } from '../context/DataContext';
import { Page, DataType, Dataset, DataTypeDataset } from '../types';
import Card, { CardHeader } from '../components/Card';

interface ImportExportProps {
  navigate: (page: Page) => void;
}

const ImportExport: React.FC<ImportExportProps> = ({ navigate }) => {
  const { state, actions } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataToExport = {
      dataTypes: state.dataTypes,
      datasets: state.datasets,
      dataTypeDatasets: state.dataTypeDatasets,
    };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'urban_data_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    actions.addNotification('Data exported successfully!', 'success');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('File content is not valid text.');
        }
        const parsedData = JSON.parse(text);

        // Basic validation
        if (
          !Array.isArray(parsedData.dataTypes) ||
          !Array.isArray(parsedData.datasets) ||
          !Array.isArray(parsedData.dataTypeDatasets)
        ) {
          throw new Error('Invalid JSON structure. Missing required data arrays.');
        }

        await actions.loadData({
          dataTypes: parsedData.dataTypes as DataType[],
          datasets: parsedData.datasets as Dataset[],
          dataTypeDatasets: parsedData.dataTypeDatasets as DataTypeDataset[],
        });
        
        actions.addNotification('Data import initiated!', 'success');
        navigate({ name: 'dashboard' });

      } catch (error) {
        let message = 'An error occurred during import.';
        if (error instanceof Error) {
          message = `Import failed: ${error.message}`;
        }
        console.error('Import Error:', error);
        actions.addNotification(message, 'error');
      } finally {
        // Reset file input to allow re-uploading the same file
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  const jsonFormatExample = `{
  "dataTypes": [
    {
      "id": 1,
      "uid": "INF-001",
      "name": "Building Footprints",
      "...": "..."
    }
  ],
  "datasets": [
    {
      "id": 101,
      "name": "OSM Buildings for Nairobi",
      "...": "..."
    }
  ],
  "dataTypeDatasets": [
    {
      "id": 1,
      "data_type_id": 1,
      "dataset_id": 101,
      "relationship_notes": ""
    }
  ]
}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Import / Export Data</h1>
        <p className="mt-1 text-slate-600">
          Save your current data to a file or load data from a file to continue your work.
        </p>
      </div>

      <Card>
        <CardHeader>Export Data</CardHeader>
        <p className="mb-4 text-slate-700">
          Download all current data types, datasets, and their relationships as a single JSON file. This is the recommended way to save your progress.
        </p>
        <button
          onClick={handleExport}
          className="bg-button-blue text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-sm"
        >
          Export Data to JSON
        </button>
      </Card>

      <Card>
        <CardHeader>Import Data</CardHeader>
        <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 mb-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.636-1.214 2.252-1.214 2.888 0l6.237 11.857c.636 1.214-.243 2.794-1.444 2.794H3.464c-1.2 0-2.08-1.58-1.444-2.794L8.257 3.099zM9 13a1 1 0 112 0v1a1 1 0 11-2 0v-1zm1-5a1 1 0 00-1 1v3a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-bold">Warning:</span> Importing a file will overwrite all existing data in the application. Please export your current data first if you wish to save it.
              </p>
            </div>
          </div>
        </div>

        <p className="mb-4 text-slate-700">
          Select a JSON file to load into the application. The file must match the structure of the exported data.
        </p>

        <input
          type="file"
          ref={fileInputRef}
          accept=".json,application/json"
          onChange={handleImport}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-button-blue
            hover:file:bg-blue-100"
        />

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-slate-800">Required JSON Format</h3>
          <p className="text-sm text-slate-600 mb-2">Your file must contain three main keys: `dataTypes`, `datasets`, and `dataTypeDatasets`.</p>
          <pre className="bg-slate-800 text-slate-100 p-4 rounded-md text-xs overflow-x-auto">
            <code>
              {jsonFormatExample}
            </code>
          </pre>
        </div>
      </Card>
    </div>
  );
};

export default ImportExport;