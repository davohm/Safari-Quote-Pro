import { Link } from 'react-router-dom';
import { FileText, Users, TrendingUp, DollarSign } from 'lucide-react';
import { Header } from '../components/Header';
import { useQuotations } from '../hooks/useQuotations';
import { useClients } from '../hooks/useClients';

export function Home() {
  const { quotations } = useQuotations();
  const { clients } = useClients();

  const totalAmount = quotations.reduce((sum, quote) => sum + quote.total, 0);
  const acceptedQuotes = quotations.filter((q) => q.status === 'accepted').length;
  const acceptanceRate =
    quotations.length > 0 ? ((acceptedQuotes / quotations.length) * 100).toFixed(1) : 0;

  const stats = [
    {
      label: 'Total Quotations',
      value: quotations.length,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Clients',
      value: clients.length,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      label: 'Total Value',
      value: `$${totalAmount.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      label: 'Acceptance Rate',
      value: `${acceptanceRate}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      <Header title="Welcome to QuoteGen" />

      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600">
            Manage your quotations and track your business performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/quotations/new"
                className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
              >
                Create New Quotation
              </Link>
              <Link
                to="/customers"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
              >
                Manage Customers
              </Link>
              <Link
                to="/company"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
              >
                Company Settings
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Quotations</h3>
            <div className="space-y-3">
              {quotations.slice(0, 5).map((quote) => (
                <Link
                  key={quote.id}
                  to={`/quotations/${quote.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{quote.quote_number}</p>
                      <p className="text-sm text-gray-600">{quote.client?.name || 'No client'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${quote.total.toFixed(2)}</p>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          quote.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : quote.status === 'sent'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {quote.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              {quotations.length === 0 && (
                <p className="text-center text-gray-500 py-4">No quotations yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
