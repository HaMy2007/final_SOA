import { useEffect, useState } from "react";
import { IoAdd } from "react-icons/io5";
import { MdCheck, MdClose, MdDelete } from "react-icons/md";
import { useParams } from "react-router-dom";

interface Class {
  id: string;
  name: string;
  subject: string;
  schedule: string;
}

const TeacherDetailInDepartment = () => {
  const { departmentId, teacherId } = useParams();
  const [teacher, setTeacher] = useState<any>(null);
  const [classes, setClasses] = useState<Class[]>([
    {
      id: "1",
      name: "10A1",
      subject: "Tin học",
      schedule: "Thứ 2 - Tiết 1,2",
    },
    {
      id: "2",
      name: "10A2",
      subject: "Tin học",
      schedule: "Thứ 3 - Tiết 3,4",
    },
  ]);

  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  useEffect(() => {
    // TODO: Fetch teacher details from API
    setTeacher({
      tdt_id: teacherId,
      name: "Nguyễn Thuý Linh",
      email: "nguyenthuylinh@tdtu.edu.vn",
      phone_number: "0398765431",
      subject: "Tin học",
    });
  }, [teacherId]);

  const handleAddClass = () => {
    setIsAddingClass(true);
    setNewClassName("");
  };

  const handleConfirmAddClass = () => {
    if (!newClassName.trim()) {
      alert("Vui lòng nhập tên lớp!");
      return;
    }

    const newClass: Class = {
      id: Date.now().toString(),
      name: newClassName.trim(),
      subject: teacher.subject,
      schedule: "",
    };

    setClasses([...classes, newClass]);
    setIsAddingClass(false);
    setNewClassName("");
  };

  const handleCancelAddClass = () => {
    setIsAddingClass(false);
    setNewClassName("");
  };

  const handleRemoveClass = (classId: string) => {
    setClasses(classes.filter((c) => c.id !== classId));
  };

  if (!teacher) return <div className="p-4">Đang tải...</div>;

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <div className="w-9/12 mx-auto">
        <div className="bg-blue-50 p-6 rounded-lg shadow mb-6">
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
              <p className="font-semibold">{teacher.subject}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-xl font-semibold">Danh sách lớp phụ trách</h3>
            {!isAddingClass && (
              <button
                onClick={handleAddClass}
                className="bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <IoAdd className="w-5 h-5" />
                Thêm lớp
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Lớp
                  </th>
                  {/* <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Môn học
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Lịch học
                  </th> */}
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isAddingClass && (
                  <tr>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="Nhập tên lớp"
                        className="border p-2 rounded-md w-full"
                        autoFocus
                      />
                    </td>
                    <td className="py-2 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={handleConfirmAddClass}
                          className="text-green-500 hover:text-green-700"
                        >
                          <MdCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancelAddClass}
                          className="text-red-500 hover:text-red-700"
                        >
                          <MdClose className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                {classes.map((cls) => (
                  <tr key={cls.id}>
                    <td className="py-2 px-4">{cls.name}</td>
                    {/* <td className="py-2 px-4">{cls.subject}</td>
                    <td className="py-2 px-4">{cls.schedule}</td> */}
                    <td className="py-2 px-4 text-center">
                      <button
                        onClick={() => handleRemoveClass(cls.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <MdDelete className="w-5 h-5 mx-auto" />
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

export default TeacherDetailInDepartment;
