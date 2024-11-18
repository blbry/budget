import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { CurrencyProvider } from '@/renderer/components/CurrencyProvider';
import { DateProvider } from '@/renderer/components/DateProvider';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Income from './pages/Income';
import Accounts from './pages/assets/Accounts';
import Vehicles from './pages/assets/Vehicles';
import Properties from './pages/assets/Properties';
import Investments from './pages/assets/Investments';
import Transactions from './pages/spending/Transactions';
import Categories from './pages/spending/Categories';
import PaymentMethods from './pages/spending/PaymentMethods';
import NetWorthAnalytics from './pages/insights/NetWorthAnalytics';
import SpendingAnalytics from './pages/insights/SpendingAnalytics';
import { ThemeProvider } from './components/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider>
      <DateProvider>
        <CurrencyProvider>
          <Router>
            <div className="flex h-screen bg-muted p-4 overflow-hidden">
              <Sidebar />
              <main className="flex-1 bg-background ml-4 rounded-2xl flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/assets/accounts" element={<Accounts />} />
                    <Route path="/assets/vehicles" element={<Vehicles />} />
                    <Route path="/assets/properties" element={<Properties />} />
                    <Route path="/assets/investments" element={<Investments />} />
                    <Route path="/income" element={<Income />} />
                    <Route path="/spending/transactions" element={<Transactions />} />
                    <Route path="/spending/categories" element={<Categories />} />
                    <Route path="/spending/payment-methods" element={<PaymentMethods />} />
                    <Route path="/insights/net-worth" element={<NetWorthAnalytics />} />
                    <Route path="/insights/spending" element={<SpendingAnalytics />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </div>
              </main>
            </div>
          </Router>
        </CurrencyProvider>
      </DateProvider>
    </ThemeProvider>
  );
}
