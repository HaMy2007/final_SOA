import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { useAdvisorInfo } from "../context/AdvisorInfoContext";

type Props = {
  advisors: any[];
};

const AdvisorList = ({ advisors }: Props) => {
  const {
    isEditing,
    handleUpdate,
    handleEdit,
    handleDelete,
    editingAdvisor,
    setEditingAdvisor,
    setIsEditing,
  } = useAdvisorInfo();

  return (
    <div className="overflow-x-auto">
      {isEditing && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <h2 className="text-xl font-bold mb-4">
              Chỉnh sửa thông tin cố vấn
            </h2>
            <form onSubmit={handleUpdate} className="space-y-2">
              {/* <div>
                <label className="block text-sm font-medium">Họ và tên</label>
                <input
                  type="text"
                  value={editingAdvisor.name}
                  onChange={(e) =>
                    setEditingAdvisor({
                      ...editingAdvisor,
                      name: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div> */}
              <div>
                <label className="block text-sm font-medium">Giới tính</label>
                <input
                  type="text"
                  value={editingAdvisor.gender}
                  onChange={(e) =>
                    setEditingAdvisor({
                      ...editingAdvisor,
                      gender: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Lớp</label>
                <input
                  type="text"
                  value={editingAdvisor.class}
                  onChange={(e) =>
                    setEditingAdvisor({
                      ...editingAdvisor,
                      class: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Ngày sinh</label>
                <input
                  type="date"
                  value={
                    editingAdvisor.date_of_birth.toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setEditingAdvisor({
                      ...editingAdvisor,
                      date_of_birth: new Date(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={editingAdvisor.email}
                  onChange={(e) =>
                    setEditingAdvisor({
                      ...editingAdvisor,
                      email: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div> */}
              {/* <div>
                <label className="block text-sm font-medium">
                  Mã số cố vấn
                </label>
                <input
                  type="text"
                  value={editingAdvisor.tdt_id}
                  onChange={(e) =>
                    setEditingAdvisor({
                      ...editingAdvisor,
                      tdt_id: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div> */}
              <div>
                <label className="block text-sm font-medium">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={editingAdvisor.phone_number}
                  onChange={(e) =>
                    setEditingAdvisor({
                      ...editingAdvisor,
                      phone_number: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Địa chỉ</label>
                <input
                  type="text"
                  value={editingAdvisor.address}
                  onChange={(e) =>
                    setEditingAdvisor({
                      ...editingAdvisor,
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
              Mã số cố vấn
            </th>
            <th className="text-base border border-gray-300 p-2">Giới tính</th>
            <th className="text-base border border-gray-300 p-2">Lớp</th>
            <th className="text-base border border-gray-300 p-2">Ngày sinh</th>
            <th className="text-base border border-gray-300 p-2">Email</th>
            <th className="text-base border border-gray-300 p-2">
              Số điện thoại
            </th>
            <th className="border text-base border-gray-300 p-2">Địa chỉ</th>
            <th className="border text-base border-gray-300 p-2">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {advisors.map((advisor) => (
            <tr key={advisor.tdt_id} className="hover:bg-gray-100">
              <td className="text-center border text-sm border-gray-300 p-4">
                {advisor.name}
              </td>
              <td className="text-center border text-sm border-gray-300 p-4">
                {advisor.tdt_id}
              </td>
              <td className="text-center border text-sm border-gray-300 p-4">
                {advisor.gender}
              </td>
              <td className="text-center border text-sm border-gray-300 p-4">
                {advisor.class}
              </td>
              <td className="text-center border text-sm border-gray-300 p-4">
                {advisor.date_of_birth
                  ? new Date(advisor.date_of_birth).toLocaleDateString()
                  : "Chưa có ngày sinh"}
              </td>
              <td className="text-center border text-sm border-gray-300 p-4">
                {advisor.email}
              </td>
              <td className="text-center border text-sm border-gray-300 p-4">
                {advisor.phone_number}
              </td>
              <td className="text-center border text-sm border-gray-300 p-4">
                {advisor.address}
              </td>
              <td className="border text-sm border-gray-300 text-center">
                <button
                  onClick={() => handleEdit(advisor)}
                  className="cursor-pointer mr-2 text-xl text-blue-500 hover:text-blue-700"
                >
                  <CiEdit />
                </button>
                <button
                  onClick={() => handleDelete(advisor.tdt_id)}
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

export default AdvisorList;
