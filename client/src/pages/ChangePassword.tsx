import { useEffect, useState } from "react";
import changepw from "../assets/changepw.jpg";
import logo from "../assets/logo.png";
import { MockUsers } from "../data/MockUsers";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"verifyOld" | "resetNew">("verifyOld");
  const [currentUserIndex, setCurrentUserIndex] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [isShowOldPassword, setIsShowOldPassword] = useState(false);
  const [isShowNewPassword, setIsShowNewPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const index = MockUsers.findIndex((user) => user.id === parsedUser.id);

      if (index !== -1) {
        setCurrentUserIndex(index);
      } else {
        setError("Không tìm thấy tài khoản!");
      }
    } else {
      setError("Bạn chưa đăng nhập. Tạm thời đang dùng user test.");
      const index = MockUsers.findIndex((user) => user.username === "student");
      if (index !== -1) {
        setCurrentUserIndex(index);
      }
    }
  }, []);

  const handleVerifyOldPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (currentUserIndex !== null) {
      const currentUser = MockUsers[currentUserIndex];
      if (oldPassword === currentUser.password) {
        setStep("resetNew");
      } else {
        setError("Mật khẩu cũ không chính xác.");
      }
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (currentUserIndex !== null) {
      if (newPassword === oldPassword) {
        setError("Mật khẩu mới không được giống mật khẩu cũ.");
        return;
      }

      MockUsers[currentUserIndex].password = newPassword;
      setMessage("Đổi mật khẩu thành công! Đang chuyển về trang đăng nhập...");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-blue-950">
      <div className="w-4/5 h-4/5 bg-white rounded-md shadow-2xl shadow-blue flex">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h1 className="text-blue-950 font-bold text-5xl">Quên mật khẩu</h1>
          <h2 className="text-blue-950">
            {step === "verifyOld"
              ? "Nhập mật khẩu cũ để xác thực"
              : "Tạo mật khẩu mới cho tài khoản"}
          </h2>
          <img className="w-3/5" src={changepw} alt="forgot password" />
        </div>

        <div className="flex-1 flex flex-col gap-4 items-center justify-center">
          <div className="flex flex-col gap-2 items-center">
            <img src={logo} className="w-14 h-14" />
            <span className="font-bold">Stdportal</span>
          </div>

          {step === "verifyOld" && (
            <form
              onSubmit={handleVerifyOldPassword}
              className="flex flex-col gap-4 w-3/5"
            >
              <div className="flex flex-col gap-1 relative itemc-">
                <label className="text-blue-950 font-semibold">
                  Mật khẩu cũ
                </label>
                <input
                  type={isShowOldPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu cũ"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full pr-10"
                />
                <div
                  className="absolute right-3 top-10 cursor-pointer text-gray-500"
                  onClick={() => setIsShowOldPassword((prev) => !prev)}
                >
                  {isShowOldPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="bg-blue-950 hover:bg-blue-900 text-white rounded-md p-2"
              >
                Tiếp tục
              </button>
            </form>
          )}

          {step === "resetNew" && (
            <form
              onSubmit={handleChangePassword}
              className="flex flex-col gap-4 w-3/5"
            >
              <div className="flex flex-col gap-1 relative itemc-">
                <label className="text-blue-950 font-semibold">
                  Mật khẩu mới
                </label>
                <input
                  type={isShowNewPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full pr-10"
                />
                <div
                  className="absolute right-3 top-10 cursor-pointer text-gray-500"
                  onClick={() => setIsShowNewPassword((prev) => !prev)}
                >
                  {isShowNewPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              <div className="flex flex-col gap-1 relative itemc-">
                <label className="text-blue-950 font-semibold">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type={isShowConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full pr-10"
                />
                <div
                  className="absolute right-3 top-10 cursor-pointer text-gray-500"
                  onClick={() => setIsShowConfirmPassword((prev) => !prev)}
                >
                  {isShowConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {message && <p className="text-green-600 text-sm">{message}</p>}

              <button
                type="submit"
                className="bg-blue-950 hover:bg-blue-900 text-white rounded-md p-2"
              >
                Đổi mật khẩu
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
