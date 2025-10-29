import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { QuotationForm } from './pages/QuotationForm';
import { QuotationView } from './pages/QuotationView';
import { Customers } from './pages/Customers';
import { Company } from './pages/Company';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/quotations" element={<Dashboard />} />
          <Route path="/quotations/new" element={<QuotationForm />} />
          <Route path="/quotations/:id" element={<QuotationView />} />
          <Route path="/quotations/:id/edit" element={<QuotationForm />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/company" element={<Company />} />
          <Route path="/reporting" element={<div className="p-8"><h1 className="text-2xl font-bold">Reporting - Coming Soon</h1></div>} />
          <Route path="/settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings - Coming Soon</h1></div>} />
          <Route path="/notifications" element={<div className="p-8"><h1 className="text-2xl font-bold">Notifications - Coming Soon</h1></div>} />
          <Route path="/support" element={<div className="p-8"><h1 className="text-2xl font-bold">Support - Coming Soon</h1></div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
