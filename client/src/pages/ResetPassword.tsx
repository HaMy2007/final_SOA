import { useState } from "react";
import forgotpw from "../assets/forgotpw.jpg";
import logo from "../assets/logo.png";
import { MockUsers } from "../data/MockUsers";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { init } from "@emailjs/browser";

init({
  publicKey: "5j21xEi95fEwoKMZ-",
  limitRate: {
    throttle: 2000,
  },
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // const validateStudentEmail = (email: string) => {
  //   const emailRegex = /^[a-zA-Z0-9._%+-]+@student\.tdtu\.edu\.vn$/;
  //   return emailRegex.test(email);
  // };

  const generateTemporaryPassword = () => {
    const length = 10;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let tempPassword = "";
    for (let i = 0; i < length; i++) {
      tempPassword += charset.charAt(
        Math.floor(Math.random() * charset.length)
      );
    }
    return tempPassword;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      if (!email) {
        throw new Error("Vui lòng nhập email của bạn.");
      }

      const user = MockUsers.find((user) => user.email === email);
      if (!user) {
        throw new Error("Email này chưa được đăng ký trong hệ thống.");
      }

      const templateParams = {
        email: email.trim(),
        link: `http://localhost:5173/new-password/${user.id}`,
      };

      console.log("Sending email with params:", templateParams);

      const result = await emailjs.send(
        "service_j43pzyj",
        "template_gabd9fd",
        templateParams,
        "5j21xEi95fEwoKMZ-"
      );

      console.log("Email result:::", result);

      setMessage(
        "Link đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư."
      );

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error: any) {
      console.error("Error details:", error);
      if (error.text) {
        console.error("Error text:", error.text);
      }
      if (error.status) {
        console.error("Error status:", error.status);
      }
      setError(
        `Lỗi gửi email: ${
          error.text || error.message || "Vui lòng thử lại sau"
        }`
      );
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-blue-950">
      <div className="w-4/5 h-4/5 bg-white rounded-md shadow-2xl shadow-blue flex">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h1 className="text-blue-950 font-bold text-5xl">Quên mật khẩu</h1>
          <h2 className="text-blue-950">
            Nhập email của bạn để nhận mật khẩu tạm thời
          </h2>
          <img className="w-3/5" src={forgotpw} alt="reset password" />
        </div>

        <div className="flex-1 flex flex-col gap-4 items-center justify-center">
          <div className="flex flex-col gap-2 items-center">
            <img src={logo} className="w-14 h-14" alt="logo" />
            <span className="font-bold">Stdportal</span>
          </div>

          <form
            onSubmit={handleResetPassword}
            className="flex flex-col gap-4 w-3/5"
          >
            <div className="flex flex-col gap-1">
              <label className="text-blue-950 font-semibold">Email</label>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                className="border border-gray-300 rounded-md p-2"
                disabled={isLoading}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-600 text-sm">{message}</p>}

            <button
              type="submit"
              className={`bg-blue-950 hover:bg-blue-900 text-white rounded-md p-2 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Đang gửi..." : "Quên mật khẩu"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-blue-950 text-sm hover:underline"
              disabled={isLoading}
            >
              Quay lại đăng nhập
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
