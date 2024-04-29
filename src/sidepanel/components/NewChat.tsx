/**
 * NewChat.tsx
 * A button for creating a new chat
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../hooks/chromeStorageHooks";
import "tailwindcss/tailwind.css";

const NewChat: React.FC = () => {
  const navigate = useNavigate();
  const user = useUserData();
  const handleNewChat = () => {
    const chatId = user.localId + Date.now();
    navigate(`/chat/${chatId}`);
  };
  return (
    <div>
      <button
        className="hover:bg-gray-200 p-3 hover:shadow-lg rounded-xl font-bold text-green-500 hover:text-green-600 border border-green-500"
        onClick={handleNewChat}
      >
        New Chat
      </button>
    </div>
  );
};

export default NewChat;
