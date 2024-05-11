/**
 * Logout.tsx
 * A cooler logout button with Tailwind CSS
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi"; // Importing an example icon from react-icons library

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    chrome.storage.local.set({ isLoggedIn: false }, () => {
      navigate("/");
    });
  };

  return (
    <div>
      <button
        className="flex items-center justify-center p-2 bg-red-500 rounded-br-lg text-white font-bold hover:bg-red-600 transition duration-300"
        onClick={handleLogout}
      >
        <FiLogOut className="w-4 h-4 mr-2" />
        Logout
      </button>
    </div>
  );
};

export default Logout;

{
  /* <button
        className="hover:bg-gray-200 p-3 border border-red-500 hover:shadow-lg rounded-xl font-bold text-red-500 hover:text-red-600"
        onClick={handleLogout}
      >
        Logout
      </button> */
}
