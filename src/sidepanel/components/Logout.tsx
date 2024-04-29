import React from "react";
import { useNavigate } from "react-router-dom";

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
        className="hover:bg-gray-200 p-3 border border-red-500 hover:shadow-lg rounded-xl font-bold text-red-500 hover:text-red-600"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default Logout;
