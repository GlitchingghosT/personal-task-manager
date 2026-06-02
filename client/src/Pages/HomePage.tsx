import React from "react";
import homeimg from "../assets/HomeImg.png";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div>
      <div className="mt-20 px-20 flex items-start px-30">
        <div className="flex flex-col items-start gap-4  pt-10">
          <h1 className="font-semibold text-[#292929] text-[55px] pe-40 text-start leading-17">
            Manage your Tasks on{" "}
            <span className="text-[#974FD0]">TaskDuty</span>
          </h1>
          <p className="text-[#737171] font-medium text-[18px] text-start pe-72 text-start">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Non tellus,
            sapien, morbi ante nunc euismod ac felis ac. Massa et, at platea
            tempus duis non eget. Hendrerit tortor fermentum bibendum mi nisl
            semper porttitor. Nec accumsan.
          </p>
          <Link
            to="/MyTask"
            className="bg-[#974FD0] text-[#FAF9FB] text-[17px] py-2.5 px-6 rounded-lg hover:font-semibold hover:py-2.75"
          >
            Go to My Tasks
          </Link>
        </div>
        <img src={homeimg} alt="" className="w-200" />
      </div>
    </div>
  );
};

export default HomePage;
