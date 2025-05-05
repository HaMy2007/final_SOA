import axios from "axios";
import { useEffect, useState } from "react";
import { IoInformationCircle } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useDepartment } from "../../context/DepartmentContext";

const DepartmentDetail = () => {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const { searchDepartmentTeachers } = useDepartment();

  // ... existing code ...

  const handleViewTeacherDetail = (teacherId: string) => {
    navigate(`/admin/department/${departmentId}/${teacherId}`);
  };

  // ... existing code ...

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <div className="w-9/12 mx-auto relative">
        {departmentInfo && (
          <div className="mb-6 bg-blue-50 p-4 rounded shadow">
            <h2 className="text-xl font-bold">
              Thông tin tổ: {departmentInfo.name}
            </h2>
            <p className="mt-2">
              Các môn học:{" "}
              {departmentInfo.members.map((m: any) => (
                <span
                  key={m.subject_id}
                  className="inline-block bg-blue-100 rounded-full px-3 py-1 text-sm font-semibold text-blue-700 mr-2"
                >
                  {m.subject_name}
                </span>
              ))}
            </p>
          </div>
        )}
        // ... existing code ...
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            // ... existing code ...
            <tbody className="bg-white divide-y divide-gray-200">
              {departmentInfo.members.map((m: any) =>
                m.users
                  .filter((u: any) =>
                    u.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((user: any) => (
                    <tr key={user._id}>
                      <td className="py-2 px-4">{user.tdt_id}</td>
                      <td className="py-2 px-4">{user.name}</td>
                      <td className="py-2 px-4">{user.email}</td>
                      <td className="py-2 px-4">
                        {user.phone_number.startsWith("0")
                          ? user.phone_number
                          : "0" + user.phone_number}
                      </td>
                      <td className="py-2 px-4">{m.subject_name}</td>
                      <td className="py-2 px-4 text-center flex items-center justify-center gap-3">
                        <button
                          onClick={() =>
                            handleRemoveTeacher(user._id, m.subject_id)
                          }
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <MdDelete className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleViewTeacherDetail(user.tdt_id)}
                          className="text-blue-500 hover:text-blue-700 cursor-pointer"
                        >
                          <IoInformationCircle className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetail;
