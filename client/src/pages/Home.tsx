import axios from "axios";
import { useEffect, useState } from "react";
import { CiLogout } from "react-icons/ci";
import { FaUser } from "react-icons/fa";
import { GrScorecard } from "react-icons/gr";
import { IoMdInformationCircle } from "react-icons/io";
import {
  MdForum,
  MdOutlineDashboardCustomize,
  MdOutlineScore,
} from "react-icons/md";
import { SiInformatica } from "react-icons/si";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const role = user.role;
  const tdt_id = user.tdt_id;

  const [userDetail, setUserDetail] = useState<any>(null);
  const [advisor, setAdvisor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [studentClass, setStudentClass] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4003/api/users/tdt/${tdt_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const studentId = res.data._id;
        console.log("Student ID:", studentId);

        const fetchedUser = res.data;
        setUserDetail(fetchedUser);
        localStorage.setItem("user", JSON.stringify(fetchedUser));

        if (res.data.role === "student") {
          const advRes = await axios.get(
            `http://localhost:4000/api/students/${studentId}/advisor`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setAdvisor(advRes.data.advisor);
          setStudentClass(advRes.data.class);
        }
        if (fetchedUser.role === "advisor") {
          const advisorId = fetchedUser._id;
          const classRes = await axios.get(
            `http://localhost:4000/api/teachers/${advisorId}/class`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setStudentClass(classRes.data.class);
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin người dùng:", err);
        navigate("/unauthorized");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [tdt_id, token, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (!userDetail) return <div>Không tìm thấy thông tin người dùng</div>;

  // --------------------------------------
  // STUDENT VIEW
  // --------------------------------------
  if (role === "student") {
    return (
      <div className="w-full h-full flex flex-col gap-20 p-4 overflow-y-auto">
        <div className="flex flex-col w-9/12 mx-auto">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl text-blue-950 font-semibold">
              Chào mừng <strong>{userDetail.name}</strong> đến với ứng dụng quản
              lý sinh viên - cố vấn học tập!
            </h1>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-9 p-4 bg-white rounded-lg shadow-xl flex flex-col gap-3">
                <div className="flex flex-col gap-8">
                  <h2 className="text-xl font-bold">Thông tin cá nhân</h2>
                  <div className="flex flex-col">
                    <p className="font-bold text-xl">Họ và tên</p>
                    <p className="text-xl">{userDetail.name}</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-bold text-xl">Vai trò</p>
                    <p className="text-xl">{userDetail.role}</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-bold text-xl">Lớp học</p>
                    <p className="text-xl">
                      {studentClass?.id} - {studentClass?.name}
                    </p>
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
                      <p className="text-xl">
                        {advisor.role === "advisor"
                          ? "Cố vấn học tập"
                          : "Không xác định"}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <p className="font-bold text-xl">Số điện thoại</p>
                      <p className="text-xl">
                        {advisor.phone_number?.startsWith("0")
                          ? advisor.phone_number
                          : "0" + advisor.phone_number}
                      </p>
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
      <div className="w-full h-full flex flex-col gap-20 p-4 overflow-y-auto">
        <div className="flex flex-col w-9/12 mx-auto">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl text-blue-950 font-semibold">
              Chào mừng {userDetail.name} đến với ứng dụng quản lý sinh viên -
              cố vấn học tập!
            </h1>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 p-4 bg-white rounded-lg shadow-xl flex flex-col gap-3">
                <div className="flex flex-col gap-8">
                  <h2 className="text-xl font-bold">Thông tin cá nhân</h2>
                  <div className="flex flex-col">
                    <p className="font-bold text-xl">Họ và tên</p>
                    <p className="text-xl">{userDetail.name}</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-bold text-xl">Vai trò</p>
                    <p className="text-xl">{userDetail.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-9/12 mx-auto">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl text-blue-950 font-semibold">Tiện ích</h1>
            <div className="grid grid-cols-12 gap-4">
              <Link
                to={`/${role}/forum`}
                className="col-span-4 bg-white p-4 rounded-lg shadow-md flex justify-center items-center flex-col gap-2"
              >
                <MdForum className="w-12 h-12 text-amber-400" />
                <span className="ml-2 text-xl">Diễn đàn</span>
              </Link>
              <Link
                to={`/${role}/advisorInfo`}
                className="col-span-4 bg-white p-4 rounded-lg shadow-md flex justify-center items-center flex-col gap-2"
              >
                <SiInformatica className="w-12 h-12 text-black-400" />
                <span className="ml-2 text-xl">Thông tin cố vấn</span>
              </Link>
              <Link
                to={`/${role}/students`}
                className="col-span-4 bg-white p-4 rounded-lg shadow-md flex justify-center items-center flex-col gap-2"
              >
                <IoMdInformationCircle className="w-12 h-12 text-purple-400" />
                <span className="ml-2 text-xl">Thông tin sinh viên</span>
              </Link>
              <Link
                to={`/${role}/studentScore`}
                className="col-span-4 bg-white p-4 rounded-lg shadow-md flex justify-center items-center flex-col gap-2"
              >
                <MdOutlineScore className="w-12 h-12 text-blue-400" />
                <span className="ml-2 text-xl">Bảng điểm</span>
              </Link>

              <Link
                to={`/${role}/databaseManagement`}
                className=" col-span-4 bg-white p-4 rounded-lg shadow-md flex justify-center items-center flex-col gap-2"
              >
                <GrScorecard className="w-12 h-12 text-green-400" />
                <span className="ml-2 text-xl">Quản lý CSDL</span>
              </Link>
              <Link
                to={`/${role}/dashboard`}
                className=" col-span-4 bg-white p-4 rounded-lg shadow-md flex justify-center items-center flex-col gap-2"
              >
                <MdOutlineDashboardCustomize className="w-12 h-12 text-pink-400" />
                <span className="ml-2 text-xl">Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="col-span-4 bg-white p-4 rounded-lg shadow-md flex items-center flex-col w-full"
              >
                <CiLogout className="w-12 h-12 text-red-600" />
                <span className="ml-2 text-xl">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------
  // ADVISOR VIEW
  // --------------------------------------
  if (role === "advisor") {
    return (
      <div className="w-full h-full flex flex-col gap-20 p-4 overflow-y-auto">
        <div className="flex flex-col w-9/12 mx-auto">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl text-blue-950 font-semibold">
              Chào mừng <strong>{userDetail.name}</strong> đến với ứng dụng quản
              lý sinh viên - cố vấn học tập!
            </h1>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 p-4 bg-white rounded-lg shadow-xl flex flex-col gap-3">
                <div className="flex flex-col gap-8">
                  <h2 className="text-xl font-bold">Thông tin cá nhân</h2>
                  <div className="flex flex-col">
                    <p className="font-bold text-xl">Họ và tên</p>
                    <p className="text-xl">{userDetail.name}</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-bold text-xl">Vai trò</p>
                    <p className="text-xl">Cố vấn học tập</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-bold text-xl">Lớp hiện tại</p>
                    <p className="text-xl">
                      {studentClass?.class_id} - {studentClass?.class_name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-9/12 mx-auto">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl text-blue-950 font-semibold">Tiện ích</h1>
            <div className="grid grid-cols-12 gap-4">
              <Link
                to={`/${role}/forum`}
                className="col-span-4 bg-white p-4 rounded-lg shadow-md flex justify-center items-center flex-col gap-2"
              >
                <MdForum className="w-12 h-12 text-amber-400" />
                <span className="ml-2 text-xl">Diễn đàn</span>
              </Link>
              <Link
                to={`/${role}/students`}
                className="col-span-4 bg-white p-4 rounded-lg shadow-md flex justify-center items-center flex-col gap-2"
              >
                <IoMdInformationCircle className="w-12 h-12 text-purple-400" />
                <span className="ml-2 text-xl">Thông tin sinh viên</span>
              </Link>
              <Link
                to={`/${role}/studentScore`}
                className="col-span-4 bg-white p-4 rounded-lg shadow-md flex justify-center items-center flex-col gap-2"
              >
                <MdOutlineScore className="w-12 h-12 text-blue-400" />
                <span className="ml-2 text-xl">Bảng điểm</span>
              </Link>

              <Link
                to={`/${role}/databaseManagement`}
                className=" col-span-4 bg-white p-4 rounded-lg shadow-md flex justify-center items-center flex-col gap-2"
              >
                <GrScorecard className="w-12 h-12 text-green-400" />
                <span className="ml-2 text-xl">Quản lý CSDL</span>
              </Link>
              <Link
                to={`/${role}/dashboard`}
                className=" col-span-4 bg-white p-4 rounded-lg shadow-md flex justify-center items-center flex-col gap-2"
              >
                <MdOutlineDashboardCustomize className="w-12 h-12 text-pink-400" />
                <span className="ml-2 text-xl">Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="col-span-4 bg-white p-4 rounded-lg shadow-md flex items-center flex-col w-full"
              >
                <CiLogout className="w-12 h-12 text-red-600" />
                <span className="ml-2 text-xl">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div>Role không hợp lệ</div>;
};

export default Home;
