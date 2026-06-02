import React from "react";
import { Link } from "react-router-dom";
import lesTan from "../assets/lesTan.png";
import arrowdown from "../assets/arrowdown.png";

const NewTask: React.FC = () => {
  return (
    <div>
      <Link to="/" className="flex items-center gap-4 pt-10 ps-25">
        <img src={lesTan} alt="" className="w-3 h-5" />
        <h2 className="text-[25px] text-[#292929] font-semibold">New Task</h2>
      </Link>
      <fieldset className="w-330 h-20 ms-30 mt-10 ps-8 text-start border border-[#B8B6B6] rounded-md ">
        <legend className="text-[#9C9C9C] font-medium text-[18px]">
          Task Title
        </legend>
        <input
          type="text"
          placeholder="E.g Project Defense, Assignment ..."
          className="placeholder:text-[#CCCCCC] pt-2 w-200 placeholder:text-[16px]"
        />
      </fieldset>
      <fieldset className="w-330 h-60 ms-30 mt-10 ps-8 text-start border border-[#B8B6B6] rounded-md ">
        <legend className="text-[#9C9C9C] font-medium text-[18px]">
          Description
        </legend>
        <input
          type="text"
          placeholder="Briefly describe your task ..."
          className="placeholder:text-[#CCCCCC] pt-2 w-200 placeholder:text-[16px]"
        />
      </fieldset>
      <fieldset className="w-330 h-22 ms-30 mt-10 ps-8 text-start border border-[#B8B6B6] rounded-md ">
        <legend className="text-[#9C9C9C] font-medium text-[18px]">Tags</legend>
        <div className="flex items-center justify-between pe-10 pt-2">
          <div className="flex gap-6">
            <button className="bg-[#9C9C9C] py-1 px-4 rounded-sm flex items-center gap-2 font-normal text-[#CCCCCC] text-[14px]">
              Urgent
            </button>
            <button className="bg-[#9C9C9C] py-1 px-4 rounded-sm flex items-center gap-2 font-normal text-[#CCCCCC] text-[14px]">
              Important
            </button>
          </div>
          <img src={arrowdown} alt="" className="w-5 h-3" />
        </div>
      </fieldset>
      <div className="mt-15 mb-10 flex flex-col gap-5">
        <Link
          to="/MyTask"
          className="bg-[#974FD0] text-[18px] text-center text-[#FAF9FB] font-semibold py-3 rounded-md ms-30 me-20 pe-9"
        >
          Done
        </Link>
        <Link
          to="/NewTask"
          className="underline text-[#974FD0] text-[18px] font-semibold"
        >
          Back To Top
        </Link>
      </div>
    </div>
  );
};

export default NewTask;
