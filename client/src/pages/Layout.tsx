import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

type Props = {};

const Layout = (props: Props) => {
  return (
    <div className="w-full h-screen ">
      <div className="grid grid-cols-12">
        <div className="col-span-2 h-screen">
          <Sidebar />
        </div>
        <div className="col-span-10 h-screen bg-gray-200">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
