import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import PatientCheckInPage from './pages/PatientCheckInPage';
import ReceptionDashboard from './pages/ReceptionDashboard';
import DentistDashboard from './pages/DentistDashboard';
import PublicWaitingScreen from './pages/PublicWaitingScreen';
import PatientQueueStatus from './pages/PatientQueueStatus';
import Layout from './components/Layout';

function App() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Routes>
        {/* Staff Routes - Full navigation for clinic staff */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/reception" replace />} />
          <Route path="check-in" element={<PatientCheckInPage />} />
          <Route path="patient/:patientId" element={<PatientQueueStatus />} />
          <Route path="reception" element={<ReceptionDashboard />} />
          <Route path="dentist" element={<DentistDashboard />} />
          <Route path="display" element={<PublicWaitingScreen />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;

