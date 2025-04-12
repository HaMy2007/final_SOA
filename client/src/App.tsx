import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Layout from "./pages/Layout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Forum from "./pages/Forum";
import Profile from "./pages/Profile";
import NoPage from "./pages/NoPage";
import PrivateRoute from "./components/PrivateRoute";
import PersonalScore from "./pages/student/PersonalScore";
import StudentInfor from "./pages/StudentInfor";
import Unauthorized from "./pages/Unauthorized";
import ChangePassword from "./pages/ChangePassword";
import ResetPassword from "./pages/ResetPassword";
import NewPassword from "./components/NewPassword";
import DatabaseManagement from "./pages/DatabaseManagement";
import { StudentInfoProvider } from "./context/StudentInfoContext";
import StudentScoresList from "./pages/StudentScoresList";
import StudentScoreDetail from "./pages/StudentScoreDetail";
import Dashboard from "./pages/Dashboard";
import AdvisorInfor from "./pages/admin/AdvisorInfo";
import { AdvisorInfoProvider } from "./context/AdvisorInfoContext";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/changePassword" element={<ChangePassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/new-password/:userId" element={<NewPassword />} />
        <Route path="*" element={<NoPage />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="forum" element={<Forum />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NoPage />} />
          <Route path="studentScore" element={<StudentScoresList />} />
          <Route
            path="studentDetail/:studentId"
            element={<StudentScoreDetail />}
          />
          <Route path="dashboard" element={<Dashboard />} />
          <Route
            path="students"
            element={
              <StudentInfoProvider>
                <StudentInfor />
              </StudentInfoProvider>
            }
          />
          <Route path="databaseManagement" element={<DatabaseManagement />} />
          <Route
            path="advisorInfo"
            element={
              <AdvisorInfoProvider>
                <AdvisorInfor />
              </AdvisorInfoProvider>
            }
          />
        </Route>

        {/* ADVISOR ROUTES */}
        <Route
          path="/advisor"
          element={
            <PrivateRoute allowedRoles={["advisor"]}>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="forum" element={<Forum />} />
          <Route path="profile" element={<Profile />} />
          <Route
            path="students"
            element={
              <StudentInfoProvider>
                <StudentInfor />
              </StudentInfoProvider>
            }
          />
          <Route path="databaseManagement" element={<DatabaseManagement />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="studentScore" element={<StudentScoresList />} />
          <Route
            path="studentDetail/:studentId"
            element={<StudentScoreDetail />}
          />
          <Route path="*" element={<NoPage />} />
        </Route>

        {/* STUDENT ROUTES */}
        <Route
          path="/student"
          element={
            <PrivateRoute allowedRoles={["student"]}>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="forum" element={<Forum />} />
          <Route path="profile" element={<Profile />} />
          <Route path="personalScore" element={<PersonalScore />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
