import React from "react";
import { useNavigate } from "react-router-dom";
import { StudentType } from "../types/student";
import { AdvisorType } from "../types/advisor";
import { AdminType } from "../types/admin";
import { MockStudents, MockAdvisors, MockAdmins } from "../data/MockUsers";

type Props = {};

const Profile = (props: Props) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { id, role } = user;
  const navigate = useNavigate();

  let userDetail: StudentType | AdvisorType | AdminType | null = null;

  if (role === "student") {
    userDetail = MockStudents[id];
  } else if (role === "advisor") {
    userDetail = MockAdvisors[id];
  } else if (role === "admin") {
    userDetail = MockAdmins[id];
  }

  if (!userDetail) return <div>Không tìm thấy thông tin người dùng</div>;

  // --- Sinh viên ---
  if (role === "student") {
    const student = userDetail as StudentType;
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center items-start">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-blue-950 mb-8">
            Thông tin cá nhân
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <p className="text-sm text-gray-500">Vai trò</p>
              <p className="font-medium">Sinh viên</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Họ và tên</p>
              <p className="font-medium">{student.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">TDTU ID</p>
              <p className="font-medium">{student.tdt_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày sinh</p>
              <p className="font-medium">
                {new Date(student.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{student.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">SĐT cá nhân</p>
              <p className="font-medium">{student.phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">SĐT phụ huynh</p>
              <p className="font-medium">{student.parentPhoneNumber}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Địa chỉ</p>
              <p className="font-medium">{student.address}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Cố vấn ---
  if (role === "advisor") {
    const advisor = userDetail as AdvisorType;
    return (
      <div className="w-full h-full p-8 bg-gray-100 flex justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-2/3">
          <h2 className="text-2xl font-semibold mb-6">Thông tin cố vấn</h2>
          <div className="space-y-4">
            <div>
              <strong>Vai trò:</strong> Cố vấn học tập
            </div>
            <div>
              <strong>Họ và tên:</strong> {advisor.name}
            </div>
            <div>
              <strong>Email:</strong> {advisor.email}
            </div>
            <div>
              <strong>SĐT:</strong> {advisor.phoneNumber}
            </div>

            <div>
              <strong>Bộ môn:</strong> {advisor.department}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Quản trị viên ---
  if (role === "admin") {
    const admin = userDetail as AdminType;
    return (
      <div className="w-full h-full p-8 bg-gray-100 flex justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-2/3">
          <h2 className="text-2xl font-semibold mb-6">
            Thông tin quản trị viên
          </h2>
          <div className="space-y-4">
            <div>
              <strong>Vai trò:</strong> Quản trị viên
            </div>
            <div>
              <strong>Họ và tên:</strong> {admin.name}
            </div>
            <div>
              <strong>Email:</strong> {admin.email}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div>Role không hợp lệ</div>;
};

export default Profile;
