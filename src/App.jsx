import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WellsListPage from './pages/WellsListPage';
import WellDetailPage from './pages/WellDetailPage';
import SupervisionDetailPage from './pages/SupervisionDetailPage';
import AlertsListPage from './pages/AlertsListPage';
import UsersPage from './pages/UsersPage';
import MaintenancesPage from './pages/MaintenancesPage';
import StatisticsPage from './pages/StatisticsPage';
import TechnicianStatsPage from './pages/TechnicianStatsPage';
import SupervisorStatsPage from './pages/SupervisorStatsPage';
import KpiSupervisorsPage from './pages/KpiSupervisorsPage';
export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/wells" element={<PrivateRoute><WellsListPage /></PrivateRoute>} />
            <Route path="/wells/:id" element={<PrivateRoute><WellDetailPage /></PrivateRoute>} />
            <Route path="/wells/:wellId/supervisions/:supId" element={<PrivateRoute><SupervisionDetailPage /></PrivateRoute>} />
            <Route path="/alerts" element={<PrivateRoute><AlertsListPage /></PrivateRoute>} />
            <Route path="/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
            <Route path="/technicians" element={<PrivateRoute><TechnicianStatsPage /></PrivateRoute>} />
            <Route path="/maintenances" element={<PrivateRoute><MaintenancesPage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/statistics" element={<PrivateRoute><StatisticsPage /></PrivateRoute>} />
            <Route path="/supervisors" element={<PrivateRoute><SupervisorStatsPage /></PrivateRoute>} />
            <Route path="/kpi" element={<PrivateRoute><KpiSupervisorsPage /></PrivateRoute>} />

        </Routes>
    );
}