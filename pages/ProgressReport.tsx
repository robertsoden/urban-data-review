import React from 'react';
import { useData } from '../context/DataContext';
import Card, { CardHeader } from '../components/Card';

const ProgressReport: React.FC = () => {
  const { state, getters } = useData();
  const { dataTypes } = state;
  const { getDatasetsForDataType } = getters;

  const totalDataTypes = dataTypes.length;
  const linkedDataTypes = dataTypes.filter(dt => getDatasetsForDataType(dt.id).length > 0).length;
  const progress = totalDataTypes > 0 ? Math.round((linkedDataTypes / totalDataTypes) * 100) : 0;

  return (
    <Card>
      <CardHeader>Progress Report</CardHeader>
      <p>You have linked <strong>{linkedDataTypes}</strong> out of <strong>{totalDataTypes}</strong> data types.</p>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="text-right mt-1">{progress}% Complete</p>
    </Card>
  );
};

export default ProgressReport;
