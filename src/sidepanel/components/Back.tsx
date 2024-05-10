import React from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";

const Back: React.FC = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/profile");
  };
  return (
    <button
      className="flex items-center bg-transparent hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
      onClick={handleClick}
    >
      <IoIosArrowBack className="mr-2" /> Back
    </button>
  );
};

export default Back;
