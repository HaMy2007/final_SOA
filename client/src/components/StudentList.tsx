import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { useStudentInfo } from "../context/StudentInfoContext";

type Props = {
  students: any[];
};

const StudentList = ({ students }: Props) => {
  const {
    isEditing,
    handleUpdate,
    handleEdit,
    handleDelete,
    editingStudent,
    setEditingStudent,
    setIsEditing,
  } = useStudentInfo();

  return (
    <div className="overflow-x-auto">
      {isEditing && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <h2 className="text-xl font-bold mb-4">
              Chỉnh sửa thông tin sinh viên
            </h2>
            <form onSubmit={handleUpdate} className="space-y-2">
              <div>
                <label className="block text-sm font-medium">Họ và tên</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      name: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Giới tính</label>
                <input
                  type="text"
                  value={editingStudent.gender}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      gender: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Ngày sinh</label>
                <input
                  type="date"
                  value={editingStudent.dateOfBirth.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      dateOfBirth: new Date(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      email: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div> */}
              {/* <div>
                <label className="block text-sm font-medium">
                  Mã số sinh viên
                </label>
                <input
                  type="text"
                  value={editingStudent.tdt_id}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      tdt_id: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div> */}
              <div>
                <label className="block text-sm font-medium">Lớp</label>
                <input
                  type="text"
                  value={editingStudent.class}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      class: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={editingStudent.phoneNumber}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Số điện thoại phụ huynh
                </label>
                <input
                  type="text"
                  value={editingStudent.parentPhoneNumber}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      parentPhoneNumber: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Địa chỉ</label>
                <input
                  type="text"
                  value={editingStudent.address}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      address: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="text-base border border-gray-300 p-2">Họ và tên</th>
            <th className="text-base border border-gray-300 p-2">
              Mã số sinh viên
            </th>
            <th className="text-base border border-gray-300 p-2">Giới tính</th>
            <th className="text-base border border-gray-300 p-2">Ngày sinh</th>
            <th className="text-base border border-gray-300 p-2">Email</th>
            <th className="text-base border border-gray-300 p-2">
              Số điện thoại
            </th>
            <th className="text-base border border-gray-300 p-2">
              Số điện thoại phụ huynh
            </th>
            <th className="border text-base border-gray-300 p-2">Địa chỉ</th>
            <th className="border text-base border-gray-300 p-2">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.tdt_id} className="hover:bg-gray-100">
              <td className="text-center border text-sm border-gray-300 p-4">
                {student.name}
              </td>
              <td className="text-center border text-sm border-gray-300 p-4">
                {student.tdt_id}
              </td>
              <td className="text-center border text-sm border-gray-300 p-4">
                {student.gender}
              </td>
              <td className="text-center border text-sm border-gray-300 p-4">
                {student.dateOfBirth
                  ? new Date(student.dateOfBirth).toLocaleDateString()
                  : "Chưa có ngày sinh"}
              </td>
              <td className="text-center border text-sm border-gray-300 p-4">
                {student.email}
              </td>
              <td className="text-center border text-sm border-gray-300 p-4">
                {student.phoneNumber}
              </td>
              <td className="text-center border text-sm border-gray-300 p-4">
                {student.parentPhoneNumber}
              </td>
              <td className="text-center border text-sm border-gray-300 p-4">
                {student.address}
              </td>
              <td className="border text-sm border-gray-300 text-center">
                <button
                  onClick={() => handleEdit(student)}
                  className="cursor-pointer mr-2 text-xl text-blue-500 hover:text-blue-700"
                >
                  <CiEdit />
                </button>
                <button
                  onClick={() => handleDelete(student.tdt_id)}
                  className="cursor-pointer text-red-500 text-xl hover:text-red-700"
                >
                  <MdDelete />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;
