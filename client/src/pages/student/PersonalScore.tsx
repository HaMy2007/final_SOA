import axios from "axios";
import { useEffect, useState } from "react";

const PersonalScore = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const tdt_id = user.tdt_id;

  const [userDetail, setUserDetail] = useState<any>(null);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("all");
  const [grades, setGrades] = useState<any[]>([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [gpa, setGpa] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndSemesters = async () => {
      try {
        const userRes = await axios.get(
          `http://localhost:4003/api/users/tdt/${tdt_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserDetail(userRes.data);

        const scoreGroupedRes = await axios.get(
          `http://localhost:4002/api/students/${userRes.data._id}/scores-by-semester`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const groupedData = scoreGroupedRes.data as Record<
          string,
          { name: string }
        >;
        const formatted = Object.entries(groupedData).map(([id, { name }]) => ({
          id,
          name,
        }));

        setSemesters(formatted);
      } catch (err) {
        console.error("Lỗi khi tải thông tin user hoặc học kỳ:", err);
      }
    };

    fetchUserAndSemesters();
  }, [tdt_id, token]);

  // Lấy điểm theo kỳ
  useEffect(() => {
    const fetchScores = async () => {
      if (!userDetail) return;
      setLoading(true);
      try {
        const query =
          selectedSemesterId !== "all"
            ? `?semester_id=${selectedSemesterId}`
            : "";

        const res = await axios.get(
          `http://localhost:4002/api/students/${userDetail._id}/scores${query}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setGrades(res.data.scores);
        setTotalCredits(res.data.total_credits);
        setGpa(parseFloat(res.data.gpa));
      } catch (err) {
        console.error("Lỗi khi tải bảng điểm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [userDetail, selectedSemesterId]);

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/3">
          <h2 className="text-xl font-semibold mb-4">{userDetail.name}</h2>
          <p className="text-sm mb-1">
            <strong>Mã định danh:</strong> {userDetail.tdt_id}
          </p>
          <p className="text-sm mb-1">
            <strong>GPA:</strong> {gpa.toFixed(2)}
          </p>
          {/* <p className="text-sm mb-1">
            <strong>Số tín chỉ:</strong> {totalCredits}
          </p> */}
          <p className="text-sm mb-4">
            <strong>Trạng thái:</strong> Bình thường
          </p>
          <p className="text-xs text-gray-500 mb-3">
            Nhấn nút lọc ở cột <strong>Kì học</strong> để xem chi tiết từng kì
          </p>
          {/* <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
            Xem điểm hệ 4
          </button> */}
        </div>

        <div className="w-full md:w-2/3">
          <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
            <thead className="bg-gray-200 text-gray-700 text-sm">
              <tr>
                <th className="p-3 text-left">Tên môn</th>
                <th className="p-3 text-left">Mã môn</th>
                <th className="p-3 text-center">Điểm 15p</th>
                <th className="p-3 text-center">Điểm 1 tiết</th>
                <th className="p-3 text-center">Điểm giữa kỳ</th>
                <th className="p-3 text-center">Điểm cuối kỳ</th>
                {/* <th className="p-3 text-center">Điểm hệ 10</th> */}
                {/* <th className="p-3 text-left">Kì học</th> */}
                <th className="p-3 text-left">
                  <div className="flex flex-col">
                    <span>Kì học</span>
                    <select
                      className="text-sm mt-1 px-2 py-1 border rounded bg-white"
                      value={selectedSemesterId}
                      onChange={(e) => setSelectedSemesterId(e.target.value)}
                    >
                      <option value="all">Tất cả</option>
                      {semesters.map((semester) => (
                        <option key={semester.id} value={semester.id}>
                          {semester.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade, index) => (
                <tr key={index} className="border-t text-sm">
                  <td className="p-3">{grade.subject_name}</td>
                  <td className="p-3">{grade.subject_code}</td>
                  <td className="p-3 text-center">{grade.score_15p ?? "-"}</td>
                  <td className="p-3 text-center">
                    {grade.score_1tiet ?? "-"}
                  </td>
                  <td className="p-3 text-center">
                    {grade.score_giua_ky ?? "-"}
                  </td>
                  <td className="p-3 text-center">
                    {grade.score_cuoi_ky ?? "-"}
                  </td>
                  <td className="p-3 text-center">{grade.score ?? "-"}</td>
                  <td className="p-3">
                    {selectedSemesterId === "all" ? grade.semester_name : ""}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold border-t">
                <td className="p-3" colSpan={2}>
                  Tổng kết
                </td>
                <td className="p-3 text-center">{totalCredits}</td>
                <td className="p-3 text-center">{gpa.toFixed(2)}</td>
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
