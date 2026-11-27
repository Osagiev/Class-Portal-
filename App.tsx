import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import NavShell from "./components/NavShell";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import FeedPage from "./pages/FeedPage";
import MaterialsPage from "./pages/MaterialsPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <NavShell />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <FeedPage category="announcements" emptyMessage="No announcements yet." />
              }
            />
            <Route path="materials" element={<MaterialsPage />} />
            <Route
              path="updates"
              element={<FeedPage category="updates" emptyMessage="No updates yet." />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
