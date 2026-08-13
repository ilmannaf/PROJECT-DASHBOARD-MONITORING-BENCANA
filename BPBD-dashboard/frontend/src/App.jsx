import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ReportsManagement from './pages/admin/ReportsManagement';
import ReportForm from './pages/public/ReportForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/lapor" />} />
        <Route path="/lapor" element={<ReportForm />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/reports" element={<ReportsManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;