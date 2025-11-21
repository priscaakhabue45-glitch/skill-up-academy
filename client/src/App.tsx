import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student';
import InstructorDashboard from './pages/instructor';
import AdminDashboard from './pages/admin';
import SuperAdminDashboard from './pages/superadmin';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/student/*" element={<StudentDashboard />} />
            <Route path="/instructor/*" element={<InstructorDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/superadmin/*" element={<SuperAdminDashboard />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
