/**
 * NewChat.tsx
 * A button for creating a new chat
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../hooks/chromeStorageHooks";
import { FiArrowRight } from "react-icons/fi";
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
      <div
        className="hover:bg-gray-200 flex flex-row justify-between items-center mb-5 py-2 px-5 hover:shadow-lg w-64 rounded-xl font-bold text-green-500 hover:text-green-600 border border-green-500"
        onClick={handleNewChat}
      >
        <p>Chat with CCP</p>
        <FiArrowRight />
      </div>
    </div>
  );
};

export default NewChat;
