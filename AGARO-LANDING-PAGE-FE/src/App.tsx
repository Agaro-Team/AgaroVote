import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NotFound from './Views/404NotFound';
import MainPage from './Views/Main';
import MainLayout from './Layouts/MainLayout';
import AboutPage from './Views/About';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
