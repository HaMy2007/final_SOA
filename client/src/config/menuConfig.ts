import { FaHome } from "react-icons/fa";
import { GrScorecard } from "react-icons/gr";
import { ImProfile } from "react-icons/im";
import {
  MdForum,
  MdOutlineDashboardCustomize,
  MdOutlineScore,
} from "react-icons/md";

import React from "react";
import { IoMdInformationCircle } from "react-icons/io";
import { SiInformatica } from "react-icons/si";
import { Role } from "../types/auth";

interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType;
  allowedRoles: Role[];
}

export const menuItems: MenuItem[] = [
  {
    path: "",
    label: "Trang chủ",
    icon: FaHome,
    allowedRoles: ["admin", "student", "advisor"],
  },

  {
    path: "forum",
    label: "Diễn đàn",
    icon: MdForum,
    allowedRoles: ["student", "advisor"],
  },
  {
    path: "profile",
    label: "Hồ sơ cá nhân",
    icon: ImProfile,
    allowedRoles: ["admin", "student", "advisor"],
  },
  {
    path: "databaseManagement",
    label: "Quản lý CSDL",
    icon: GrScorecard,
    allowedRoles: ["admin", "advisor"],
  },

  {
    path: "studentScore",
    label: "Bảng điểm sinh viên",
    icon: MdOutlineScore,
    allowedRoles: ["advisor", "admin"],
  },
  {
    path: "personalScore",
    label: "Điểm cá nhân",
    icon: GrScorecard,
    allowedRoles: ["student"],
  },
  {
    path: "students",
    label: "Thông tin sinh viên",
    icon: IoMdInformationCircle,
    allowedRoles: ["advisor", "admin"],
  },
  {
    path: "department",
    label: "Quản lý phòng ban",
    icon: MdOutlineDashboardCustomize,
    allowedRoles: ["admin"],
  },
  {
    path: "advisorInfo",
    label: "Thông tin cố vấn",
    icon: SiInformatica,
    allowedRoles: ["admin"],
  },
  {
    path: "class",
    label: "Quản lý lớp học",
    icon: MdForum,
    allowedRoles: ["admin"],
  },
];
