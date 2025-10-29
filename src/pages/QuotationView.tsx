import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, FileDown, Trash2 } from 'lucide-react';
import { Header } from '../components/Header';
import { useQuotation, deleteQuotation } from '../hooks/useQuotations';
import { formatCurrency, formatDate } from '../utils/calculations';
import { generatePDF } from '../utils/pdfGenerator';

export function QuotationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quotation, loading } = useQuotation(id || '');

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        await deleteQuotation(id || '');
        navigate('/quotations');
      } catch (error) {
        alert('Failed to delete quotation');
      }
    }
  };

  const handleGeneratePDF = () => {
    if (quotation) {
      generatePDF(quotation);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="p-8">
        <p className="text-center text-gray-600">Quotation not found</p>
      </div>
    );
  }

  return (
    <div>
      <Header title="View Quotation" />

      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            to="/quotations"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Quotations</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{quotation.quote_number}</h2>
              <p className="text-sm text-gray-500 mt-2">
                Status:{' '}
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    quotation.status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : quotation.status === 'sent'
                      ? 'bg-blue-100 text-blue-800'
                      : quotation.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleGeneratePDF}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <Link
                to={`/quotations/${id}/edit`}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </Link>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">From</h3>
              {quotation.company && (
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{quotation.company.name}</p>
                  {quotation.company.address && <p className="text-gray-600">{quotation.company.address}</p>}
                  {quotation.company.city && (
                    <p className="text-gray-600">
                      {quotation.company.city}
                      {quotation.company.state && `, ${quotation.company.state}`}
                      {quotation.company.postal_code && ` ${quotation.company.postal_code}`}
                    </p>
                  )}
                  {quotation.company.email && <p className="text-gray-600">{quotation.company.email}</p>}
                  {quotation.company.phone && <p className="text-gray-600">{quotation.company.phone}</p>}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">To</h3>
              {quotation.client && (
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{quotation.client.name}</p>
                  {quotation.client.contact_person && (
                    <p className="text-gray-600">{quotation.client.contact_person}</p>
                  )}
                  {quotation.client.address && <p className="text-gray-600">{quotation.client.address}</p>}
                  {quotation.client.city && (
                    <p className="text-gray-600">
                      {quotation.client.city}
                      {quotation.client.state && `, ${quotation.client.state}`}
                      {quotation.client.postal_code && ` ${quotation.client.postal_code}`}
                    </p>
                  )}
                  {quotation.client.email && <p className="text-gray-600">{quotation.client.email}</p>}
                  {quotation.client.phone && <p className="text-gray-600">{quotation.client.phone}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Issue Date</p>
              <p className="font-medium text-gray-900">{formatDate(quotation.issue_date)}</p>
            </div>
            {quotation.valid_until && (
              <div>
                <p className="text-sm text-gray-500">Valid Until</p>
                <p className="font-medium text-gray-900">{formatDate(quotation.valid_until)}</p>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h3>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quotation.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-gray-900">{item.description}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {formatCurrency(item.unit_price, quotation.currency)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {formatCurrency(item.total, quotation.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-96 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(quotation.subtotal, quotation.currency)}
                </span>
              </div>
              {quotation.tax_rate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax ({quotation.tax_rate}%):</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(quotation.tax_amount, quotation.currency)}
                  </span>
                </div>
              )}
              {quotation.discount_value > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Discount
                    {quotation.discount_type === 'percentage' && ` (${quotation.discount_value}%)`}:
                  </span>
                  <span className="font-medium text-gray-900">
                    -{formatCurrency(quotation.discount_amount, quotation.currency)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(quotation.total, quotation.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {quotation.terms && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Terms & Conditions</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{quotation.terms}</p>
            </div>
          )}

          {quotation.notes && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">Internal Notes</h3>
              <p className="text-sm text-yellow-800 whitespace-pre-wrap">{quotation.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
