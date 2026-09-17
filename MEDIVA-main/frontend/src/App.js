import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { RequireRole } from "@/components/RequireRole";
import Login from "@/pages/Login";
import Book from "@/pages/Book";
import PatientDashboard from "@/pages/patient/PatientDashboard";
import DoctorDashboard from "@/pages/doctor/DoctorDashboard";
import Landing from "@/pages/Landing";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}
export default App;
