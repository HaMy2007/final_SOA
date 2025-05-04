import { Link } from "react-router-dom";
import mockDepartments from "../../data/mockDepartments";

type Props = {};

const DepartmentManagement = (props: Props) => {
  return (
    <div className="w-full h-full p-4 overflow-y-auto bg-gray-50">
      <div className="w-9/12 mx-auto relative">
        <div className="grid grid-cols-3 gap-5">
          {mockDepartments.map((department) => (
            <Link
              to={`${department.id}`}
              className="overflow-hidden flex flex-col gap-2 p-4 h-60 border rounded-lg shadow-lg bg-white hover:bg-blue-50 transition duration-300 ease-in-out text-blue-800 cursor-pointer"
              key={department.id}
            >
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-lg text-center bg-blue-200 p-2 rounded-md shadow-sm">
                  {department.name}
                </h3>
              </div>

              <ul className="font-semibold text-center">
                {department.subjects.map((subject, index) => (
                  <li key={index} className=" p-2">
                    {subject}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagement;
