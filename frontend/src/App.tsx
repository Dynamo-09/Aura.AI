import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AnalysisCandles from './pages/AnalysisCandles';
import AiScanner from './pages/AiScanner';
import Portfolio from './pages/Portfolio';
import NeuralIntelligence from './pages/NeuralIntelligence';
import AuraAssistant from './pages/AuraAssistant';
import Settings from './pages/Settings';
import Layout from './components/Layout';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-background text-on-surface selection:bg-secondary/30">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analysis" element={<AnalysisCandles />} />
            <Route path="/ai-scanner" element={<AiScanner />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/neural-intelligence" element={<NeuralIntelligence />} />
            <Route path="/aura-assistant" element={<AuraAssistant />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
