import { useState } from "react";
import { MdDelete } from "react-icons/md";
import { useParams } from "react-router-dom";
import { useDepartment } from "../../context/DepartmentContext";
import mockDepartments from "../../data/mockDepartments";

const DepartmentDetail = () => {
  const { departmentId } = useParams();
  const {
    addDepartmentTeacher,
    removeDepartmentTeacher,
    searchDepartmentTeachers,
  } = useDepartment();

  const [newTeacherInfo, setNewTeacherInfo] = useState({
    email: "",
    subject: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const departmentInfo = mockDepartments.find(
    (dept) => dept.id === Number(departmentId)
  );

  const handleAddTeacher = () => {
    if (departmentId) {
      addDepartmentTeacher(
        newTeacherInfo.email,
        newTeacherInfo.subject,
        Number(departmentId)
      );
      setNewTeacherInfo({ email: "", subject: "" });
    }
  };

  const filteredTeachers = searchDepartmentTeachers(
    searchTerm,
    Number(departmentId)
  );

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <div className="w-9/12 mx-auto relative">
        {departmentInfo && (
          <div className="mb-6 bg-blue-50 p-4 rounded shadow">
            <h2 className="text-xl font-bold">
              Thông tin tổ: {departmentInfo.name}
            </h2>
            <p className="mt-2">
              Các môn học:{" "}
              {departmentInfo.subjects.map((subject) => (
                <span
                  key={subject}
                  className="inline-block bg-blue-100 rounded-full px-3 py-1 text-sm font-semibold text-blue-700 mr-2"
                >
                  {subject}
                </span>
              ))}
            </p>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="email"
              placeholder="Nhập email giáo viên"
              value={newTeacherInfo.email}
              onChange={(e) =>
                setNewTeacherInfo({ ...newTeacherInfo, email: e.target.value })
              }
              className="border p-2 rounded-md"
            />
            <select
              value={newTeacherInfo.subject}
              onChange={(e) =>
                setNewTeacherInfo({
                  ...newTeacherInfo,
                  subject: e.target.value,
                })
              }
              className="border p-2 rounded-md"
            >
              <option value="">Chọn môn dạy</option>
              {departmentInfo?.subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <button
              className="bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-md"
              onClick={handleAddTeacher}
            >
              Thêm giáo viên
            </button>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm giáo viên"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded-md"
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Mã giáo viên
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Họ và tên
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Email
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Số điện thoại
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Môn dạy
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeachers.map((dt) => (
                <tr key={dt.teacher.id}>
                  <td className="py-2 px-4">{dt.teacher.id}</td>
                  <td className="py-2 px-4">{dt.teacher.name}</td>
                  <td className="py-2 px-4">{dt.teacher.email}</td>
                  <td className="py-2 px-4">{dt.teacher.phone_number}</td>
                  <td className="py-2 px-4">{dt.subject}</td>
                  <td className="py-2 px-4 text-center">
                    <button
                      onClick={() =>
                        removeDepartmentTeacher(
                          dt.teacher.id,
                          Number(departmentId)
                        )
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <MdDelete className="w-5 h-5" />
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

export default DepartmentDetail;
