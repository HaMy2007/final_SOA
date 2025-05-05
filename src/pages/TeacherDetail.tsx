import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Class {
  _id: string;
  name: string;
  subject: string;
}

interface Teacher {
  _id: string;
  tdt_id: string;
  name: string;
  email: string;
  phone_number: string;
  subject_name: string;
  classes: Class[];
}

const TeacherDetail = () => {
  const { departmentId, teacherId } = useParams();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4001/api/departments/${departmentId}/teachers/${teacherId}`
        );
        setTeacher(response.data);
        // Fetch danh sách lớp
        const classesResponse = await axios.get(
          `http://localhost:4001/api/classes`
        );
        setClasses(classesResponse.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin giáo viên:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherDetails();
  }, [departmentId, teacherId]);

  const handleAddClass = async () => {
    if (!selectedClass) {
      alert("Vui lòng chọn một lớp");
      return;
    }

    try {
      await axios.post(
        `http://localhost:4001/api/departments/${departmentId}/teachers/${teacherId}/classes`,
        {
          class_id: selectedClass,
        }
      );

      // Refresh teacher data
      const response = await axios.get(
        `http://localhost:4001/api/departments/${departmentId}/teachers/${teacherId}`
      );
      setTeacher(response.data);
      setSelectedClass("");
      alert("Thêm lớp thành công!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi khi thêm lớp");
    }
  };

  const handleRemoveClass = async (classId: string) => {
    try {
      await axios.delete(
        `http://localhost:4001/api/departments/${departmentId}/teachers/${teacherId}/classes/${classId}`
      );

      // Refresh teacher data
      const response = await axios.get(
        `http://localhost:4001/api/departments/${departmentId}/teachers/${teacherId}`
      );
      setTeacher(response.data);
      alert("Xóa lớp thành công!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi khi xóa lớp");
    }
  };

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (!teacher) return <div className="p-4">Không tìm thấy giáo viên</div>;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Thông tin giáo viên</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Mã giáo viên:</p>
              <p className="font-semibold">{teacher.tdt_id}</p>
            </div>
            <div>
              <p className="text-gray-600">Họ và tên:</p>
              <p className="font-semibold">{teacher.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Email:</p>
              <p className="font-semibold">{teacher.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Số điện thoại:</p>
              <p className="font-semibold">{teacher.phone_number}</p>
            </div>
            <div>
              <p className="text-gray-600">Môn dạy:</p>
              <p className="font-semibold">{teacher.subject_name}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Danh sách lớp đang dạy</h3>

          <div className="mb-4 flex gap-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border rounded-md p-2 flex-1"
            >
              <option value="">Chọn lớp</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddClass}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Thêm lớp
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên lớp
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teacher.classes?.map((c) => (
                  <tr key={c._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{c.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleRemoveClass(c._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetail;
