import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaInfoCircle, FaFilter } from "react-icons/fa";
import axios from "axios";

const StudentScoresList = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;
  const token = localStorage.getItem("token");

  const [originalStudents, setOriginalStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [classId, setClassId] = useState<string>("");
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (role === 'advisor') {
          const advisorId = user.id || user._id;
          const classRes = await axios.get(`http://localhost:4000/api/teachers/${advisorId}/class`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setClassId(classRes.data.class?.class_id || "");
          fetchStudents(classRes.data.class?.students || []);
        } else if (role === 'admin') {
          const [classRes, usersRes] = await Promise.all([
            axios.get("http://localhost:4000/api/classes", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:4003/api/users", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
        
          setAvailableClasses(classRes.data);
        
          // Gắn thêm class_id nếu sinh viên có trong lớp
          const students = usersRes.data.filter((u: any) => u.role === 'student');
          const classMapping = classRes.data.flatMap((cls: any) =>
            cls.class_member.map((studentId: string) => ({
              studentId,
              class_id: cls.class_id,
            }))
          );
        
          fetchStudents(
            students.map((s: any) => s._id),
            classMapping
          );
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", (err as Error).message);
      }
    };

    fetchData();
  }, []);

  const fetchStudents = async (studentIds: string[], classMapping: any[] = []) => {
    try {
      if (studentIds.length === 0) return setOriginalStudents([]);

      const usersRes = await axios.post(`http://localhost:4003/api/users/batch`, { ids: studentIds }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const enriched = await Promise.all(
        usersRes.data.map(async (student: any) => {
          try {
            const res = await axios.get(`http://localhost:4002/api/students/${student._id}/scores`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const { gpa, status } = res.data;
            const classInfo = classMapping.find((m) => m.studentId === student._id);
            return {
              ...student,
              gpa,
              status,
              class_id: student.class_id || classInfo?.class_id || ""
            };
          } catch {
            const classInfo = classMapping.find((m) => m.studentId === student._id);
            return { ...student, gpa: "-", class_id: student.class_id || classInfo?.class_id || "", status: "Chưa có" };
          }
        })
      );

      setOriginalStudents(enriched);
      setFilteredStudents(enriched);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách sinh viên:", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // const fetchStudentsByClassId = async (classId: string) => {
  //   try {
  //     setSelectedClassId(classId);
  //     if (!classId) {
  //       const classRes = await axios.get("http://localhost:4000/api/classes", {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       const allStudentIds = classRes.data.flatMap((cls: any) => cls.class_member);
  //       const allStudentsWithClassInfo = classRes.data.flatMap((cls: any) =>
  //         cls.class_member.map((studentId: string) => ({ studentId, class_id: cls.class_id }))
  //       );
  //       fetchStudents(allStudentIds, allStudentsWithClassInfo);
  //       return;
  //     }

  //     const classRes = await axios.get(`http://localhost:4000/api/classes/${classId}/students`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setClassId(classId);
  //     const studentIds = classRes.data?.students.map((s: any) => s._id);
  //     fetchStudents(studentIds);
  //   } catch (err) {
  //     console.error("Lỗi khi lấy sinh viên lớp:", err);
  //   }
  // };
  const fetchStudentsByClassId = async (classId: string) => {
    try {
      setSelectedClassId(classId);
  
      if (classId === "") {
        // Tất cả sinh viên
        const classRes = await axios.get("http://localhost:4000/api/classes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allStudentIds = classRes.data.flatMap((cls: any) => cls.class_member);
        const allStudentsWithClassInfo = classRes.data.flatMap((cls: any) =>
          cls.class_member.map((studentId: string) => ({ studentId, class_id: cls.class_id }))
        );
  
        const res = await axios.get("http://localhost:4003/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allStudents = res.data.filter((s: any) => s.role === "student");
  
        fetchStudents(allStudents.map((s: any) => s._id), allStudentsWithClassInfo);
        return;
      }
  
      if (classId === "no_class") {
        // 👉 Sinh viên chưa có lớp
        const [classRes, usersRes] = await Promise.all([
          axios.get("http://localhost:4000/api/classes", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:4003/api/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
  
        const allClassMemberIds = classRes.data.flatMap((cls: any) => cls.class_member);
        const allStudents = usersRes.data.filter((u: any) => u.role === "student");
  
        const noClassStudents = allStudents.filter(
          (stu: any) => !allClassMemberIds.includes(stu._id)
        );
  
        fetchStudents(noClassStudents.map((s: any) => s._id), []);
        return;
      }
  
      // Sinh viên thuộc 1 lớp cụ thể
      const classRes = await axios.get(`http://localhost:4000/api/classes/${classId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClassId(classId);
      const studentIds = classRes.data?.students.map((s: any) => s._id);
      fetchStudents(studentIds, classRes.data?.students.map((s: any) => ({
        studentId: s._id,
        class_id: classId
      })));
    } catch (err) {
      console.error("Lỗi khi lấy sinh viên lớp:", err);
    }
  };
  

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterStudents(term, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    filterStudents(searchTerm, status);
  };

  const filterStudents = (term: string, status: string) => {
    const result = originalStudents.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(term) ||
        s.tdt_id?.toLowerCase().includes(term) ||
        s.class_id?.toLowerCase().includes(term);
      const matchesStatus = !status || s.status === status;
      return matchesSearch && matchesStatus;
    });
    setFilteredStudents(result);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "XUẤT SẮC": return "bg-blue-100 text-blue-800";
      case "GIỎI": return "bg-green-100 text-green-800";
      case "KHÁ": return "bg-yellow-100 text-yellow-800";
      case "TRUNG BÌNH": return "bg-orange-100 text-orange-800";
      case "YẾU": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const handleViewDetails = (studentId: string) => {
    const basePath = role === "admin" ? "/admin" : "/advisor";
    navigate(`${basePath}/studentDetail/${studentId}`);
  };

  if (role !== "advisor" && role !== "admin") {
    return <div className="p-8 text-red-500 font-semibold">Bạn không có quyền truy cập trang này</div>;
  }

  if (loading) return <div className="p-6">Đang tải danh sách sinh viên...</div>;

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Bảng điểm sinh viên</h1>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {role === "admin" && (
          <select
            className="px-4 py-2 border rounded-md"
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              fetchStudentsByClassId(e.target.value);
            }}
          >
            <option value="">Tất cả sinh viên</option>
            <option value="no_class">Chưa có lớp</option>
            {availableClasses.map((cls) => (
              <option key={cls.class_id} value={cls.class_id}>
                {cls.class_id} - {cls.class_name}
              </option>
            ))}
          </select>
        )}
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
            <option value="">Tất cả học lực</option>
            <option value="XUẤT SẮC">Xuất sắc</option>
            <option value="GIỎI">Giỏi</option>
            <option value="KHÁ">Khá</option>
            <option value="TRUNG BÌNH">Trung bình</option>
            <option value="YẾU">Yếu</option>
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
              <th className="py-3 px-4 text-left">Mã sinh viên</th>
              <th className="py-3 px-4 text-left">Trạng thái</th>
              <th className="py-3 px-4 text-left">Ngày sinh</th>
              <th className="py-3 px-4 text-left">TBCTL</th>
              <th className="py-3 px-4 text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student._id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4">{student.name}</td>
                <td className="py-3 px-4">{student.class_id || classId ? student.class_id || classId : "Chưa có lớp"}</td>
                <td className="py-3 px-4">{student.tdt_id}</td>
                <td className="py-3 px-4">
                  {student.status ? (
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(student.status)}`}>
                      {student.status}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs italic">Chưa có GPA</span>
                  )}
                </td>
                <td className="py-3 px-4">{new Date(student.date_of_birth).toLocaleDateString("vi-VN")}</td>
                <td className="py-3 px-4">{typeof student.gpa === "number" ? student.gpa.toFixed(2) : "-"}</td>
                <td className="py-3 px-4 text-center">
                  <button className="text-blue-500 hover:text-blue-700" onClick={() => handleViewDetails(student.tdt_id)}>
                    <FaInfoCircle size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentScoresList;
