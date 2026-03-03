import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminServices from "./pages/AdminServices";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import ProtectedRoute from "./routes/ProtectedRoute";
import AllCustomers from "./pages/AllCustomers";
import AdminSettings from "./pages/AdminSettings";
import AdminQualityRecordForm from "./pages/AdminQualityRecordForm";
import QualityRecordView from "./pages/QualityRecordView";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* PUBLIC ROUTES */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />

      {/* PROTECTED ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="customers" element={<AllCustomers />} />
        <Route path="quality-records" element={<AdminQualityRecordForm />} />
        <Route path="quality-view" element={<QualityRecordView />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}

export default App;
