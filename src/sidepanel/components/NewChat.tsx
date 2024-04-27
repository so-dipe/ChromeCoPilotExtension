/**
 * NewChat.tsx
 * A button for creating a new chat
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../hooks/chromeStorageHooks";

const NewChat: React.FC = () => {
    const navigate = useNavigate();
    const user = useUserData();
    const handleNewChat = () => {
        const chatId = user.localId + Date.now();
        navigate(`/chat/${chatId}`)
    };
  return (
    <div>
      <button onClick={handleNewChat}>New Chat</button>
    </div>
  );
};

export default NewChat;