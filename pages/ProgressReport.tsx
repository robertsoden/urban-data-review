import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Page } from '../types';
import { Card } from '../components/Card';
import { CheckIcon, XIcon } from '../components/Icons';

interface ProgressReportProps {
  navigate: (page: Page) => void;
}

const ProgressReport: React.FC<ProgressReportProps> = ({ navigate }) => {
  const { dataTypes, getDatasetsForDataType } = useData();

  const sortedDataTypes = useMemo(() => {
    // Sort by INSPIRE theme then by name
    return [...dataTypes].sort((a, b) => {
      const themeCompare = a.inspire_theme.localeCompare(b.inspire_theme);
      if (themeCompare !== 0) return themeCompare;
      return a.name.localeCompare(b.name);
    });
  }, [dataTypes]);

  const Checkmark: React.FC<{ condition: boolean }> = ({ condition }) => (
    <div className="flex justify-center">{condition ? <CheckIcon /> : <XIcon />}</div>
  );

  return (
    <Card>
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-neutral-800">Progress Report</h1>
        <p className="text-neutral-600 mt-1">
          A summary of missing information for each data type, sorted by INSPIRE theme.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-100 text-xs text-neutral-500 uppercase tracking-wider">
            <tr>
              <th className="p-3">Data Type</th>
              <th className="p-3">Theme</th>
              <th className="p-3 text-center">Has Example Dataset?</th>
              <th className="p-3 text-center">Has Minimum Criteria?</th>
              <th className="p-3 text-center">Has Standards?</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {sortedDataTypes.map(dt => (
              <tr key={dt.id} className="hover:bg-neutral-50">
                <td
                  className="p-3 font-medium text-neutral-900 cursor-pointer hover:text-primary-600 transition-colors"
                  onClick={() => navigate({ name: 'data-type-detail', id: dt.id })}
                >
                  {dt.name}
                </td>
                <td className="p-3 text-neutral-600">{dt.inspire_theme}</td>
                <td className="p-3">
                  <Checkmark condition={getDatasetsForDataType(dt.id).length > 0} />
                </td>
                <td className="p-3">
                  <Checkmark condition={!!dt.minimum_criteria && dt.minimum_criteria.trim() !== ''} />
                </td>
                <td className="p-3">
                  <Checkmark condition={!!dt.applicable_standards && dt.applicable_standards.trim() !== ''} />
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
