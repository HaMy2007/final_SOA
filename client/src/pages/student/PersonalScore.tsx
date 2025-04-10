import { useEffect, useState } from "react";
import axios from "axios";

const PersonalScore = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const tdt_id = user.tdt_id;

  const [grades, setGrades] = useState<any[]>([]);
  const [userDetail, setUserDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy thông tin người dùng
        const userRes = await axios.get(`http://localhost:4003/api/users/tdt/${tdt_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserDetail(userRes.data);
        const studentId = userRes.data._id;
        // Lấy điểm
        const scoreRes = await axios.get(`http://localhost:4002/api/students/${studentId}/scores-by-semester`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const groupedData = scoreRes.data;

        // Chuyển dữ liệu từ object theo kỳ thành mảng
        const allGrades = Object.entries(groupedData).flatMap(([semesterName, gradeArray]) =>
          (gradeArray as any[]).map(g => ({ ...g, semester_name: semesterName }))
        );

        setGrades(allGrades);

      } catch (err) {
        console.error("Lỗi khi tải dữ liệu điểm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tdt_id, token]);

  const totalCredits = grades.reduce((sum, g) => sum + (g.credit || 0), 0);
  const avgGrade =
    totalCredits > 0
      ? grades.reduce((sum, g) => sum + (g.score || 0) * g.credit, 0) / totalCredits
      : 0;

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/3">
          <h2 className="text-xl font-semibold mb-4">{userDetail.name}</h2>
          <p className="text-sm mb-1">
            <strong>TDTU ID:</strong> {userDetail.tdt_id}
          </p>
          <p className="text-sm mb-1">
            <strong>CPA:</strong> {avgGrade.toFixed(2)}
          </p>
          <p className="text-sm mb-1">
            <strong>Số tín chỉ:</strong> {totalCredits}
          </p>
          <p className="text-sm mb-4">
            <strong>Trạng thái:</strong> Bình thường
          </p>
          {/* <p className="text-xs text-gray-500 mb-3">
            Nhấn nút lọc ở cột <strong>Kì học</strong> để xem chi tiết từng kì
          </p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
            Xem điểm hệ 4
          </button> */}
        </div>

        <div className="w-full md:w-2/3">
          <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
            <thead className="bg-gray-200 text-gray-700 text-sm">
              <tr>
                <th className="p-3 text-left">Tên học phần</th>
                <th className="p-3 text-left">Mã học phần</th>
                <th className="p-3 text-center">Tín chỉ</th>
                <th className="p-3 text-center">Điểm hệ 10</th>
                <th className="p-3 text-left">Kì học</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade, index) => (
                <tr key={index} className="border-t text-sm">
                  <td className="p-3">{grade.subject_name}</td>
                  <td className="p-3">{grade.subject_code}</td>
                  <td className="p-3 text-center">{grade.credit}</td>
                  <td className="p-3 text-center">{grade.score ?? '-'}</td>
                  <td className="p-3">{grade.semester_name}</td>
                </tr>
              ))}
              <tr className="font-semibold border-t">
                <td className="p-3" colSpan={2}>
                  Tổng kết
                </td>
                <td className="p-3 text-center">{totalCredits}</td>
                <td className="p-3 text-center">{avgGrade.toFixed(2)}</td>
                <td className="p-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PersonalScore;
