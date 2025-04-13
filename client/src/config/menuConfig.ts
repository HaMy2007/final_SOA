import { GrScorecard } from "react-icons/gr";
import { MdForum, MdOutlineScore } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { ImProfile } from "react-icons/im";
import { MdOutlineDashboardCustomize } from "react-icons/md";

import { Role } from "../types/auth";
import React from "react";
import { IoMdInformationCircle } from "react-icons/io";
import { SiInformatica } from "react-icons/si";

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
    path: "dashboard",
    label: "Dashboard",
    icon: MdOutlineDashboardCustomize,
    allowedRoles: ["advisor", "admin"],
  },
  {
    path: "advisorInfo",
    label: "Thông tin cố vấn",
    icon: SiInformatica,
    allowedRoles: ["admin"],
  },
];
