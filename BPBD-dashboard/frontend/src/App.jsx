import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ReportsManagement from './pages/admin/ReportsManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import VehicleManagement from './pages/admin/VehicleManagement';
import PoskoManagement from './pages/admin/PoskoManagement';
import ActivityManagement from './pages/admin/ActivityManagement';
import DisasterRecordsManagement from './pages/admin/DisasterRecordsManagement';
import ReportForm from './pages/public/ReportForm';
import TrackStatus from './pages/public/TrackStatus';
import PublicDashboard from './pages/public/PublicDashboard';
import LandingPage from './pages/public/LandingPage';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<PublicDashboard />} />
        <Route path="/lapor" element={<ReportForm />} />
        <Route path="/lacak" element={<TrackStatus />} />
        <Route path="/admin/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/reports" element={<ReportsManagement />} />
          <Route path="/admin/inventory" element={<InventoryManagement />} />
          <Route path="/admin/vehicles" element={<VehicleManagement />} />
          <Route path="/admin/posko" element={<PoskoManagement />} />
          <Route path="/admin/activities" element={<ActivityManagement />} />
          <Route path="/admin/disaster-records" element={<DisasterRecordsManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;