import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import profile from "../assets/pro.img.png";

const Navbar: React.FC = () => {
  // const location = useLocation();
  // useState(() => {
  //   console.log(location.pathname);
  // });
  const allLinks = () => {
    return location.pathname === "/" ? (
      <>
        <Link
          to="/NewTask"
          className="text-[16px] text-[#292929] font-semibold cursor-pointer hover:text-[#974FD0] hover:text-[17px]"
        >
          New Task
        </Link>
        <Link
          to="/MyTask"
          className="text-[16px] text-[#292929] font-semibold cursor-pointer hover:text-[#974FD0] hover:text-[17px]"
        >
          All Tasks
        </Link>
      </>
    ) : location.pathname === "/MyTask" ? (
      <Link
        to="/NewTask"
        className="text-[16px] text-[#292929] font-semibold cursor-pointer hover:text-[#974FD0] hover:text-[17px]"
      >
        New Task
      </Link>
    ) : location.pathname === "/NewTask" ? (
      <Link
        to="/MyTask"
        className="text-[16px] text-[#292929] font-semibold cursor-pointer hover:text-[#974FD0] hover:text-[17px]"
      >
        All Tasks
      </Link>
    ) : location.pathname === "/EditTask" ? (
      <Link
        to="/MyTask"
        className="text-[16px] text-[#292929] font-semibold cursor-pointer hover:text-[#974FD0] hover:text-[17px]"
      >
        All Tasks
      </Link>
    ) : null;
  };
  return (
    <nav className=" w-full sticky z-5 border border-[#B8B6B6] py-5 px-25 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src={logo} alt="" className="w-6" />
        <Link
          to="/"
          className="text-[20px] text-[#2D0050] font-bold no-underline"
        >
          TaskDuty
        </Link>
      </div>
      <div className="flex items-center gap-10 relative">
        {/* <Link
          to="/NewTask"
          className="text-[16px] text-[#292929] font-semibold cursor-pointer hover:text-[#974FD0] hover:text-[17px]"
        >
          New Task
        </Link>
        <Link
          to="/MyTask"
          className="text-[16px] text-[#292929] font-semibold cursor-pointer hover:text-[#974FD0] hover:text-[17px]"
        >
          All Tasks
        </Link> */}
        {allLinks()}
        <img src={profile} alt="" className="w-11 z-1" />
      </div>
      <div className="h-4 w-4 rounded-full bg-[#974FD0] absolute z-10 top-5 right-25"></div>
    </nav>
  );
};

export default Navbar;
