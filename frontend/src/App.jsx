import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import EventExplorer from './pages/EventExplorer';
import ThreatAnalytics from './pages/ThreatAnalytics';
import AttackChains from './pages/AttackChains';
import MLPerformance from './pages/MLPerformance';
import Recommendations from './pages/Recommendations';
import Compliance from './pages/Compliance';

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/events" element={<EventExplorer />} />
          <Route path="/threats" element={<ThreatAnalytics />} />
          <Route path="/attack-chains" element={<AttackChains />} />
          <Route path="/ml" element={<MLPerformance />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/compliance" element={<Compliance />} />
        </Routes>
      </main>
    </div>
  );
}
export default App;
