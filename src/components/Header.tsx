import { Search, Filter, FileDown, FileText } from 'lucide-react';

interface HeaderProps {
  title: string;
  onSearch?: (value: string) => void;
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  showExport?: boolean;
}

export function Header({
  title,
  onSearch,
  onExportPDF,
  onExportCSV,
  showExport = false,
}: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {showExport && (
          <div className="flex items-center space-x-3">
            {onExportPDF && (
              <button
                onClick={onExportPDF}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="font-medium">PDF</span>
              </button>
            )}
            {onExportCSV && (
              <button
                onClick={onExportCSV}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span className="font-medium">CSV</span>
              </button>
            )}
          </div>
        )}
      </div>
      {onSearch && (
        <div className="mt-6 flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for quotations..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
