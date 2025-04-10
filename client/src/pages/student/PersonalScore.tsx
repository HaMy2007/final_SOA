import { MockStudents } from "../../data/MockUsers";
import { mockGrades } from "../../data/mockGrades";

const PersonalScore = () => {
  const tdt_id = localStorage.getItem("tdt_id") || "2";

  const userDetail = MockStudents[tdt_id];

  const totalCredits = mockGrades.reduce((sum, g) => sum + g.credits, 0);
  const avgGrade =
    mockGrades.reduce((sum, g) => sum + g.credits * g.grade10, 0) /
    totalCredits;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/3">
          <h2 className="text-xl font-semibold mb-4">{userDetail.name}</h2>
          <p className="text-sm mb-1">
            <strong>TDTU ID:</strong> {userDetail.tdt_id}
          </p>
          <p className="text-sm mb-1">
            <strong>CPA:</strong> 3.33
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
              {mockGrades.map((grade, index) => (
                <tr key={index} className="border-t text-sm">
                  <td className="p-3">{grade.subjectName}</td>
                  <td className="p-3">{grade.subjectCode}</td>
                  <td className="p-3 text-center">{grade.credits}</td>
                  <td className="p-3 text-center">{grade.grade10}</td>
                  <td className="p-3">{grade.semester}</td>
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
