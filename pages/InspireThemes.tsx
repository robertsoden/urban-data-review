import React from 'react';
import { useData } from '../context/DataContext';
import { Page } from '../types';
import { Card, CardContent } from '../components/Card';
import { AnnexBadge } from '../components/Badge';

interface InspireThemesProps {
  navigate: (page: Page) => void;
}

const InspireThemes: React.FC<InspireThemesProps> = ({ navigate }) => {
  const { inspireThemes, dataTypes } = useData();

  // Group data types by theme and get unique annexes per theme
  const themeStats = inspireThemes.map(theme => {
    const themeDataTypes = dataTypes.filter(dt => dt.inspire_theme === theme.name);
    const annexes = [...new Set(themeDataTypes.map(dt => dt.inspire_annex))].sort();
    return {
      ...theme,
      dataTypeCount: themeDataTypes.length,
      annexes
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">INSPIRE Themes</h1>
        <p className="mt-1 text-neutral-600">
          Browse data types organized by INSPIRE Directive themes
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Theme</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Annex(es)</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider text-right">Data Types</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {themeStats.map(theme => (
                <tr
                  key={theme.id}
                  className="hover:bg-neutral-50 cursor-pointer transition-colors"
                  onClick={() => navigate({ name: 'data-types', initialTheme: theme.name })}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-neutral-900 hover:text-primary-600 transition-colors">
                      {theme.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {theme.annexes.map(annex => (
                        <AnnexBadge key={annex} annex={annex} />
                      ))}
                      {theme.annexes.length === 0 && (
                        <span className="text-neutral-400 italic text-sm">No data types</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {theme.dataTypeCount}
                    </span>
                  </td>
                </tr>
              ))}
              {themeStats.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-neutral-500">
                    No INSPIRE themes found. Import data to see themes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default InspireThemes;
