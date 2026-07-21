import Dashboard from "./Pages/Dashboard";
import LoginPage from "./Pages/LoginPage";
import RoomDetail from "./Pages/RoomDetail";
import SignupPage from "./Pages/SignupPage";
import Loading from "./Components/Loading";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./Components/ProtectedRoute";
import ErrorModal from "./Components/ErrorModal";
import Toast from "./Components/Toast";
import ProfilePage from "./Components/ProfilePage";
import { AppProvider, useApp } from "./context/AppContext";
import ForgotPassword from "./Pages/ForgotPassword";

function AppContent() {
  const { user, loading, globalError, setGlobalError, toast, showToast } =
    useApp();

  if (loading) return <Loading />;

  return (
    <BrowserRouter>
      {/* Centralized UI Components */}
      <ErrorModal error={globalError} onClose={() => setGlobalError(null)} />
      {toast.message && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => showToast(null)}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/rooms" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/rooms" element={<Dashboard />} />
          <Route path="/rooms/:roomId" element={<RoomDetail />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
