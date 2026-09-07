import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import ToastContainer from './components/Toast';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ReportsManagement from './pages/admin/ReportsManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import VehicleManagement from './pages/admin/VehicleManagement';
import PoskoManagement from './pages/admin/PoskoManagement';
import ActivityManagement from './pages/admin/ActivityManagement';
import InfoBoardManagement from './pages/admin/InfoBoardManagement';
import DisasterRecordsManagement from './pages/admin/DisasterRecordsManagement';
import UsersManagement from './pages/admin/UsersManagement';
import LoginHistory from './pages/admin/LoginHistory';
import ReportForm from './pages/public/ReportForm';
import TrackStatus from './pages/public/TrackStatus';
import LandingPage from './pages/public/LandingPage';
import DisasterMap from './pages/public/DisasterMap';
import TentangKami from './pages/public/TentangKami';
import StatisticPage from './pages/public/StatisticPage';
import PapanInformasi from './pages/admin/PapanInformasi';
import ProfilePage from './pages/admin/ProfilePage';
import PetugasProfiles from './pages/admin/PetugasProfiles';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import WhatsAppFloat from './components/WhatsAppFloat';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  type: 'tween',
  ease: [0.22, 1, 0.36, 1],
  duration: 0.25,
};

function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/lapor" element={<PageWrapper><ReportForm /></PageWrapper>} />
        <Route path="/lacak" element={<PageWrapper><TrackStatus /></PageWrapper>} />
        <Route path="/peta" element={<PageWrapper><DisasterMap /></PageWrapper>} />
        <Route path="/tentang" element={<PageWrapper><TentangKami /></PageWrapper>} />
        <Route path="/statistik" element={<PageWrapper><StatisticPage /></PageWrapper>} />
        {/* Papan Informasi sudah dipindah ke admin (protected route) */}
        <Route path="/admin/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/admin/papan-informasi" element={
          <ProtectedRoute>
            <PageWrapper><PapanInformasi /></PageWrapper>
          </ProtectedRoute>
        } />

        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/admin/reports" element={<PageWrapper><ReportsManagement /></PageWrapper>} />
          <Route path="/admin/inventory" element={<PageWrapper><InventoryManagement /></PageWrapper>} />
          <Route path="/admin/vehicles" element={<PageWrapper><VehicleManagement /></PageWrapper>} />
          <Route path="/admin/posko" element={<PageWrapper><PoskoManagement /></PageWrapper>} />
          <Route path="/admin/activities" element={<PageWrapper><ActivityManagement /></PageWrapper>} />
          <Route path="/admin/info-board" element={<PageWrapper><InfoBoardManagement /></PageWrapper>} />
          <Route path="/admin/disaster-records" element={<PageWrapper><DisasterRecordsManagement /></PageWrapper>} />
          <Route path="/admin/users" element={<PageWrapper><UsersManagement /></PageWrapper>} />
          <Route path="/admin/login-history" element={<PageWrapper><LoginHistory /></PageWrapper>} />
          <Route path="/admin/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
          <Route path="/admin/petugas-profiles" element={<PageWrapper><PetugasProfiles /></PageWrapper>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ToastContainer />
        <WhatsAppFloat />
        <AnimatedRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
