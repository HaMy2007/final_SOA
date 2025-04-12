import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaInfoCircle, FaFilter } from "react-icons/fa";

const StudentScoresList = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = Array.isArray(user.role) ? user.role[0] : user.role;

  const mockStudents = [
    {
      name: "Võ Thị Thanh Ngân",
      student_id: "52200131",
      date_of_birth: "2001-04-05",
      class: "22050201",
      gpa: 8.0,
      statuses: ["BÌNH THƯỜNG", "CHƯA NỘP HỌC PHÍ", "CHƯA ĐỦ TÍN"],
    },
    {
      name: "Võ Thị Thanh Ngân2",
      student_id: "522001311",
      date_of_birth: "2001-04-05",
      class: "22050202",
      gpa: 8.0,
      statuses: ["BÌNH THƯỜNG", "CHƯA NỘP HỌC PHÍ", "CHƯA ĐỦ TÍN"],
    },
    {
      name: "Nguyễn Hà My",
      student_id: "52200066",
      date_of_birth: "2001-04-05",
      class: "22050203",
      gpa: 8.6,
      statuses: ["CẢNH CÁO", "CHƯA NỘP HỌC PHÍ"],
    },
    {
      name: "Danh Nguyễn Nhựt An",
      student_id: "5220008",
      date_of_birth: "2001-04-05",
      class: "22050203",
      gpa: 7.6,
      statuses: ["BÌNH THƯỜNG", "CHƯA NỘP HỌC PHÍ"],
    },
    {
      name: "Đoàn Thống Lĩnh",
      student_id: "55200013",
      date_of_birth: "2001-04-05",
      class: "22050202",
      gpa: 8.6,
      statuses: ["CẢNH CÁO", "CHƯA NỘP HỌC PHÍ", "CHƯA ĐỦ TÍN"],
    },
    {
      name: "Nguyễn Cao Kỳ",
      student_id: "52200056",
      date_of_birth: "2001-04-05",
      class: "22050202",
      gpa: 8.7,
      statuses: ["CẢNH CÁO", "CHƯA NỘP HỌC PHÍ", "CHƯA ĐỦ TÍN"],
    },
  ];

  const [students, setStudents] = useState(mockStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === "") {
      setStudents(mockStudents);
    } else {
      const filtered = mockStudents.filter(
        (student) =>
          student.name.toLowerCase().includes(term.toLowerCase()) ||
          student.student_id.includes(term) ||
          student.class.toLowerCase().includes(term.toLowerCase())
      );
      setStudents(filtered);
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);

    if (status === "") {
      setStudents(mockStudents);
    } else {
      const filtered = mockStudents.filter((student) =>
        student.statuses.some((s) => s === status)
      );
      setStudents(filtered);
    }
  };

  // const handleViewDetails = (studentId: string) => {
  //   navigate(`/student/studentScore/${studentId}`);
  // };

  const handleViewDetails = (studentId: string) => {
    const basePath = role === "admin" ? "/admin" : "/advisor";
    navigate(`${basePath}/studentDetail/${studentId}`);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "BÌNH THƯỜNG":
        return "bg-green-100 text-green-800";
      case "CẢNH CÁO":
        return "bg-yellow-100 text-yellow-800";
      case "CHƯA NỘP HỌC PHÍ":
        return "bg-orange-100 text-orange-800";
      case "CHƯA ĐỦ TÍN":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (role !== "advisor" && role !== "admin") {
    return (
      <div className="p-8">
        <h2 className="text-lg font-semibold text-red-500">
          Bạn không có quyền truy cập trang này
        </h2>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      <div className="h-full overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Bảng điểm sinh viên</h1>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Tìm kiếm theo lớp, tên hoặc mã sinh viên..."
              className="w-full px-4 py-2 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <div className="relative">
            <select
              className="px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="BÌNH THƯỜNG">Bình thường</option>
              <option value="CẢNH CÁO">Cảnh cáo</option>
              <option value="CHƯA NỘP HỌC PHÍ">Chưa nộp học phí</option>
              <option value="CHƯA ĐỦ TÍN">Chưa đủ tín</option>
            </select>
            <FaFilter className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-3 px-4 text-left">Họ và tên</th>
                <th className="py-3 px-4 text-left">Lớp</th>
                <th className="py-3 px-4 text-left">
                  Mã sinh viên
                  <button className="ml-1 text-gray-500">↕</button>
                </th>
                <th className="py-3 px-4 text-left">
                  Trạng thái
                  <button className="ml-1 text-gray-500">↕</button>
                </th>
                <th className="py-3 px-4 text-left">Ngày sinh</th>
                <th className="py-3 px-4 text-left">
                  TBCTL
                  <button className="ml-1 text-gray-500">↕</button>
                </th>

                <th className="py-3 px-4 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.student_id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="py-3 px-4">{student.name}</td>
                  <td className="py-3 px-4">{student.class}</td>
                  <td className="py-3 px-4">{student.student_id}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      {student.statuses.map((status, index) => (
                        <span
                          key={index}
                          className={`text-xs px-2 py-1 rounded-full ${getStatusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">{student.date_of_birth}</td>
                  <td className="py-3 px-4">{student.gpa}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => handleViewDetails(student.student_id)}
                    >
                      <FaInfoCircle size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentScoresList;
