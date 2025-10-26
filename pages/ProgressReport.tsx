import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Page, DataType, Priority } from '../types';
import { Card } from '../components/Card';
import { CheckIcon, XIcon } from '../components/Icons';

interface ProgressReportProps {
  navigate: (page: Page) => void;
}

const ProgressReport: React.FC<ProgressReportProps> = ({ navigate }) => {
  const { dataTypes, getDatasetsForDataType } = useData();

  const sortedDataTypes = useMemo(() => {
    const priorityOrder = {
      [Priority.Essential]: 1,
      [Priority.Beneficial]: 2,
      [Priority.Low]: 3,
    };
    return [...dataTypes].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [dataTypes]);

  const Checkmark: React.FC<{ condition: boolean }> = ({ condition }) => (
    <div className="flex justify-center">{condition ? <CheckIcon /> : <XIcon />}</div>
  );

  return (
    <Card>
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-slate-800">Progress Report</h1>
        <p className="text-slate-600 mt-1">
          A summary of missing information for each data type, sorted by priority.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-xs text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="p-3">Data Type (Priority)</th>
              <th className="p-3 text-center">Has Example Dataset?</th>
              <th className="p-3 text-center">Has Key Attributes?</th>
              <th className="p-3 text-center">Has Standards?</th>
              <th className="p-3 text-center">Has ISO Indicators?</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sortedDataTypes.map(dt => (
              <tr key={dt.id} className="hover:bg-slate-50">
                <td 
                  className="p-3 font-medium text-slate-900 cursor-pointer hover:text-button-blue transition-colors"
                  onClick={() => navigate({ name: 'data-type-detail', id: dt.id })}
                >
                  {dt.name} <span className="font-normal text-slate-500">({dt.priority})</span>
                </td>
                <td className="p-3">
                  <Checkmark condition={getDatasetsForDataType(dt.id).length > 0} />
                </td>
                <td className="p-3">
                  <Checkmark condition={!!dt.key_attributes && dt.key_attributes.trim() !== '' && dt.key_attributes.trim() !== '[]'} />
                </td>
                <td className="p-3">
                  <Checkmark condition={!!dt.applicable_standards && dt.applicable_standards.trim() !== ''} />
                </td>
                <td className="p-3">
                  <Checkmark condition={!!dt.iso_indicators && dt.iso_indicators.trim() !== ''} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ProgressReport;