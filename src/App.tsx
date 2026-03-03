import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import ScriptGenerator from './pages/ScriptGenerator';
import AdLibrary from './pages/AdLibrary';
import AdAnalyzer from './pages/AdAnalyzer';
import GoldLibrary from './pages/GoldLibrary';
import ProductionWorkflow from './pages/ProductionWorkflow';
import Products from './pages/Products';

import Login from './pages/Login';
import Settings from './pages/Settings';
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/AuthGuard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }>
            <Route index element={<Dashboard />} />
            <Route path="produtos" element={<Products />} />
            <Route path="roteiros" element={<ScriptGenerator />} />
            <Route path="biblioteca" element={<AdLibrary />} />
            <Route path="analisador" element={<AdAnalyzer />} />
            <Route path="biblioteca-ouro" element={<GoldLibrary />} />
            <Route path="esteira" element={<ProductionWorkflow />} />
            <Route path="config" element={<Settings />} />
          </Route>

          {/* Fallback routing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
