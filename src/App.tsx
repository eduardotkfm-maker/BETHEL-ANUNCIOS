import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import ScriptGenerator from './pages/ScriptGenerator';
import ConversionModels from './pages/ConversionModels';
import AdLibrary from './pages/AdLibrary';
import AdAnalyzer from './pages/AdAnalyzer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="roteiros" element={<ScriptGenerator />} />
          <Route path="modelos" element={<ConversionModels />} />
          <Route path="biblioteca" element={<AdLibrary />} />
          <Route path="analisador" element={<AdAnalyzer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
