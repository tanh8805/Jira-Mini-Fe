import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { getAccessToken } from "./api/axiosClient";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Dashboard from "./features/projects/Dashboard";
import AuthLayout from "./layouts/AuthLayout";
import PrivateLayout from "./layouts/PrivateLayout";
import PublicLayout from "./layouts/PublicLayout";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import IntroPage from "./pages/IntroPage";
import ProjectBoard from "./pages/ProjectBoard";
import ProjectMembers from "./pages/ProjectMembers";
import TermsPage from "./pages/TermsPage";

function App() {
  const isAuthenticated = Boolean(getAccessToken());

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<IntroPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/aboute" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/projects" replace /> : <Login />
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/projects" replace />
              ) : (
                <Register />
              )
            }
          />
        </Route>

        <Route element={<PrivateLayout />}>
          <Route path="/projects" element={<Dashboard />} />
          <Route path="/projects/:projectId/tasks" element={<ProjectBoard />} />
          <Route
            path="/projects/:projectId/members"
            element={<ProjectMembers />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
