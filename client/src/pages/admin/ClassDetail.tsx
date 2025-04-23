import { useEffect, useState } from "react";
import { useClass } from "../../context/ClassContext";
import { mockListStudents } from "../../data/mockListStudent";

type Props = {};

const ClassDetail = (props: Props) => {
  const { advisor, handleAddAdvisor, handleEditAdvisor } = useClass();
  const [newAdvisorEmail, setNewAdvisorEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState(mockListStudents);

  const handleAddAdvisorClick = () => {
    handleAddAdvisor(newAdvisorEmail);
    setNewAdvisorEmail("");
  };

  const handleEditAdvisorClick = () => {
    handleEditAdvisor(newAdvisorEmail);
    setNewAdvisorEmail("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const result = mockListStudents.filter((student) => {
      return (
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.tdt_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredStudents(result);
  }, [searchTerm]);

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <div className="w-9/12 mx-auto relative">
        {!advisor ? (
          <div className="mb-4 flex gap-3">
            <input
              type="email"
              placeholder="Nhập email cố vấn"
              value={newAdvisorEmail}
              onChange={(e) => setNewAdvisorEmail(e.target.value)}
              className="border p-2 rounded-md w-2/5"
            />
            <button
              className="bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-md"
              onClick={handleAddAdvisorClick}
            >
              Thêm cố vấn
            </button>
          </div>
        ) : (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">Cố vấn hiện tại: {advisor}</h3>
            <div className="flex items-center gap-3">
              <input
                placeholder="Tìm kiếm"
                className="px-4 py-2 rounded-md mt-2"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button
                className="bg-blue-900 hover:bg-blue-950 cursor-pointer text-white px-4 py-2 rounded-md mt-2"
                onClick={handleEditAdvisorClick}
              >
                Chỉnh sửa cố vấn
              </button>
            </div>
          </div>
        )}
        <table className="min-w-full border-collapse border border-gray-300 bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="text-base border border-gray-300 p-2">
                Họ và tên
              </th>
              <th className="text-base border border-gray-300 p-2">
                Mã số sinh viên
              </th>
              <th className="text-base border border-gray-300 p-2">
                Giới tính
              </th>
              <th className="text-base border border-gray-300 p-2">
                Ngày sinh
              </th>
              <th className="text-base border border-gray-300 p-2">Email</th>
              <th className="text-base border border-gray-300 p-2">
                Số điện thoại
              </th>
              <th className="text-base border border-gray-300 p-2">
                Số điện thoại phụ huynh
              </th>
              <th className="border text-base border-gray-300 p-2">Địa chỉ</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.tdt_id} className="hover:bg-gray-100">
                <td className="text-center border text-sm border-gray-300 p-4">
                  {student.name}
                </td>
                <td className="text-center border text-sm border-gray-300 p-4">
                  {student.tdt_id}
                </td>
                <td className="text-center border text-sm border-gray-300 p-4">
                  {student.gender === "female" ? "Nữ" : "Nam"}
                </td>
                <td className="text-center border text-sm border-gray-300 p-4">
                  {student.dateOfBirth
                    ? new Date(student.dateOfBirth).toLocaleDateString()
                    : "Chưa có thông tin"}
                </td>
                <td className="text-center border text-sm border-gray-300 p-4">
                  {student.email}
                </td>
                <td className="text-center border text-sm border-gray-300 p-4">
                  {student.phoneNumber?.startsWith("0")
                    ? student.phoneNumber
                    : "0" + student.phoneNumber}
                </td>
                <td className="text-center border text-sm border-gray-300 p-4">
                  {student.parentPhoneNumber || "Chưa có thông tin"}
                </td>
                <td className="text-center border text-sm border-gray-300 p-4">
                  {student.address}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassDetail;
