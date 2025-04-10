// src/components/Sidebar.tsx
import { useNavigate } from "react-router-dom";
import { menuItems } from "../config/menuConfig";
import { CiLogout } from "react-icons/ci";
import Header from "./Header";

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;

  const filteredMenuItems = menuItems.filter((item) =>
    item.allowedRoles.includes(userRole)
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="h-full bg-blue-950 p-4 flex flex-col">
      <Header name={user.name} />

      <div className="flex-1 flex flex-col gap-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const fullPath = `/${userRole}/${item.path}`;
          return (
            <button
              key={item.path}
              onClick={() => navigate(fullPath)}
              className="flex items-center gap-2 text-white p-3 hover:bg-blue-900 rounded-md transition-colors"
            >
              <Icon />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-white p-3 hover:bg-blue-900 rounded-md mt-auto"
      >
        <CiLogout />
        <span>Đăng xuất</span>
      </button>
    </div>
  );
};

export default Sidebar;
