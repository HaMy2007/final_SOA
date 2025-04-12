import { FaUpload, FaFileUpload } from "react-icons/fa";

const DatabaseManagement = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = Array.isArray(user.role) ? user.role[0] : user.role;

  const handleFileUpload = (type: string) => {
    // Xử lý upload file sau
    console.log(`Uploading ${type}`);
  };

  const UploadSection = ({
    title,
    description,
    onUpload,
  }: {
    title: string;
    description: string;
    onUpload: () => void;
  }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 italic mb-4">{description}</p>
      <div className="flex gap-4">
        <button
          className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          onClick={onUpload}
        >
          <FaUpload />
          Chọn file
        </button>
        <button
          className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={onUpload}
        >
          <FaFileUpload />
          Tải lên
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Quản lý cơ sở dữ liệu</h1>
      <p className="text-gray-600 mb-8">
        Nơi tải lên dữ liệu sinh viên, điểm số, kì học
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 1 gap-8">
        {role === "admin" && (
          <>
            <div>
              <UploadSection
                title="Danh sách CVHT"
                description="Tải danh sách tài khoản và thông tin Cố vấn."
                onUpload={() => handleFileUpload("cvht")}
              />
              <UploadSection
                title="Danh sách sinh viên"
                description="Tải danh sách tài khoản và thông tin sinh viên."
                onUpload={() => handleFileUpload("students")}
              />
            </div>
          </>
        )}

        <div>
          <UploadSection
            title="Danh sách môn học"
            description="Tải danh sách môn học lên hệ thống."
            onUpload={() => handleFileUpload("subjects")}
          />
          <UploadSection
            title="Danh sách kì học"
            description="Tải danh sách kì học lên hệ thống."
            onUpload={() => handleFileUpload("semesters")}
          />
        </div>

        <div>
          <UploadSection
            title="Cập nhật bảng điểm"
            description="Tải danh sách bảng điểm của sinh viên lên."
            onUpload={() => handleFileUpload("grades")}
          />
          <UploadSection
            title="Cập nhật tình trạng"
            description="Tải danh sách tình trạng sinh viên lên hệ thống."
            onUpload={() => handleFileUpload("status")}
          />
        </div>
      </div>

      {role === "admin" && (
        <div className="mt-4 text-gray-600 italic">
          <p>
            Lưu ý: Các sinh viên sẽ chưa được thêm lớp. Yêu cầu CVHT tạo lớp và
            thêm tại bảng Thông tin SV.
          </p>
        </div>
      )}
    </div>
  );
};

export default DatabaseManagement;
