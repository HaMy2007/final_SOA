import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Layout from "./pages/Layout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Forum from "./pages/Forum";
import Profile from "./pages/Profile";
import NoPage from "./pages/NoPage";
import PrivateRoute from "./components/PrivateRoute";
import PersonalScore from "./pages/student/PersonalScore";
import UserManagement from "./pages/admin/UserManagement";
import StudentInfor from "./pages/advisor/StudentInfor";
import Unauthorized from "./pages/Unauthorized";
import ChangePassword from "./pages/ChangePassword";
import ResetPassword from "./pages/ResetPassword";
import NewPassword from "./components/NewPassword";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/changePassword" element={<ChangePassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

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
          <Route path="users" element={<UserManagement />} />
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
          <Route path="students" element={<StudentInfor />} />
          <Route path="*" element={<NoPage />} />
        </Route>

        <Route path="/new-password/:userId" element={<NewPassword />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
