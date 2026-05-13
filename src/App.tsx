import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './components/Landing';
import { StudentForm } from './components/StudentForm';
import { ExamConfirmation } from './components/ExamConfirmation';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';
import { BanqueoLanding } from './components/BanqueoLanding';
import { BanqueoAccess } from './components/BanqueoAccess';
import { BanqueoCourseSelection } from './components/BanqueoCourseSelection';
import { BanqueoPractice } from './components/BanqueoPractice';
import { EstructuraENCAPS } from './components/EstructuraENCAPS';
import { Flashcards, ReviewIncorrect, ProgressDashboard } from './components/learning';

function App() {
  return (
    <BrowserRouter basename="/simulaencaps">
      <Routes>
        {/* Simulacro */}
        <Route path="/" element={<Landing />} />
        <Route path="/registro" element={<StudentForm />} />
        <Route path="/confirmar" element={<ExamConfirmation />} />
        <Route path="/examen" element={<Quiz />} />
        <Route path="/resultados" element={<Results />} />

        {/* Estructura ENCAPS (Agente 4) */}
        <Route path="/estructura" element={<EstructuraENCAPS />} />

        {/* Banqueo */}
        <Route path="/banqueo" element={<BanqueoLanding />} />
        <Route path="/banqueo/acceso" element={<BanqueoAccess />} />
        <Route path="/banqueo/seleccion" element={<BanqueoCourseSelection />} />
        {/* Compatibilidad ruta vieja */}
        <Route path="/banqueo/cursos" element={<Navigate to="/banqueo/seleccion" replace />} />
        <Route path="/banqueo/practica/:block" element={<BanqueoPractice />} />

        {/* Modos de estudio */}
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/repaso" element={<ReviewIncorrect />} />
        <Route path="/progreso" element={<ProgressDashboard />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
