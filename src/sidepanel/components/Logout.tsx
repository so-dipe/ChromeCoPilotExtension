/**
 * Logout.tsx
 * A lowly logout button
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import LogoutIcon from '@mui/icons-material/Logout';
import { Button } from "@mui/material";

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    chrome.storage.local.set({ isLoggedIn: false }, () => {
      navigate("/");
    });
  };

  return (
    <div>
      <Button variant="outlined" startIcon={<LogoutIcon />} onClick={handleLogout}>
        Logout
      </Button>
      {/* <button
        className="hover:bg-gray-200 p-3 border border-red-500 hover:shadow-lg rounded-xl font-bold text-red-500 hover:text-red-600"
        onClick={handleLogout}
      >
        Logout
      </button> */}
    </div>
  );
};

export default Logout;
