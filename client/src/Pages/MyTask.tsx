import React from "react";
import plus from "../assets/plus.png";
import edit from "../assets/edit.png";
import delet from "../assets/delete.png";
import { Link } from "react-router-dom";

const MyTask: React.FC = () => {
  return (
    <div>
      <div className="pt-10 px-25 flex justify-between">
        <h2 className="text-[25px] text-[#292929] font-semibold">My Tasks</h2>
        <Link to="/NewTask" className="flex items-center gap-3">
          <img src={plus} alt="" className="w-3" />
          <p className="text-[14px] text-[#974FD0] font-semibold hover:text-[15px] hover:underline">
            Add New Task
          </p>
        </Link>
      </div>
      <div className="border border-[#B8B6B6] mt-12 mb-5 mx-28 w-330 rounded-md">
        <div className="flex justify-between items-center py-5 px-5">
          <p className="font-semibold text-[#F38383] text-[16px]">Urgent</p>
          <div className="flex gap-5">
            <Link
              to="/EditTask"
              className="bg-[#974FD0] py-1.5 px-4 rounded-md flex items-center gap-2"
            >
              <img src={edit} alt="" className="w-4 h-4" />
              <p className="font-normal text-[#FAF9FB] text-[16px]">Edit</p>
            </Link>
            <button className="border border-[#974FD0] py-1.5 px-4 rounded-md flex items-center gap-2">
              <img src={delet} alt="" className="w-4 h-4" />
              <p className="font-normal text-[#974FD0] text-[16px]">Delete</p>
            </button>
          </div>
        </div>
        <hr className="border-[#B8B6B6]" />
        <div className="pt-3 pb-5 ps-4 flex flex-col gap-2">
          <h3 className="text-[20px] text-[#292929] text-start font-semibold">
            FinTech Website Update
          </h3>
          <p className="text-[#737171] font-medium text-[15px] text-start pe-72 text-start">
            FinTech Website Update Lorem ipsum dolor sit amet, consectetur
            adipiscing elit. Amet quis nibh posuere non tempor. Erat mattis
            gravida pulvinar nibh aliquam faucibus et magna. Interdum eu tempus
            ultricies cras neque mi. Eget tellus suspendisse et viverra.
          </p>
        </div>
      </div>
      <Link
        to="/MyTask"
        className="underline text-[#974FD0] text-[18px] font-semibold"
      >
        Back To Top
      </Link>
    </div>
  );
};

export default MyTask;
