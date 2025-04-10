import { useState } from "react";
import { useNavigate } from "react-router-dom";
import login from "../assets/login.png";
import logo from "../assets/logo.png";
import { MockUsers } from "../data/MockUsers";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isShowPassword, setIsShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const user = MockUsers.find(
      (u) =>
        u.username === formData.username && u.password === formData.password
    );

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("tdt_id", user.id); // dùng để lấy dữ liệu chi tiết
      localStorage.setItem("role", user.role); // để phân quyền
      localStorage.setItem("name", user.name); // để hiển thị tên trong UI
      navigate(`/${user.role}/`);
    } else {
      setError("Tên đăng nhập hoặc mật khẩu không đúng!");
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-blue-950">
      <div className="w-4/5 h-4/5 bg-white rounded-md shadow-2xl shadow-blue flex">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h1 className="text-blue-950 font-bold text-5xl">Đăng nhập</h1>
          <h2 className="text-blue-950">
            Đảm bảo tài khoản của bạn được an toàn
          </h2>
          <img className="w-4/5" src={login} alt="anh login" />
        </div>

        <div className="flex-1 flex flex-col gap-4 items-center justify-center">
          <div className="flex flex-col gap-2">
            <img src={logo} className="w-14 h-14" />
            <span className="font-bold">Stdportal</span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-3/5">
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-blue-950 font-semibold">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập tên đăng nhập"
                  className="rounded-md p-2 w-full border border-gray-300"
                />
              </div>
              <div className="flex flex-col gap-1 relative itemc-">
                <label className="text-blue-950 font-semibold">Mật khẩu</label>
                <input
                  type={isShowPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  className="border border-gray-300 rounded-md p-2 w-full pr-10"
                />

                <div
                  className="absolute right-3 top-10 cursor-pointer text-gray-500"
                  onClick={() => setIsShowPassword((prev) => !prev)}
                >
                  {isShowPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-between w-full flex-col gap-4 mb-4">
              <span className="text-blue-950 cursor-pointer">
                Quên mật khẩu?
              </span>
            </div>

            <button
              type="submit"
              className="bg-blue-950 hover:bg-blue-900 cursor-pointer text-white rounded-md p-2 w-full"
            >
              ĐĂNG NHẬP
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
