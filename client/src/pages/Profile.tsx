import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";


const Profile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const tdt_id = user.tdt_id;
  const token = localStorage.getItem("token");
  const role = Array.isArray(user.role) ? user.role[0] : user.role;

  const [userDetail, setUserDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:4003/api/users/tdt/${tdt_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserDetail(res.data);
      } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
        navigate("/unauthorized");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [tdt_id, token, navigate]);

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (!userDetail) return <div>Không tìm thấy thông tin người dùng</div>;

  // --- Sinh viên ---
  if (role === "student") {
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
              <p className="font-medium">{userDetail.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">TDTU ID</p>
              <p className="font-medium">{userDetail.tdt_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày sinh</p>
              <p className="font-medium">
                {new Date(userDetail.date_of_birth).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{userDetail.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">SĐT cá nhân</p>
              <p className="font-medium">{userDetail.phone_number?.startsWith("0")
                ? userDetail.phone_number
                : "0" + userDetail.phone_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">SĐT phụ huynh</p>
              <p className="font-medium">{userDetail.parent_number ? userDetail.parent_number : 'Chưa có số điện thoại phụ huynh'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Địa chỉ</p>
              <p className="font-medium">{userDetail.address}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Cố vấn ---
  if (role === "advisor") {
    return (
      <div className="w-full h-full p-8 bg-gray-100 flex justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-2/3">
          <h2 className="text-2xl font-semibold mb-6">Thông tin cố vấn</h2>
          <div className="space-y-4">
            <div>
              <strong>Vai trò:</strong> Cố vấn học tập
            </div>
            <div>
              <strong>Họ và tên:</strong> {userDetail.name}
            </div>
            <div>
              <strong>Email:</strong> {userDetail.email}
            </div>
            <div>
              <strong>SĐT:</strong> {userDetail.phone_number}
            </div>

            <div>
              <strong>Bộ môn:</strong> {userDetail.department}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Quản trị viên ---
  if (role === "admin") {
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
              <strong>Họ và tên:</strong> {userDetail.name}
            </div>
            <div>
              <strong>Email:</strong> {userDetail.email}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div>Role không hợp lệ</div>;
};

export default Profile;
