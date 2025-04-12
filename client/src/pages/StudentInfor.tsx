import { IoMdAdd } from "react-icons/io";
import StudentList from "../components/StudentList";
import { useStudentInfo } from "../context/StudentInfoContext";
import { useState } from "react";
import { CiImport } from "react-icons/ci";

type Props = {};

const StudentInfor = (props: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { students, handleAdd } = useStudentInfo();
  const [newStudent, setNewStudent] = useState({
    name: "",
    tdt_id: "",
    gender: "",
    dateOfBirth: "",
    phoneNumber: "",
    parentPhoneNumber: "",
    address: "",
    role: "student",
    email: "",
    class: "",
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewStudent({ ...newStudent, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const studentEmail = `${newStudent.tdt_id}@student.tdtu.edu.vn`;

    const formattedStudent = {
      ...newStudent,
      email: studentEmail,
      dateOfBirth: new Date(newStudent.dateOfBirth),
    };

    handleAdd(formattedStudent);

    setNewStudent({
      name: "",
      tdt_id: "",
      gender: "",
      dateOfBirth: "",
      phoneNumber: "",
      parentPhoneNumber: "",
      address: "",
      role: "student",
      email: "",
      class: "",
    });
    setIsAdding(false);
  };

  const filteredStudents = students.filter((student) => {
    return Object.values(student).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="w-full h-full bg-white">
      <div className="h-full mx-auto overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-bold text-2xl text-blue-950">
            Thông tin sinh viên
          </h1>
          <div className="flex gap-2">
            <input
              placeholder="Tìm kiếm"
              className="border rounded-md px-2"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button
              className="bg-blue-700 hover:bg-blue-800 cursor-pointer flex items-center gap-1 text-white px-3 py-2 rounded-xl"
              onClick={() => setIsAdding(true)}
            >
              <IoMdAdd className="text-white font-bold" />
              Thêm sinh viên
            </button>

            <button className="bg-blue-700 hover:bg-blue-800 cursor-pointer flex items-center gap-1 text-white px-3 py-2 rounded-xl">
              <CiImport className="text-white font-bold" />
              Import dssv
            </button>
          </div>
        </div>

        {isAdding && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
            <div className="bg-white p-6 rounded-md w-3/5 mx-auto shadow-2xl">
              <h2 className="text-xl mb-4 font-bold text-blue-700">
                Thêm Sinh Viên
              </h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Họ và tên"
                  value={newStudent.name}
                  onChange={handleInputChange}
                  required
                  className="border rounded-md px-2 mb-4 w-full py-2"
                />
                <input
                  type="text"
                  name="class"
                  placeholder="Lớp"
                  value={newStudent.class}
                  onChange={handleInputChange}
                  required
                  className="border rounded-md px-2 mb-4 w-full py-2"
                />
                <input
                  type="text"
                  name="tdt_id"
                  placeholder="Mã số sinh viên"
                  value={newStudent.tdt_id}
                  onChange={handleInputChange}
                  required
                  className="border rounded-md px-2 mb-4 w-full py-2"
                />
                <select
                  name="gender"
                  value={newStudent.gender}
                  onChange={handleInputChange}
                  required
                  className="border rounded-md px-2 mb-4 w-full py-2"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={newStudent.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  className="border rounded-md px-2 mb-4 w-full py-2"
                />
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Số điện thoại"
                  value={newStudent.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="border rounded-md px-2 mb-4 w-full py-2"
                />
                <input
                  type="text"
                  name="parentPhoneNumber"
                  placeholder="Số điện thoại phụ huynh"
                  value={newStudent.parentPhoneNumber}
                  onChange={handleInputChange}
                  required
                  className="border rounded-md px-2 mb-4 w-full py-2"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Địa chỉ"
                  value={newStudent.address}
                  onChange={handleInputChange}
                  required
                  className="border rounded-md px-2 mb-4 w-full py-2"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    Thêm
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <StudentList students={filteredStudents} />
      </div>
    </div>
  );
};

export default StudentInfor;
