/**
 * Logout.tsx
 * A lowly logout button
 */
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
        <button onClick={handleLogout}>Logout</button>
        </div>
    );
    };

export default Logout;
