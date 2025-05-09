import axios from "axios";
import { useEffect, useState } from "react";

type Props = {};

interface Schedule {
  day: string;
  periods: {
    subject: string;
    teacher: string;
    room: string;
  }[];
}

const Schedule = (props: Props) => {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const token = localStorage.getItem("token");

  const mockSchedule: Schedule[] = [
    {
      day: "Thứ 2",
      periods: [
        { subject: "Toán", teacher: "Nguyễn Văn A", room: "A101" },
        { subject: "Văn", teacher: "Trần Thị B", room: "A102" },
        { subject: "Anh", teacher: "Phạm Văn C", room: "A103" },
        { subject: "Lý", teacher: "Lê Thị D", room: "A104" },
        { subject: "Sinh", teacher: "Hoàng Văn E", room: "A105" },
      ],
    },
    {
      day: "Thứ 3",
      periods: [
        { subject: "Hóa", teacher: "Vũ Thị F", room: "A201" },
        { subject: "Sử", teacher: "Đặng Văn G", room: "A202" },
        { subject: "Địa", teacher: "Bùi Thị H", room: "A203" },
        { subject: "GDCD", teacher: "Ngô Văn I", room: "A204" },
        { subject: "Tin", teacher: "Đỗ Thị K", room: "A205" },
      ],
    },
    {
      day: "Thứ 4",
      periods: [
        { subject: "Hóa", teacher: "Vũ Thị F", room: "A201" },
        { subject: "Sử", teacher: "Đặng Văn G", room: "A202" },
        { subject: "Địa", teacher: "Bùi Thị H", room: "A203" },
        { subject: "GDCD", teacher: "Ngô Văn I", room: "A204" },
        { subject: "Tin", teacher: "Đỗ Thị K", room: "A205" },
      ],
    },
    {
      day: "Thứ 5",
      periods: [
        { subject: "Hóa", teacher: "Vũ Thị F", room: "A201" },
        { subject: "Sử", teacher: "Đặng Văn G", room: "A202" },
        { subject: "Địa", teacher: "Bùi Thị H", room: "A203" },
        { subject: "GDCD", teacher: "Ngô Văn I", room: "A204" },
        { subject: "Tin", teacher: "Đỗ Thị K", room: "A205" },
      ],
    },
    {
      day: "Thứ 6",
      periods: [
        { subject: "Hóa", teacher: "Vũ Thị F", room: "A201" },
        { subject: "Sử", teacher: "Đặng Văn G", room: "A202" },
        { subject: "Địa", teacher: "Bùi Thị H", room: "A203" },
        { subject: "GDCD", teacher: "Ngô Văn I", room: "A204" },
        { subject: "Tin", teacher: "Đỗ Thị K", room: "A205" },
      ],
    },
    {
      day: "Thứ 7",
      periods: [
        { subject: "Hóa", teacher: "Vũ Thị F", room: "A201" },
        { subject: "Sử", teacher: "Đặng Văn G", room: "A202" },
        { subject: "Địa", teacher: "Bùi Thị H", room: "A203" },
        { subject: "GDCD", teacher: "Ngô Văn I", room: "A204" },
        { subject: "Tin", teacher: "Đỗ Thị K", room: "A205" },
      ],
    },
  ];

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const res = await axios.get("http://localhost:4001/api/semesters", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSemesters(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách kỳ học:", err);
      }
    };

    fetchSemesters();
  }, [token]);

  const handleCreateSchedule = () => {
    setShowModal(true); // Hiển thị modal khi nhấn nút
  };

  const handleCloseModal = () => {
    setShowModal(false); // Đóng modal
  };

  const handleSubmit = () => {
    // Xử lý logic tạo thời khóa biểu với kỳ học đã chọn
    console.log("Tạo thời khóa biểu cho kỳ:", selectedSemester);
    handleCloseModal(); // Đóng modal sau khi tạo
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Thời khóa biểu</h1>
        <button
          onClick={handleCreateSchedule}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Tạo thời khóa biểu
        </button>
      </div>

      <div className="mb-4 flex items-center">
        <label htmlFor="semester-select" className="mr-2 text-gray-700">
          Chọn kỳ học:
        </label>
        <select
          id="semester-select"
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">Tất cả kỳ học</option>
          {semesters.map((semester) => (
            <option key={semester._id} value={semester._id}>
              {semester.semester_name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Tiết/Thứ</th>
              <th className="border p-2">Thứ 2</th>
              <th className="border p-2">Thứ 3</th>
              <th className="border p-2">Thứ 4</th>
              <th className="border p-2">Thứ 5</th>
              <th className="border p-2">Thứ 6</th>
              <th className="border p-2">Thứ 7</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((period) => (
              <tr key={period}>
                <td className="border p-2 font-semibold">Tiết {period}</td>
                {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"].map(
                  (day, index) => {
                    const daySchedule = mockSchedule.find((s) => s.day === day);
                    const periodData = daySchedule?.periods[period - 1];
                    return (
                      <td key={index} className="border p-2">
                        {periodData ? (
                          <div>
                            <div className="font-medium text-blue-600">
                              {periodData.subject}
                            </div>
                            <div className="text-sm text-gray-600">
                              GV: {periodData.teacher}
                            </div>
                            <div className="text-sm text-gray-500">
                              Phòng: {periodData.room}
                            </div>
                          </div>
                        ) : (
                          "---"
                        )}
                      </td>
                    );
                  }
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Chọn kỳ học</h2>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="border rounded p-2 mb-4 w-full"
            >
              <option value="">Chọn kỳ học</option>
              {semesters.map((semester) => (
                <option key={semester._id} value={semester._id}>
                  {semester.semester_name}
                </option>
              ))}
            </select>
            <div className="flex justify-end">
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg mr-2"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Schedule;
