import { Routes, Route } from 'react-router-dom';
import AppointmentBookingPage from './pages/AppointmentBookingPage';
import Layout from './components/Layout';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<AppointmentBookingPage />} />
          <Route path="book" element={<AppointmentBookingPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;


