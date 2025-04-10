import { GrScorecard } from "react-icons/gr";
import { MdForum } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { MdOutlineManageAccounts } from "react-icons/md";
import { FaRegListAlt } from "react-icons/fa";
import { ImProfile } from "react-icons/im";

import { Role } from "../types/auth";
import React from "react";

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
    allowedRoles: ["admin", "student", "advisor"],
  },
  {
    path: "profile",
    label: "Hồ sơ cá nhân",
    icon: ImProfile,
    allowedRoles: ["admin", "student", "advisor"],
  },
  {
    path: "personalScore",
    label: "Điểm cá nhân",
    icon: GrScorecard,
    allowedRoles: ["student"],
  },
  {
    path: "students",
    label: "Danh sách sinh viên",
    icon: FaRegListAlt,
    allowedRoles: ["advisor"],
  },
  {
    path: "users",
    label: "Quản lý người dùng",
    icon: MdOutlineManageAccounts,
    allowedRoles: ["admin"],
  },
];
