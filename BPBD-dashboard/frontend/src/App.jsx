import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ReportsManagement from './pages/admin/ReportsManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import VehicleManagement from './pages/admin/VehicleManagement';
import ReportForm from './pages/public/ReportForm';
import PoskoManagement from './pages/admin/PoskoManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/lapor" />} />
        <Route path="/lapor" element={<ReportForm />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/reports" element={<ReportsManagement />} />
        <Route path="/admin/inventory" element={<InventoryManagement />} />
        <Route path="/admin/vehicles" element={<VehicleManagement />} />
        <Route path="/admin/posko" element={<PoskoManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;