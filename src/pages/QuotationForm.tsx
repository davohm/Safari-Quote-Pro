import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Save, FileDown } from 'lucide-react';
import { Header } from '../components/Header';
import { useClients } from '../hooks/useClients';
import { useCompanies } from '../hooks/useCompanies';
import { useCompanyContext } from '../contexts/CompanyContext';
import {
  createQuotation,
  updateQuotation,
  generateQuoteNumber,
  useQuotation,
} from '../hooks/useQuotations';
import {
  calculateLineTotal,
  calculateSubtotal,
  calculateTaxAmount,
  calculateDiscountAmount,
  calculateTotal,
} from '../utils/calculations';
import { QuotationItem, DiscountType } from '../types';
import { generatePDF } from '../utils/pdfGenerator';

export function QuotationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { currentCompany } = useCompanyContext();
  const { quotation, loading: quotationLoading } = useQuotation(id || '');
  const { clients, loading: clientsLoading } = useClients();
  const { companies, loading: companiesLoading } = useCompanies();

  const [formData, setFormData] = useState({
    company_id: currentCompany?.id || '',
    client_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    valid_until: '',
    currency: 'USD',
    tax_rate: 0,
    discount_type: 'percentage' as DiscountType,
    discount_value: 0,
    terms: '',
    notes: '',
    template_id: 'modern',
    status: 'draft' as const,
  });

  const [items, setItems] = useState<Omit<QuotationItem, 'id' | 'quotation_id' | 'created_at'>[]>([
    { description: '', quantity: 1, unit_price: 0, total: 0, sort_order: 0 },
  ]);

  const [quoteNumber, setQuoteNumber] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditMode && currentCompany) {
      generateQuoteNumber(currentCompany.id).then(setQuoteNumber);
      // Update formData with current company when it changes
      setFormData(prev => ({ ...prev, company_id: currentCompany.id }));
    }
  }, [isEditMode, currentCompany]);

  useEffect(() => {
    if (quotation && isEditMode) {
      setFormData({
        company_id: quotation.company_id || '',
        client_id: quotation.client_id || '',
        issue_date: quotation.issue_date,
        valid_until: quotation.valid_until || '',
        currency: quotation.currency,
        tax_rate: quotation.tax_rate,
        discount_type: quotation.discount_type,
        discount_value: quotation.discount_value,
        terms: quotation.terms || '',
        notes: quotation.notes || '',
        template_id: quotation.template_id,
        status: quotation.status,
      });
      setQuoteNumber(quotation.quote_number);
      if (quotation.items) {
        setItems(quotation.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
          sort_order: item.sort_order,
        })));
      }
    }
  }, [quotation, isEditMode]);

  const subtotal = calculateSubtotal(items as QuotationItem[]);
  const taxAmount = calculateTaxAmount(subtotal, formData.tax_rate);
  const discountAmount = calculateDiscountAmount(
    subtotal,
    formData.discount_type,
    formData.discount_value
  );
  const total = calculateTotal(subtotal, taxAmount, discountAmount);

  const addItem = () => {
    setItems([
      ...items,
      { description: '', quantity: 1, unit_price: 0, total: 0, sort_order: items.length },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = calculateLineTotal(
        newItems[index].quantity,
        newItems[index].unit_price
      );
    }

    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company_id) {
      alert('Please select a company');
      return;
    }

    if (!formData.client_id) {
      alert('Please select a client');
      return;
    }

    if (items.some(item => !item.description)) {
      alert('Please fill in all item descriptions');
      return;
    }

    setSaving(true);

    try {
      const quotationData = {
        ...formData,
        quote_number: quoteNumber,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total,
      };

      if (isEditMode && id) {
        await updateQuotation(id, quotationData, items);
      } else if (currentCompany) {
        await createQuotation(quotationData, items, currentCompany.id);
      } else {
        throw new Error('No company selected');
      }

      navigate('/quotations');
    } catch (error) {
      alert('Failed to save quotation');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!formData.company_id || !formData.client_id) {
      alert('Please select both company and client before generating PDF');
      return;
    }

    const company = companies.find(c => c.id === formData.company_id);
    const client = clients.find(c => c.id === formData.client_id);

    if (!company || !client) return;

    const fullQuotation = {
      ...formData,
      id: id || 'preview',
      quote_number: quoteNumber,
      subtotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total,
      company,
      client,
      items: items as QuotationItem[],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    generatePDF(fullQuotation);
  };

  if (quotationLoading || clientsLoading || companiesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Header title={isEditMode ? 'Edit Quotation' : 'New Quotation'} />

      <form onSubmit={handleSubmit} className="p-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{quoteNumber}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {isEditMode ? 'Edit quotation details' : 'Create a new quotation'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleGeneratePDF}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span>Preview PDF</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <select
                value={formData.company_id}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date *
              </label>
              <input
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid Until
              </label>
              <input
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateItem(index, 'unit_price', parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={item.total.toFixed(2)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700"
                      readOnly
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms & Conditions
                </label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter payment terms, delivery conditions, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internal Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Private notes (not shown on PDF)"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tax:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={formData.tax_rate}
                    onChange={(e) =>
                      setFormData({ ...formData, tax_rate: parseFloat(e.target.value) })
                    }
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  <span className="text-sm text-gray-600">%</span>
                  <span className="font-medium text-gray-900 ml-2">
                    ${taxAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Discount:</span>
                <div className="flex items-center space-x-2">
                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_type: e.target.value as DiscountType })
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">$</option>
                  </select>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_value: parseFloat(e.target.value) })
                    }
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    min="0"
                    step="0.01"
                  />
                  <span className="font-medium text-gray-900 ml-2">
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-blue-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/quotations')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : isEditMode ? 'Update' : 'Save'} Quotation</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
