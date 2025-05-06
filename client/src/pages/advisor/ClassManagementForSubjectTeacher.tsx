import axios from "axios";
import { useEffect, useState } from "react";
import { FaInfoCircle, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ClassManagementForSubjectTeacher = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTeacherClasses = async () => {
      try {
        // Tạm thời sử dụng API classes hiện có
        const classesRes = await axios.get(
          `http://localhost:4000/api/classes`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Giả định đây là các lớp mà giáo viên bộ môn dạy
        setClasses(classesRes.data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách lớp:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherClasses();
  }, []);

  const fetchStudentsByClass = async (classId: string) => {
    try {
      setSelectedClass(classId);
      // Sử dụng API hiện có để lấy danh sách học sinh của lớp
      const classRes = await axios.get(
        `http://localhost:4000/api/classes/${classId}/students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const studentIds = classRes.data?.students.map((s: any) => s._id);

      if (studentIds.length === 0) {
        setStudents([]);
        setFilteredStudents([]);
        return;
      }

      const usersRes = await axios.post(
        `http://localhost:4003/api/users/batch`,
        { ids: studentIds },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const enrichedStudents = await Promise.all(
        usersRes.data.map(async (student: any) => {
          try {
            const scoreRes = await axios.get(
              `http://localhost:4002/api/students/${student._id}/scores`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            return {
              ...student,
              class_id: classId,
              ...scoreRes.data,
            };
          } catch {
            return {
              ...student,
              class_id: classId,
              gpa: "-",
              status: "Chưa có",
            };
          }
        })
      );

      setStudents(enrichedStudents);
      setFilteredStudents(enrichedStudents);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách học sinh:", err);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = students.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.tdt_id?.toLowerCase().includes(term)
    );
    setFilteredStudents(filtered);
  };

  const handleViewDetails = (studentId: string) => {
    navigate(`/advisor/classForSubjectTeacher/${selectedClass}/${studentId}`);
  };

  if (loading) return <div className="p-6">Đang tải danh sách lớp học...</div>;

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Quản lý lớp học</h1>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <select
          className="px-4 py-2 border rounded-md"
          value={selectedClass}
          onChange={(e) => fetchStudentsByClass(e.target.value)}
        >
          <option value="">Chọn lớp</option>
          {classes.map((cls) => (
            <option key={cls.class_id} value={cls.class_id}>
              {cls.class_id} - {cls.class_name}
            </option>
          ))}
        </select>

        {selectedClass && (
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã định danh..."
              className="w-full px-4 py-2 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        )}
      </div>

      {selectedClass && (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-3 px-4 text-left">Họ và tên</th>
                <th className="py-3 px-4 text-left">Mã định danh</th>
                <th className="py-3 px-4 text-left">Ngày sinh</th>
                <th className="py-3 px-4 text-center">Chi tiết điểm</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{student.name}</td>
                  <td className="py-3 px-4">{student.tdt_id}</td>
                  <td className="py-3 px-4">
                    {new Date(student.date_of_birth).toLocaleDateString(
                      "vi-VN"
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => handleViewDetails(student.tdt_id)}
                    >
                      <FaInfoCircle size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClassManagementForSubjectTeacher;
