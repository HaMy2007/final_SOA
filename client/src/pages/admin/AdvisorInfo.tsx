import { IoMdAdd } from "react-icons/io";
import AdvisorList from "../../components/AdvisorList";
import { useAdvisorInfo } from "../../context/AdvisorInfoContext";
import { useState } from "react";
import axios from "axios";

const AdvisorInfor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { handleAdd } = useAdvisorInfo();
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [newAdvisor, setNewAdvisor] = useState({
    name: "",
    tdt_id: "",
    gender: "",
    date_of_birth: "",
    phone_number: "",
    address: "",
    role: "advisor",
    email: "",
    class: "",
  });
  const [isAdding, setIsAdding] = useState(false);

  const fetchAdvisors = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:4003/api/users/advisors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const advisorList = res.data;
      const updatedAdvisors = await Promise.all(
        advisorList.map(async (advisor: any) => {
          try {
            const classRes = await axios.get(
              `http://localhost:4000/api/teachers/${advisor._id}/class`
            );
            return {
              ...advisor,
              class_name: classRes.data.class.class_name,
              class_id: classRes.data.class.class_id,
            };
          } catch {
            return { ...advisor, class_name: "Chưa có lớp", class_id: "" };
          }
        })
      );
      setAdvisors(updatedAdvisors);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách cố vấn:", err);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewAdvisor({ ...newAdvisor, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const advisorEmail = `${newAdvisor.name
      .toLowerCase()
      .replace(/\s/g, "")}@tdtu.edu.vn`;

    const formattedAdvisor = {
      ...newAdvisor,
      email: advisorEmail,
      date_of_birth: new Date(newAdvisor.date_of_birth),
    };

    handleAdd(formattedAdvisor);

    setNewAdvisor({
      name: "",
      tdt_id: "",
      gender: "",
      date_of_birth: "",
      phone_number: "",
      address: "",
      role: "advisor",
      email: "",
      class: "",
    });
    setIsAdding(false);
  };

  const filteredAdvisors = advisors.filter((advisor) => {
    return Object.values(advisor).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="w-full h-full bg-white">
      <div className="h-full mx-auto overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-bold text-2xl text-blue-950">Thông tin cố vấn</h1>
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
              Thêm cố vấn
            </button>

            {/* <button className="bg-blue-700 hover:bg-blue-800 cursor-pointer flex items-center gap-1 text-white px-3 py-2 rounded-xl">
              <CiImport className="text-white font-bold" />
              Import dscv
            </button> */}
          </div>
        </div>

        {isAdding && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
            <div className="bg-white p-6 rounded-md w-3/5 mx-auto shadow-2xl">
              <h2 className="text-xl mb-4 font-bold text-blue-700">
                Thêm Cố Vấn
              </h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Họ và tên"
                  value={newAdvisor.name}
                  onChange={handleInputChange}
                  required
                  className="border rounded-md px-2 mb-4 w-full py-2"
                />
                <input
                  type="text"
                  name="tdt_id"
                  placeholder="Mã số cố vấn"
                  value={newAdvisor.tdt_id}
                  onChange={handleInputChange}
                  required
                  className="border rounded-md px-2 mb-4 w-full py-2"
                />
                <input
                  type="text"
                  name="class"
                  placeholder="Lớp cố vấn dạy"
                  value={newAdvisor.class}
                  onChange={handleInputChange}
                  required
                  className="border rounded-md px-2 mb-4 w-full py-2"
                />
                <select
                  name="gender"
                  value={newAdvisor.gender}
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
                  name="date_of_birth"
                  value={newAdvisor.date_of_birth}
                  onChange={handleInputChange}
                  required
                  className="border rounded-md px-2 mb-4 w-full py-2"
                />
                <input
                  type="text"
                  name="phone_number"
                  placeholder="Số điện thoại"
                  value={newAdvisor.phone_number}
                  onChange={handleInputChange}
                  required
                  className="border rounded-md px-2 mb-4 w-full py-2"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Địa chỉ"
                  value={newAdvisor.address}
                  onChange={handleInputChange}
                  required
                  className="border rounded-md px-2 mb-4 w-full py-2"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    Thêm
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="cursor-pointer bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <AdvisorList />
      </div>
    </div>
  );
};

export default AdvisorInfor;
