import { CiLogout } from "react-icons/ci";
import { FaUser } from "react-icons/fa";
import { GrScorecard } from "react-icons/gr";
import { MdForum } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";

import { StudentType } from "../types/student";
import { AdvisorType } from "../types/advisor";
import { AdminType } from "../types/admin";
import { MockAdmins, MockAdvisors, MockStudents } from "../data/MockUsers";

type Props = {};

const Home = (props: Props) => {
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // --------------------------------------
  // STUDENT VIEW
  // --------------------------------------
  if (role === "student") {
    const student = userDetail as StudentType;
    const advisor = MockAdvisors[student.advisorId];

    return (
      <div className="w-full h-full flex flex-col gap-20 p-4 overflow-y-auto">
        <div className="flex flex-col w-9/12 mx-auto">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl text-blue-950 font-semibold">
              Chào mừng đến với ứng dụng quản lý sinh viên - cố vấn học tập!
            </h1>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-9 p-4 bg-white rounded-lg shadow-xl flex flex-col gap-3">
                <div className="flex flex-col gap-8">
                  <h2 className="text-xl font-bold">Thông tin cá nhân</h2>
                  <div className="flex flex-col">
                    <p className="font-bold text-xl">Họ và tên</p>
                    <p className="text-xl">{student.name}</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-bold text-xl">Vai trò</p>
                    <p className="text-xl">{student.role}</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-bold text-xl">Lớp học</p>
                    <p className="text-xl">{student.class}</p>
                  </div>
                </div>
              </div>
              <div className="col-span-3 grid grid-cols-1 gap-4">
                <Link
                  to={`/${role}/profile`}
                  className="bg-white p-4 rounded-lg shadow-md flex justify-center items-center flex-col gap-2"
                >
                  <FaUser className="w-12 h-12 text-purple-700" />
                  <span className="ml-2 text-xl">Thông tin cá nhân</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-white p-4 rounded-lg shadow-md flex items-center flex-col w-full"
                >
                  <CiLogout className="w-12 h-12 text-red-600" />
                  <span className="ml-2 text-xl">Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-9/12 mx-auto">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl text-blue-950 font-semibold">
              Cố vấn học tập và theo dõi điểm
            </h1>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-9 p-4 bg-white rounded-lg shadow-xl flex flex-col gap-3">
                {advisor ? (
                  <div className="flex flex-col gap-8">
                    <h2 className="text-xl font-bold">Thông tin cố vấn</h2>
                    <div className="flex flex-col">
                      <p className="font-bold text-xl">Họ và tên</p>
                      <p className="text-xl">{advisor.name}</p>
                    </div>
                    <div className="flex flex-col">
                      <p className="font-bold text-xl">Vai trò</p>
                      <p className="text-xl">{advisor.role}</p>
                    </div>
                    <div className="flex flex-col">
                      <p className="font-bold text-xl">Số điện thoại</p>
                      <p className="text-xl">{advisor.phoneNumber}</p>
                    </div>
                    <div className="flex flex-col">
                      <p className="font-bold text-xl">Email</p>
                      <p className="text-xl">{advisor.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-500">
                    Không tìm thấy thông tin cố vấn.
                  </p>
                )}
              </div>
              <div className="col-span-3 grid grid-cols-1 gap-4">
                <Link
                  to={`/${role}/forum`}
                  className="bg-white p-4 rounded-lg shadow-md flex justify-center items-center flex-col gap-2"
                >
                  <MdForum className="w-12 h-12 text-amber-400" />
                  <span className="ml-2 text-xl">Diễn đàn</span>
                </Link>
                <Link
                  to={`/${role}/personalScore`}
                  className="bg-white p-4 rounded-lg shadow-md flex justify-center items-center flex-col gap-2"
                >
                  <GrScorecard className="w-12 h-12 text-green-400" />
                  <span className="ml-2 text-xl">Bảng điểm cá nhân</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------
  // ADMIN VIEW
  // --------------------------------------
  if (role === "admin") {
    return (
      <div className="p-4 text-xl text-blue-950">
        Xin chào <strong>{user.name}</strong>! Đây là trang dành cho{" "}
        <strong>Quản trị viên</strong>.
      </div>
    );
  }

  // --------------------------------------
  // ADVISOR VIEW
  // --------------------------------------
  if (role === "advisor") {
    return (
      <div className="p-4 text-xl text-green-900">
        Xin chào <strong>{user.name}</strong>! Đây là giao diện dành cho{" "}
        <strong>Cố vấn học tập</strong>.
      </div>
    );
  }

  return <div>Role không hợp lệ</div>;
};

export default Home;
